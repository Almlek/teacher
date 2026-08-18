import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "exam-test-user",
    email: "exam@example.com",
    name: "Exam Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("exams router", () => {
  it("creates an exam and replaces its questions", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const created = await caller.exams.create({
      title: "اختبار الوحدة الأولى",
      subject: "الرياضيات",
      grade: "الصف السادس",
      examType: "comprehensive",
      examContent: "السؤال الأول",
      summaryContent: "اختبار قصير",
      totalMarks: 2,
    });

    expect(created.id).toBeGreaterThan(0);
    await caller.exams.questionsReplace({
      examId: created.id,
      questions: [{
        orderIndex: 0,
        questionType: "multiple_choice",
        prompt: "ما ناتج 2 + 2؟",
        options: "أ) 3 | ب) 4",
        correctAnswer: "ب",
        explanation: "لأن 2 + 2 = 4",
        marks: 2,
      }],
    });

    const result = await caller.exams.get({ id: created.id });
    expect(result?.exam.summaryContent).toBe("اختبار قصير");
    expect(result?.questions).toHaveLength(1);
    expect(result?.questions[0]?.correctAnswer).toBe("ب");

    const backup = await caller.backup.export();
    expect(backup.examQuestions.some((question) => question.examId === created.id)).toBe(true);
  });

  it("returns a backup payload with the required collections", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const backup = await caller.backup.export();
    expect(backup.version).toBe(1);
    expect(Array.isArray(backup.lessons)).toBe(true);
    expect(Array.isArray(backup.library)).toBe(true);
    expect(Array.isArray(backup.exams)).toBe(true);
    expect(Array.isArray(backup.examQuestions)).toBe(true);
  });

  it("restores an exam together with its questions from a backup", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await caller.backup.import({
      lessons: [],
      library: [],
      exams: [{ id: 99123, title: "اختبار مستعاد", subject: "العلوم", examType: "formal", totalMarks: 1 }],
      examQuestions: [{ examId: 99123, orderIndex: 0, questionType: "true_false", prompt: "الماء سائل في درجة حرارة الغرفة", correctAnswer: "صح", marks: 1 }],
    });
    const exams = await caller.exams.list();
    const restored = exams.find((exam) => exam.title === "اختبار مستعاد");
    expect(restored?.id).toBeGreaterThan(0);
    const detail = await caller.exams.get({ id: restored!.id });
    expect(detail?.questions).toHaveLength(1);
    expect(detail?.questions[0]?.prompt).toContain("الماء");
  });
});
