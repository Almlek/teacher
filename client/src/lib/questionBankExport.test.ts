// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { buildQuestionBankCsv, buildQuestionBankPrintDocument, printQuestionBankAsPdf, type QuestionBankExportItem } from "./questionBankExport";

const items: QuestionBankExportItem[] = [{
  id: 1,
  subject: "العلوم",
  grade: "السادس",
  questionType: "multiple_choice",
  difficulty: "easy",
  prompt: "ما دورة الماء؟",
  options: JSON.stringify(["التبخر", "التجمد"]),
  correctAnswer: "التبخر",
  explanation: "شرح، مهم",
  imageUrl: "/manus-storage/water.png",
  tags: "مراجعة, صورة",
  marks: 2,
}];

describe("question bank exports", () => {
  it("builds an Arabic CSV with escaped fields and image references", () => {
    const csv = buildQuestionBankCsv(items);
    expect(csv.startsWith("\ufeff" )).toBe(true);
    expect(csv).toContain("رقم");
    expect(csv).toContain("اختيار من متعدد");
    expect(csv).toContain('"شرح، مهم"');
    expect(csv).toContain("/manus-storage/water.png");
  });

  it("builds an RTL print document containing the filtered question and image", () => {
    const html = buildQuestionBankPrintDocument(items, "أسئلة العلوم");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("أسئلة العلوم");
    expect(html).toContain("ما دورة الماء؟");
    expect(html).toContain("water.png");
    expect(html).toContain("عدد الأسئلة: 1");
  });

  it("opens the print window and triggers printing after load", () => {
    const print = vi.fn();
    const popup = {
      document: { write: vi.fn(), close: vi.fn() },
      focus: vi.fn(),
      onload: null as (() => void) | null,
      print,
    };
    printQuestionBankAsPdf(items, "أسئلة العلوم", vi.fn(() => popup as unknown as Window));
    expect(popup.document.write).toHaveBeenCalled();
    popup.onload?.();
    expect(print).toHaveBeenCalled();
  });
});
