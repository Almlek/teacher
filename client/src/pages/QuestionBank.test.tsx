// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserverMock }).ResizeObserver = ResizeObserverMock;

const mocks = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(), isPending: false },
  analyzeImage: { mutateAsync: vi.fn(), isPending: false },
  importFromExam: { mutateAsync: vi.fn(), isPending: false },
  delete: { mutateAsync: vi.fn(), isPending: false },
  exams: [{ id: 77, title: "اختبار العلوم" }],
  list: [
    { id: 1, subject: "العلوم", grade: "السادس", questionType: "true_false", difficulty: "easy", prompt: "الماء سائل.", options: null, correctAnswer: "صح", explanation: null, imageUrl: null, tags: "مراجعة", marks: 1 },
    { id: 2, subject: "الرياضيات", grade: "السادس", questionType: "essay", difficulty: "hard", prompt: "اشرح الكسور.", options: null, correctAnswer: null, explanation: null, imageUrl: null, tags: "فصل أول", marks: 2 },
  ],
}));

vi.mock("@/components/PublicNav", () => ({ default: () => <nav>التنقل</nav> }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ questionBank: { list: { invalidate: vi.fn() }, search: { invalidate: vi.fn() }, stats: { invalidate: vi.fn() } } }),
    exams: { list: { useQuery: () => ({ data: mocks.exams, isLoading: false }) } },
    questionBank: {
      list: { useQuery: () => ({ data: mocks.list, isLoading: false }) },
      search: { useQuery: (input: { query?: string; tag?: string }) => {
        let res = mocks.list;
        if (input.query) res = res.filter((item) => item.prompt.includes(input.query!));
        if (input.tag && input.tag !== "all") res = res.filter((item) => item.tags?.includes(input.tag!));
        return { data: res, isLoading: false };
      } },
      stats: { useQuery: () => ({ data: { total: 2, bySubject: { العلوم: 1, الرياضيات: 1 }, byDifficulty: { easy: 1, medium: 0, hard: 1 }, byType: { multiple_choice: 0, true_false: 1, short_answer: 0, essay: 1 } }, isLoading: false, isError: false }) },
      create: { useMutation: () => mocks.create },
      analyzeImage: { useMutation: () => mocks.analyzeImage },
      importFromExam: { useMutation: () => mocks.importFromExam },
      delete: { useMutation: () => mocks.delete },
    },
  },
}));

import QuestionBank from "./QuestionBank";

describe("question bank UI", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("analyzes an uploaded image and saves a generated question after review", async () => {
    mocks.analyzeImage.mutateAsync.mockResolvedValueOnce({
      title: "دورة الماء",
      visualSummary: "مخطط يوضح مراحل الدورة.",
      learningObjectives: ["تمييز التبخر"],
      assessmentNotes: "راجع ارتباط السؤال بالمخطط.",
      imageUrl: "/manus-storage/1-image-analysis/water.png",
      questions: [{ questionType: "multiple_choice", prompt: "ما المرحلة الأولى؟", options: ["التبخر", "الهطول"], correctAnswer: "التبخر", explanation: "لأنه يبدأ الدورة.", marks: 2, tags: "علوم, صورة" }],
    });
    render(<QuestionBank />);
    const file = new File([new Uint8Array([137, 80, 78, 71])], "water.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("الصورة التعليمية"), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText("الصورة جاهزة للتحليل")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "تحليل الصورة وتوليد المسودة" }));
    await waitFor(() => expect(screen.getByText("ما المرحلة الأولى؟")).toBeTruthy());
    expect(mocks.analyzeImage.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ mimeType: "image/png", questionCount: 5 }));
    fireEvent.click(screen.getByRole("button", { name: "حفظ في البنك" }));
    await waitFor(() => expect(mocks.create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ prompt: "ما المرحلة الأولى؟", imageUrl: "/manus-storage/1-image-analysis/water.png", tags: "علوم, صورة" })));
  });

  it("adds a reusable question and filters the visible bank", async () => {
    render(<QuestionBank />);
    expect(screen.getByRole("heading", { name: "إحصائيات بنك الأسئلة" })).toBeTruthy();
    expect(screen.getByText("حسب المادة")).toBeTruthy();
    expect(screen.getByText("مستوى الصعوبة")).toBeTruthy();
    expect(screen.getByText("نوع التقييم")).toBeTruthy();
    expect(screen.getByText("الماء سائل.")).toBeTruthy();
    expect(screen.getByText("اشرح الكسور.")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("ابحث في نص السؤال..."), { target: { value: "الكسور" } });
    expect(screen.queryByText("الماء سائل.")).toBeNull();
    expect(screen.getByText("اشرح الكسور.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText("نص السؤال *"), { target: { value: "عرّف التبخر." } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ في بنك الأسئلة" }));
    expect(mocks.create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ prompt: "عرّف التبخر.", difficulty: "medium" }));

    fireEvent.change(screen.getByPlaceholderText("ابحث في نص السؤال..."), { target: { value: "" } });
    mocks.importFromExam.mutateAsync.mockResolvedValueOnce({ success: true, importedCount: 2 });
    fireEvent.click(screen.getByRole("combobox", { name: "الاختبار المراد استيراد أسئلته" }));
    fireEvent.click(screen.getByText("اختبار العلوم"));
    fireEvent.click(screen.getByRole("button", { name: "استيراد الأسئلة" }));
    expect(mocks.importFromExam.mutateAsync).toHaveBeenCalledWith({ examId: 77 });
  });
});
