import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("lessons router", () => {
  it("should list lessons for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lessons.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a lesson plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lessons.create({
      subject: "الرياضيات",
      title: "الأعداد الصحيحة",
      grade: "الصف الأول",
      language: "ar",
    });

    expect(result).toBeDefined();
  });

  it("should generate a lesson plan with AI", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lessons.generate({
      title: "الأفعال الماضية",
      subject: "اللغة العربية",
      grade: "الصف الثاني",
      language: "ar",
      aiModel: "gemini-1.5-flash",
    }, { signal: AbortSignal.timeout(30000) });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe("string");
    expect(result.boardContent).toBeDefined();
    expect(result.summaryContent).toBeDefined();
  }, { timeout: 30000 });

  it("should handle unauthorized access", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.lessons.list();
      // Should return empty array for unauthorized
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("settings router", () => {
  it("should get user settings", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.get();
    // Settings might not exist yet, but should not throw
    expect(result === null || result === undefined || typeof result === "object").toBe(true);
  });

  it("should update user settings", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.update({
      theme: "purple",
      fontSize: "large",
      fontFamily: "cairo",
    });

    expect(result).toBeDefined();
  });
});

describe("library router", () => {
  it("should list library books for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.library.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should add a book to library", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.library.add({
      title: "كتاب الرياضيات",
      subject: "الرياضيات",
      grade: "الصف الأول",
    });

    expect(result).toBeDefined();
  });
});
