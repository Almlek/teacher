// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  upload: { mutateAsync: vi.fn(), isPending: false },
  create: { mutateAsync: vi.fn(), isPending: false },
  update: { mutateAsync: vi.fn(), isPending: false },
  replace: { mutateAsync: vi.fn(), isPending: false },
  examData: { exam: { id: 1, title: "اختبار الصور", subject: "العلوم", grade: "السادس", examType: "comprehensive", durationMinutes: null, instructions: "أجب.", totalMarks: 1 }, questions: [{ orderIndex: 0, questionType: "multiple_choice", prompt: "ما هذا الرسم؟", options: "", correctAnswer: "", explanation: "", imageUrl: null, marks: 1 }] },
}));

vi.mock("@/components/PublicNav", () => ({ default: () => <nav>التنقل</nav> }));
vi.mock("@/components/ExamExportActions", () => ({ default: () => <div>إجراءات التصدير</div> }));
vi.mock("@/components/ExamPrintPreview", () => ({ default: () => <div>المعاينة</div> }));
vi.mock("@/components/QuestionOrderControls", () => ({ default: () => <div>ترتيب الأسئلة</div> }));
vi.mock("@/components/LoadingState", () => ({ default: () => <div>تحميل</div> }));
vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
  useLocation: () => ["/exam-editor", vi.fn()] as const,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    settings: { get: { useQuery: () => ({ data: null }) } },
    exams: {
      get: { useQuery: () => ({ data: mocks.examData, isLoading: false }) },
      create: { useMutation: () => mocks.create },
      update: { useMutation: () => mocks.update },
      questionsReplace: { useMutation: () => mocks.replace },
      questionImageUpload: { useMutation: () => mocks.upload },
    },
  },
}));

import ExamEditor from "./ExamEditor";

describe("exam editor question illustrations", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("uploads and previews an illustration for a question", async () => {
    window.history.pushState({}, "", "/exam-editor?examId=1");
    mocks.upload.mutateAsync.mockResolvedValueOnce({ url: "/manus-storage/1-exam-images/diagram.png" });
    const { container } = render(<ExamEditor />);
    await waitFor(() => expect(screen.getByText("ما هذا الرسم؟")).toBeTruthy());

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["image-bytes"], "diagram.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mocks.upload.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ fileName: "diagram.png", fileType: "image/png" })));
    expect(await screen.findByAltText("رسم توضيحي للسؤال 1")).toBeTruthy();
  });
});
