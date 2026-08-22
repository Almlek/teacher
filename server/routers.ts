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
  getExamVersions,
  createExamVersion,
  getQuestionBankByUserId,
  searchQuestionBank,
  getQuestionBankStats,
  createQuestionBankItem,
  deleteQuestionBankItem,
  deleteAllUserData,
} from "./db";
import { generateLessonPlan } from "./lessonGenerator";
import { generateExamFromLesson } from "./examGenerator";
import { generateExamFromImage } from "./imageExamGenerator";
import { storagePut } from "./storage";
import { decodeAndValidateLibraryFile } from "./libraryUpload";
import { extractLibraryText } from "./libraryExtract";

const examImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
        preferredType: z.enum(["mixed", "multiple_choice", "true_false", "essay"]).default("mixed"),
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
          preferredType: input.preferredType,
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
          imageUrl: z.string().max(2000).refine((value) => value.startsWith("/manus-storage/") || /^https?:\/\//.test(value), "رابط الصورة غير صالح").optional(),
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

    questionImageUpload: publicProcedure
      .input(z.object({
        fileName: z.string().min(1).max(500),
        fileType: z.string().min(1),
        fileData: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        if (!examImageTypes.has(input.fileType)) {
          throw new Error("ارفع صورة بصيغة JPG أو PNG أو WEBP أو GIF.");
        }
        const data = decodeAndValidateLibraryFile(input.fileData, input.fileType);
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-160) || "question-image";
        const uploaded = await storagePut(`${ctx.user.id}-exam-images/${Date.now()}-${safeName}`, data, input.fileType);
        return { url: uploaded.url, key: uploaded.key, fileName: input.fileName, fileType: input.fileType };
      }),

    questionDelete: publicProcedure
      .input(z.object({ id: z.number().int().positive(), examId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        return deleteExamQuestion(input.id, input.examId);
      }),

    versionsList: publicProcedure
      .input(z.object({ examId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) return [];
        return getExamVersions(input.examId, ctx.user.id);
      }),

    versionCreate: publicProcedure
      .input(z.object({
        examId: z.number().int().positive(),
        title: z.string().min(1),
        snapshotJson: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        return createExamVersion({
          examId: input.examId,
          userId: ctx.user.id,
          title: input.title,
          snapshotJson: input.snapshotJson,
        } as any);
      }),

    versionRestore: publicProcedure
      .input(z.object({
        examId: z.number().int().positive(),
        versionId: z.number().int().positive(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        const versions = await getExamVersions(input.examId, ctx.user.id);
        const target = versions.find((v) => v.id === input.versionId);
        if (!target) throw new Error("Version not found");
        
        const payload = JSON.parse(target.snapshotJson);
        if (payload.exam) {
          await updateExam(input.examId, ctx.user.id, {
            title: payload.exam.title,
            subject: payload.exam.subject,
            grade: payload.exam.grade,
            examType: payload.exam.examType,
            durationMinutes: payload.exam.durationMinutes,
            instructions: payload.exam.instructions,
            totalMarks: payload.exam.totalMarks,
          });
        }
        if (Array.isArray(payload.questions)) {
          await deleteExamQuestions(input.examId);
          for (const q of payload.questions) {
            await createExamQuestion({
              examId: input.examId,
              orderIndex: q.orderIndex ?? 0,
              questionType: q.questionType ?? "multiple_choice",
              prompt: q.prompt,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              imageUrl: q.imageUrl,
              marks: q.marks ?? 1,
            });
          }
        }
        return { success: true } as const;
      }),
  }),

  questionBank: router({
    analyzeImage: publicProcedure
      .input(z.object({
        imageData: z.string().min(20).max(14_000_000),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        title: z.string().max(255).optional(),
        subject: z.string().max(255).optional(),
        grade: z.string().max(100).optional(),
        questionCount: z.number().int().min(1).max(20).default(5),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        preferredType: z.enum(["mixed", "multiple_choice", "true_false", "short_answer", "essay"]).default("mixed"),
        language: z.enum(["ar", "en"]).default("ar"),
        aiModel: z.enum(["gemini-1.5-flash", "gemini-1.5-pro"]).default("gemini-1.5-flash"),
        tags: z.string().max(500).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const imageBuffer = decodeAndValidateLibraryFile(input.imageData, input.mimeType);
        const extension = input.mimeType.split("/")[1] === "jpeg" ? "jpg" : input.mimeType.split("/")[1];
        const stored = await storagePut(`${ctx.user.id}-image-analysis/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`, imageBuffer, input.mimeType);
        const assessment = await generateExamFromImage({ ...input, imageData: imageBuffer.toString("base64") });
        return { ...assessment, imageUrl: stored.url };
      }),

    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return getQuestionBankByUserId(ctx.user.id);
    }),

    search: publicProcedure
      .input(z.object({
        query: z.string().max(255).optional(),
        subject: z.string().max(100).optional(),
        grade: z.string().max(100).optional(),
        questionType: z.string().max(50).optional(),
        difficulty: z.string().max(30).optional(),
        tag: z.string().max(100).optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return searchQuestionBank(ctx.user.id, input);
      }),

    stats: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return { total: 0, bySubject: {}, byDifficulty: { easy: 0, medium: 0, hard: 0 }, byType: { multiple_choice: 0, true_false: 0, short_answer: 0, essay: 0 } };
      return getQuestionBankStats(ctx.user.id);
    }),

    importFromExam: publicProcedure
      .input(z.object({
        examId: z.number().int().positive(),
        questionIds: z.array(z.number().int().positive()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const exam = await getExamById(input.examId, ctx.user.id);
        if (!exam) throw new Error("Exam not found");
        const questions = await getExamQuestions(input.examId);
        const selected = input.questionIds?.length ? questions.filter((question) => input.questionIds!.includes(question.id)) : questions;
        for (const question of selected) {
          await createQuestionBankItem({
            userId: ctx.user.id,
            subject: exam.subject,
            grade: exam.grade,
            questionType: question.questionType,
            difficulty: "medium",
            prompt: question.prompt,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            imageUrl: question.imageUrl,
            marks: question.marks,
          } as any);
        }
        return { success: true, importedCount: selected.length } as const;
      }),

    create: publicProcedure
      .input(z.object({
        subject: z.string().max(255).optional(),
        grade: z.string().max(100).optional(),
        questionType: z.string().max(50).default("multiple_choice"),
        difficulty: z.string().max(30).default("medium"),
        prompt: z.string().min(1),
        options: z.string().optional(),
        correctAnswer: z.string().optional(),
        explanation: z.string().optional(),
        imageUrl: z.string().max(2000).optional(),
        tags: z.string().max(500).optional(),
        marks: z.number().int().positive().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return createQuestionBankItem({ userId: ctx.user.id, ...input } as any);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return deleteQuestionBankItem(input.id, ctx.user.id);
      }),
  }),

  backup: router({
    export: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const userId = ctx.user.id;
      const [lessons, library, exams, settings, questionBankItems] = await Promise.all([
        getLessonPlansByUserId(userId),
        getLibraryBooksByUserId(userId),
        getExamsByUserId(userId),
        getUserSettings(userId),
        getQuestionBankByUserId(userId),
      ]);
      const examQuestions = (await Promise.all(exams.map((exam) => getExamQuestions(exam.id)))).flat();
      const examVersions = (await Promise.all(exams.map((exam) => getExamVersions(exam.id, userId)))).flat();
      return { version: 2, exportedAt: new Date().toISOString(), lessons, library, exams, examQuestions, examVersions, questionBank: questionBankItems, settings };
    }),

    import: publicProcedure
      .input(z.object({
        lessons: z.array(z.object({ subject: z.string(), title: z.string() }).passthrough()).default([]),
        library: z.array(z.object({ title: z.string() }).passthrough()).default([]),
        exams: z.array(z.object({ title: z.string() }).passthrough()).default([]),
        examQuestions: z.array(z.object({ examId: z.number(), prompt: z.string() }).passthrough()).default([]),
        examVersions: z.array(z.object({ examId: z.number(), title: z.string(), snapshotJson: z.string() }).passthrough()).default([]),
        questionBank: z.array(z.object({ prompt: z.string(), tags: z.string().optional().nullable() }).passthrough()).default([]),
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
        for (const version of input.examVersions) {
          const newExamId = examIdMap.get(Number(version.examId));
          if (!newExamId) continue;
          const { id, examId, userId, createdAt, versionNumber, ...versionData } = version as any;
          await createExamVersion({ examId: newExamId, userId: ctx.user.id, versionNumber: versionNumber || 1, ...versionData } as any);
        }
        for (const item of input.questionBank) {
          const { id, userId, createdAt, updatedAt, ...questionData } = item as any;
          await createQuestionBankItem({ userId: ctx.user.id, ...questionData } as any);
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

    logoUpload: publicProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        fileType: z.enum(["image/png", "image/jpeg", "image/webp"]),
        fileData: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const data = decodeAndValidateLibraryFile(input.fileData, input.fileType);
        if (data.length > 5 * 1024 * 1024) throw new Error("يجب ألا يتجاوز حجم الشعار 5 ميجابايت");
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "school-logo";
        const uploaded = await storagePut(`${ctx.user.id}-school-branding/${Date.now()}-${safeName}`, data, input.fileType);
        await upsertUserSettings(ctx.user.id, { schoolLogoUrl: uploaded.url });
        return { url: uploaded.url, key: uploaded.key };
      }),
  }),
});

export type AppRouter = typeof appRouter;
