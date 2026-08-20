import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createLessonPlan,
  getLessonPlansByUserId,
  getLessonPlanById,
  updateLessonPlan,
  deleteLessonPlan,
  addLibraryBook,
  getLibraryBooksByUserId,
  deleteLibraryBook,
  getUserSettings,
  upsertUserSettings,
  getExamsByUserId,
  createExam,
  getExamById,
  updateExam,
  deleteExam,
  getExamQuestions,
  createExamQuestion,
  deleteExamQuestions,
  deleteExamQuestion,
  deleteAllUserData,
} from "./db";
import { generateLessonPlan } from "./lessonGenerator";
import { generateExamFromLesson } from "./examGenerator";
import { storagePut } from "./storage";
import { decodeAndValidateLibraryFile } from "./libraryUpload";
import { extractLibraryText } from "./libraryExtract";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  lessons: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getLessonPlansByUserId(ctx.user.id);
    }),

    create: publicProcedure
      .input(z.object({
        school: z.string().optional(),
        teacher: z.string().optional(),
        subject: z.string(),
        grade: z.string().optional(),
        section: z.string().optional(),
        date: z.string().optional(),
        period: z.string().optional(),
        title: z.string(),
        language: z.string().optional().default("ar"),
        contentSource: z.string().optional().default("title"),
        aiModel: z.string().optional().default("gemini-1.5-flash"),
        content: z.string().optional(),
        boardContent: z.string().optional(),
        summaryContent: z.string().optional(),
        mindMapContent: z.string().optional(),
        assessmentContent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createLessonPlan({
          userId: ctx.user.id,
          ...input,
        } as any);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return null;
        return getLessonPlanById(input.id, ctx.user.id);
      }),

    update: publicProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({}).passthrough(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return updateLessonPlan(input.id, ctx.user.id, input.updates as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteLessonPlan(input.id, ctx.user.id);
      }),

    generate: publicProcedure
      .input(z.object({
        title: z.string(),
        subject: z.string(),
        grade: z.string().optional(),
        content: z.string().optional(),
        language: z.enum(["ar", "en"]).default("ar"),
        aiModel: z.enum(["gemini-1.5-flash", "gemini-1.5-pro"]).default("gemini-1.5-flash"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        try {
          const generated = await generateLessonPlan(input);
          return generated;
        } catch (error) {
          console.error("Generation error:", error);
          throw new Error("Failed to generate lesson plan");
        }
      }),
  }),

  library: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getLibraryBooksByUserId(ctx.user.id);
    }),

    add: publicProcedure
      .input(z.object({
        title: z.string(),
        fileName: z.string().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        fileSize: z.number().optional(),
        fileType: z.string().optional(),
        subject: z.string().optional(),
        grade: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return addLibraryBook({
          userId: ctx.user.id,
          ...input,
        } as any);
      }),

    upload: publicProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        fileName: z.string().min(1).max(500),
        fileType: z.string().min(1),
        fileData: z.string().min(1),
        subject: z.string().max(255).optional(),
        grade: z.string().max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const data = decodeAndValidateLibraryFile(input.fileData, input.fileType);
        const extracted = await extractLibraryText(data, input.fileType);

        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-180) || "resource";
        const uploaded = await storagePut(`${ctx.user.id}-library/${safeName}`, data, input.fileType);
        return addLibraryBook({
          userId: ctx.user.id,
          title: input.title,
          fileName: input.fileName,
          fileUrl: uploaded.url,
          fileKey: uploaded.key,
          fileSize: data.length,
          fileType: input.fileType,
          extractedText: extracted.extractedText,
          tocText: extracted.tocText,
          subject: input.subject,
          grade: input.grade,
        });
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteLibraryBook(input.id, ctx.user.id);
      }),
  }),

  exams: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getExamsByUserId(ctx.user.id);
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return null;
        const exam = await getExamById(input.id, ctx.user.id);
        if (!exam) return null;
        const questions = await getExamQuestions(input.id);
        return { exam, questions };
      }),

    generateFromLesson: publicProcedure
      .input(z.object({
        lessonId: z.number().int().positive(),
        examType: z.enum(["comprehensive", "formal", "electronic"]).default("comprehensive"),
        questionCount: z.number().int().min(3).max(30).default(10),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        language: z.enum(["ar", "en"]).default("ar"),
        aiModel: z.enum(["gemini-1.5-flash", "gemini-1.5-pro"]).default("gemini-1.5-flash"),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const lesson = await getLessonPlanById(input.lessonId, ctx.user.id);
        if (!lesson) throw new Error("Lesson not found");
        const source = [lesson.content, lesson.boardContent, lesson.summaryContent, lesson.mindMapContent, lesson.assessmentContent]
          .filter((value): value is string => Boolean(value?.trim()))
          .join("\n\n");
        if (!source.trim()) throw new Error("لا يوجد محتوى كافٍ في الدرس لتوليد الاختبار.");

        const generated = await generateExamFromLesson({
          title: lesson.title,
          subject: lesson.subject ?? undefined,
          grade: lesson.grade ?? undefined,
          content: source,
          examType: input.examType,
          questionCount: input.questionCount,
          difficulty: input.difficulty,
          language: input.language,
          aiModel: input.aiModel,
        });
        const totalMarks = generated.questions.reduce((sum, question) => sum + question.marks, 0);
        const created = await createExam({
          userId: ctx.user.id,
          title: generated.title,
          subject: lesson.subject,
          grade: lesson.grade,
          examType: input.examType,
          instructions: generated.instructions,
          examContent: generated.summary,
          summaryContent: generated.summary,
          totalMarks,
          sourceLessonId: lesson.id,
        } as any);
        if (!created.id) throw new Error("تعذر حفظ الاختبار المولد.");
        for (let index = 0; index < generated.questions.length; index += 1) {
          const question = generated.questions[index];
          await createExamQuestion({
            examId: created.id,
            orderIndex: index,
            questionType: question.questionType,
            prompt: question.prompt,
            options: question.options.length ? JSON.stringify(question.options) : undefined,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            marks: question.marks,
          });
        }
        return { examId: created.id, title: generated.title, questionCount: generated.questions.length };
      }),

    create: publicProcedure
      .input(z.object({
        title: z.string().min(1).max(500),
        subject: z.string().max(255).optional(),
        grade: z.string().max(100).optional(),
        examType: z.string().max(50).default("comprehensive"),
        instructions: z.string().optional(),
        examContent: z.string().optional(),
        summaryContent: z.string().optional(),
        durationMinutes: z.number().int().positive().optional(),
        totalMarks: z.number().int().nonnegative().default(0),
        sourceLessonId: z.number().int().positive().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createExam({ userId: ctx.user.id, ...input } as any);
      }),

    update: publicProcedure
      .input(z.object({ id: z.number(), updates: z.object({}).passthrough() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return updateExam(input.id, ctx.user.id, input.updates as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteExam(input.id, ctx.user.id);
      }),

    questionCreate: publicProcedure
      .input(z.object({
        examId: z.number().int().positive(),
        orderIndex: z.number().int().nonnegative().default(0),
        questionType: z.string().max(50).default("multiple_choice"),
        prompt: z.string().min(1),
        options: z.string().optional(),
        correctAnswer: z.string().optional(),
        explanation: z.string().optional(),
        marks: z.number().int().positive().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        return createExamQuestion(input as any);
      }),

    questionsReplace: publicProcedure
      .input(z.object({
        examId: z.number().int().positive(),
        questions: z.array(z.object({
          orderIndex: z.number().int().nonnegative(),
          questionType: z.string().max(50),
          prompt: z.string().min(1),
          options: z.string().optional(),
          correctAnswer: z.string().optional(),
          explanation: z.string().optional(),
          marks: z.number().int().positive(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        await deleteExamQuestions(input.examId);
        for (const question of input.questions) {
          await createExamQuestion({ examId: input.examId, ...question });
        }
        return { success: true } as const;
      }),

    questionDelete: publicProcedure
      .input(z.object({ id: z.number().int().positive(), examId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        return deleteExamQuestion(input.id, input.examId);
      }),
  }),

  backup: router({
    export: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const [lessons, library, exams, settings] = await Promise.all([
        getLessonPlansByUserId(ctx.user.id),
        getLibraryBooksByUserId(ctx.user.id),
        getExamsByUserId(ctx.user.id),
        getUserSettings(ctx.user.id),
      ]);
      const examQuestions = (await Promise.all(exams.map((exam) => getExamQuestions(exam.id)))).flat();
      return { version: 1, exportedAt: new Date().toISOString(), lessons, library, exams, examQuestions, settings };
    }),

    import: publicProcedure
      .input(z.object({
        lessons: z.array(z.object({ subject: z.string(), title: z.string() }).passthrough()).default([]),
        library: z.array(z.object({ title: z.string() }).passthrough()).default([]),
        exams: z.array(z.object({ title: z.string() }).passthrough()).default([]),
        examQuestions: z.array(z.object({ examId: z.number(), prompt: z.string() }).passthrough()).default([]),
        settings: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        for (const lesson of input.lessons) {
          const { id, userId, createdAt, updatedAt, ...lessonData } = lesson as any;
          await createLessonPlan({ userId: ctx.user.id, ...lessonData } as any);
        }
        for (const book of input.library) {
          const { id, userId, createdAt, updatedAt, ...bookData } = book as any;
          await addLibraryBook({ userId: ctx.user.id, ...bookData } as any);
        }
        const examIdMap = new Map<number, number>();
        for (const exam of input.exams) {
          const { id, userId, createdAt, updatedAt, ...examData } = exam as any;
          const created = await createExam({ userId: ctx.user.id, ...examData } as any);
          if (id && created.id) examIdMap.set(Number(id), created.id);
        }
        for (const question of input.examQuestions) {
          const newExamId = examIdMap.get(Number(question.examId));
          if (!newExamId) continue;
          const { id, examId, createdAt, updatedAt, ...questionData } = question as any;
          await createExamQuestion({ examId: newExamId, ...questionData } as any);
        }
        if (input.settings) await upsertUserSettings(ctx.user.id, input.settings as any);
        return { success: true } as const;
      }),

    deleteAll: publicProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return deleteAllUserData(ctx.user.id);
    }),
  }),

  settings: router({
    get: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return getUserSettings(ctx.user.id);
    }),

    update: publicProcedure
      .input(z.object({}).passthrough())
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const { userId, ...settingsData } = input;
        return upsertUserSettings(ctx.user.id, settingsData as any);
      }),
  }),
});

export type AppRouter = typeof appRouter;
