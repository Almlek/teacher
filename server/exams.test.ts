import { describe, expect, it, vi } from "vitest";
import { generateExamFromLesson } from "./examGenerator";

vi.mock("./examGenerator", () => ({ generateExamFromLesson: vi.fn() }));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));
import { storagePut } from "./storage";
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
        imageUrl: "/manus-storage/exam-images/fraction.png",
        marks: 2,
      }],
    });

    const result = await caller.exams.get({ id: created.id });
    expect(result?.exam.summaryContent).toBe("اختبار قصير");
    expect(result?.questions).toHaveLength(1);
    expect(result?.questions[0]?.correctAnswer).toBe("ب");
    expect(result?.questions[0]?.imageUrl).toBe("/manus-storage/exam-images/fraction.png");

    const backup = await caller.backup.export();
    expect(backup.examQuestions.some((question) => question.examId === created.id)).toBe(true);
  });

  it("uploads a validated question image and returns its storage URL", async () => {
    vi.mocked(storagePut).mockResolvedValueOnce({ key: "1-exam-images/diagram.png", url: "/manus-storage/1-exam-images/diagram.png" });
    const caller = appRouter.createCaller(createAuthContext());
    const pngData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const uploaded = await caller.exams.questionImageUpload({ fileName: "diagram.png", fileType: "image/png", fileData: pngData });
    expect(uploaded.url).toBe("/manus-storage/1-exam-images/diagram.png");
    expect(vi.mocked(storagePut)).toHaveBeenCalledWith(expect.stringContaining("1-exam-images/"), expect.any(Buffer), "image/png");
  });

  it("rejects non-image question uploads", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(caller.exams.questionImageUpload({ fileName: "lesson.pdf", fileType: "application/pdf", fileData: "JVBERi0=" })).rejects.toThrow("ارفع صورة");
  });

  it("generates and saves an exam from a selected lesson", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const sourceTitle = `درس التوليد الذكي ${Date.now()}`;
    await caller.lessons.create({
      title: sourceTitle,
      subject: "العلوم",
      grade: "السادس",
      content: "الماء يتغير بين الحالات الثلاث حسب درجة الحرارة.",
      boardContent: "الحالات الثلاث للماء",
      summaryContent: "ملخص عن حالات المادة",
    });
    const lesson = (await caller.lessons.list()).find((item) => item.title === sourceTitle);
    expect(lesson?.id).toBeGreaterThan(0);

    vi.mocked(generateExamFromLesson).mockResolvedValueOnce({
      title: "اختبار حالات الماء",
      instructions: "أجب عن الأسئلة.",
      summary: "اختبار مولد من الدرس.",
      questions: [{
        questionType: "multiple_choice",
        prompt: "ما حالات الماء؟",
        options: ["صلبة", "سائلة", "غازية", "جميع ما سبق"],
        correctAnswer: "جميع ما سبق",
        explanation: "للماء ثلاث حالات شائعة.",
        marks: 2,
      }],
    });

    const generated = await caller.exams.generateFromLesson({ lessonId: lesson!.id, questionCount: 5, difficulty: "hard", preferredType: "essay", examType: "comprehensive", language: "ar", aiModel: "gemini-1.5-flash" });
    expect(generated.examId).toBeGreaterThan(0);
    expect(generated.questionCount).toBe(1);
    const detail = await caller.exams.get({ id: generated.examId });
    expect(detail?.exam.sourceLessonId).toBe(lesson!.id);
    expect(detail?.questions[0]?.prompt).toBe("ما حالات الماء؟");
    expect(detail?.questions[0]?.options).toContain("جميع ما سبق");
    expect(vi.mocked(generateExamFromLesson)).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining("الماء"), difficulty: "hard", preferredType: "essay" }));
  });

  it("creates and restores an exam version, then manages a reusable bank question", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const created = await caller.exams.create({ title: "اختبار الإصدارات", subject: "العلوم", grade: "السادس", totalMarks: 1 });
    await caller.exams.questionsReplace({ examId: created.id, questions: [{ orderIndex: 0, questionType: "true_false", prompt: "الماء سائل.", options: "", correctAnswer: "صح", explanation: "", marks: 1 }] });
    const version = await caller.exams.versionCreate({
      examId: created.id,
      title: "اختبار الإصدارات",
      snapshotJson: JSON.stringify({ exam: { title: "اختبار الإصدارات", subject: "العلوم", grade: "السادس", examType: "comprehensive", instructions: "", totalMarks: 1 }, questions: [{ orderIndex: 0, questionType: "true_false", prompt: "الماء سائل.", options: "", correctAnswer: "صح", explanation: "", marks: 1 }] }),
    });
    expect(version).toBeTruthy();
    await caller.exams.questionsReplace({ examId: created.id, questions: [{ orderIndex: 0, questionType: "essay", prompt: "سؤال مؤقت.", options: "", correctAnswer: "", explanation: "", marks: 2 }] });
    const versions = await caller.exams.versionsList({ examId: created.id });
    expect(versions.length).toBeGreaterThan(0);
    await caller.exams.versionRestore({ examId: created.id, versionId: versions[0]!.id });
    const restored = await caller.exams.get({ id: created.id });
    expect(restored?.questions[0]?.prompt).toBe("الماء سائل.");

    const bankItem = await caller.questionBank.create({ subject: "العلوم", grade: "السادس", questionType: "true_false", difficulty: "easy", prompt: "الماء سائل.", correctAnswer: "صح", tags: "فصل أول, مهم", marks: 1 });
    const bank = await caller.questionBank.list();
    expect(bank.some((item) => item.prompt === "الماء سائل." && item.tags === "فصل أول, مهم")).toBe(true);
    const searched = await caller.questionBank.search({ query: "الماء", tag: "مهم" });
    expect(searched.some((item) => item.prompt === "الماء سائل.")).toBe(true);
    const imported = await caller.questionBank.importFromExam({ examId: created.id, questionIds: [restored!.questions[0]!.id] });
    expect(imported.importedCount).toBe(1);
    for (const item of (await caller.questionBank.list()).filter((candidate) => candidate.prompt === "الماء سائل." && candidate.subject === "العلوم" && candidate.grade === "السادس")) {
      await caller.questionBank.delete({ id: item.id });
    }
    if ("insertId" in (bankItem as object)) {
      // The list assertion above verifies persistence even when the driver omits insertId.
    }
  });

  it("returns a backup payload with the required collections", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const backup = await caller.backup.export();
    expect(backup.version).toBe(2);
    expect(Array.isArray(backup.lessons)).toBe(true);
    expect(Array.isArray(backup.library)).toBe(true);
    expect(Array.isArray(backup.exams)).toBe(true);
    expect(Array.isArray(backup.examQuestions)).toBe(true);
    expect(Array.isArray(backup.examVersions)).toBe(true);
    expect(Array.isArray(backup.questionBank)).toBe(true);
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
