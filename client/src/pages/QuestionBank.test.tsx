// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(), isPending: false },
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
    useUtils: () => ({ questionBank: { list: { invalidate: vi.fn() }, search: { invalidate: vi.fn() } } }),
    exams: { list: { useQuery: () => ({ data: mocks.exams, isLoading: false }) } },
    questionBank: {
      list: { useQuery: () => ({ data: mocks.list, isLoading: false }) },
      search: { useQuery: (input: { query?: string; tag?: string }) => {
        let res = mocks.list;
        if (input.query) res = res.filter((item) => item.prompt.includes(input.query!));
        if (input.tag && input.tag !== "all") res = res.filter((item) => item.tags?.includes(input.tag!));
        return { data: res, isLoading: false };
      } },
      create: { useMutation: () => mocks.create },
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

  it("adds a reusable question and filters the visible bank", async () => {
    render(<QuestionBank />);
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
