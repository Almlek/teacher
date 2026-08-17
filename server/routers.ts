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
} from "./db";
import { generateLessonPlan } from "./lessonGenerator";
import { storagePut } from "./storage";
import { decodeAndValidateLibraryFile } from "./libraryUpload";

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
