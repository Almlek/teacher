import { describe, expect, it, vi } from "vitest";
import {
  buildExamWordDocument,
  downloadExamAsWord,
  getExamExportFilename,
  getExamPrintDocumentTitle,
  parseExamOptions,
  triggerExamPrintExport,
} from "./examExport";

const exam = {
  title: "اختبار العلوم / الوحدة الأولى",
  subject: "العلوم",
  grade: "السادس",
  examType: "comprehensive",
  durationMinutes: 45,
  instructions: "أجب عن جميع الأسئلة.",
  totalMarks: 5,
  questions: [{
    orderIndex: 0,
    questionType: "multiple_choice",
    prompt: "ما حالات الماء؟",
    options: JSON.stringify(["صلبة", "سائلة", "غازية", "جميع ما سبق"]),
    correctAnswer: "جميع ما سبق",
    explanation: "للماء حالات متعددة.",
    marks: 2,
  }],
};

describe("exam export utilities", () => {
  it("creates safe PDF and Word filenames", () => {
    expect(getExamExportFilename("اختبار: العلوم/الوحدة", "pdf")).toBe("اختبار- العلوم-الوحدة.pdf");
    expect(getExamExportFilename("", "doc")).toBe("اختبار.doc");
    expect(getExamPrintDocumentTitle("اختبار/العلوم")).toContain("اختبار-العلوم");
  });

  it("parses generated JSON options and legacy pipe-separated options", () => {
    expect(parseExamOptions('["أ", "ب"]')).toEqual(["أ", "ب"]);
    expect(parseExamOptions("أ) واحد | ب) اثنان")).toEqual(["أ) واحد", "ب) اثنان"]);
    expect(parseExamOptions(" ")).toEqual([]);
  });

  it("builds an RTL Word document containing exam metadata and questions", () => {
    const html = buildExamWordDocument(exam);
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("اختبار العلوم / الوحدة الأولى");
    expect(html).toContain("ما حالات الماء؟");
    expect(html).toContain("جميع ما سبق");
    expect(html).toContain("اسم الطالب");
  });

  it("downloads a Word-compatible document with a safe filename", () => {
    const download = vi.fn();
    downloadExamAsWord(exam, download);
    expect(download).toHaveBeenCalledOnce();
    const [blob, filename] = download.mock.calls[0] as [Blob, string];
    expect(blob.type).toContain("application/msword");
    expect(filename).toBe("اختبار العلوم - الوحدة الأولى.doc");
  });

  it("prints the exam and restores the browser title after printing", () => {
    const bridge = {
      title: "المحرر",
      callbacks: new Set<() => void>(),
      getTitle() { return this.title; },
      setTitle(title: string) { this.title = title; },
      print: vi.fn(),
      onAfterPrint(callback: () => void) { this.callbacks.add(callback); },
      offAfterPrint(callback: () => void) { this.callbacks.delete(callback); },
    };
    triggerExamPrintExport("اختبار العلوم", bridge);
    expect(bridge.print).toHaveBeenCalledOnce();
    expect(bridge.title).toContain("اختبار العلوم");
    bridge.callbacks.forEach((callback) => callback());
    expect(bridge.title).toBe("المحرر");
  });
});
