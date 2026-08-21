// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/examExport", async () => {
  const actual = await vi.importActual<typeof import("@/lib/examExport")>("@/lib/examExport");
  return { ...actual, downloadExamAsWord: vi.fn() };
});

import ExamExportActions from "./ExamExportActions";

const exam = {
  title: "اختبار الرياضيات",
  subject: "الرياضيات",
  grade: "السادس",
  examType: "comprehensive",
  instructions: "أجب عن الأسئلة.",
  totalMarks: 2,
  questions: [{ orderIndex: 0, questionType: "multiple_choice", prompt: "ما ناتج 2 + 2؟", options: "أ) 3 | ب) 4", correctAnswer: "ب", explanation: "", marks: 2 }],
};

describe("ExamExportActions", () => {
  beforeEach(() => {
    document.title = "محرر الاختبار";
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders PDF and Word export actions", () => {
    render(<ExamExportActions exam={exam} />);
    expect(screen.getByRole("button", { name: "تصدير PDF" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "تصدير Word" })).toBeTruthy();
  });

  it("opens print and restores the title after afterprint", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<ExamExportActions exam={exam} />);
    fireEvent.click(screen.getByRole("button", { name: "تصدير PDF" }));
    expect(print).toHaveBeenCalledOnce();
    expect(document.title).toBe("اختبار الرياضيات - اختبار تعليمي");
    fireEvent(window, new Event("afterprint"));
    expect(document.title).toBe("محرر الاختبار");
  });
});
