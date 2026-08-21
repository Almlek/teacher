export type ExamExportQuestion = {
  orderIndex: number;
  questionType: string;
  prompt: string;
  options?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  marks: number;
};

export type ExamExportData = {
  title: string;
  subject?: string | null;
  grade?: string | null;
  examType?: string | null;
  durationMinutes?: number | null;
  instructions?: string | null;
  totalMarks?: number | null;
  questions: ExamExportQuestion[];
};

export type ExamPrintBridge = {
  getTitle: () => string;
  setTitle: (title: string) => void;
  print: () => void;
  onAfterPrint: (callback: () => void) => void;
  offAfterPrint: (callback: () => void) => void;
};

const examTypeLabels: Record<string, string> = {
  comprehensive: "اختبار شامل",
  formal: "اختبار رسمي",
  electronic: "اختبار إلكتروني",
};

const questionTypeLabels: Record<string, string> = {
  multiple_choice: "اختيار من متعدد",
  true_false: "صح أو خطأ",
  short_answer: "إجابة قصيرة",
  essay: "سؤال مقالي",
};

const optionLetters = ["أ", "ب", "ج", "د", "هـ", "و"];

export function getExamExportFilename(title: string, extension: "pdf" | "doc") {
  const safeTitle = title.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "اختبار";
  return `${safeTitle}.${extension}`;
}

export function parseExamOptions(options?: string | null): string[] {
  if (!options?.trim()) return [];
  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Older manually authored questions use a pipe-separated string.
  }
  return options.split("|").map((option) => option.trim()).filter(Boolean);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function linesToHtml(value?: string | null) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

export function buildExamWordDocument(exam: ExamExportData) {
  const questions = [...exam.questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const examType = examTypeLabels[exam.examType || ""] || exam.examType || "اختبار";
  const questionMarkup = questions.map((question, index) => {
    const options = parseExamOptions(question.options)
      .map((option, optionIndex) => `<li>${escapeHtml(optionLetters[optionIndex] || `${optionIndex + 1}`)}) ${escapeHtml(option)}</li>`)
      .join("");
    return `<section class="question">
      <h3>السؤال ${index + 1} — ${escapeHtml(questionTypeLabels[question.questionType] || question.questionType)} <span>(${question.marks} درجة)</span></h3>
      <p class="prompt">${linesToHtml(question.prompt)}</p>
      ${options ? `<ol class="options" type="a">${options}</ol>` : ""}
    </section>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(exam.title)}</title>
<style>
  @page { size: A4; margin: 18mm; }
  body { direction: rtl; font-family: Tahoma, Arial, sans-serif; color: #172033; line-height: 1.85; margin: 0; }
  .sheet { max-width: 180mm; margin: 0 auto; }
  .header { border: 2px solid #2563eb; border-radius: 12px; padding: 18px 22px; margin-bottom: 20px; text-align: center; }
  h1 { margin: 0 0 10px; color: #1d4ed8; font-size: 24px; }
  .meta { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; font-size: 13px; }
  .instructions { background: #eff6ff; border-right: 4px solid #2563eb; padding: 10px 14px; margin: 15px 0 22px; }
  .student-line { display: flex; gap: 24px; margin: 20px 0; border-bottom: 1px solid #94a3b8; padding-bottom: 10px; }
  .question { border-bottom: 1px solid #cbd5e1; padding: 12px 0 16px; page-break-inside: avoid; }
  h3 { font-size: 16px; margin: 0 0 7px; color: #1e3a8a; }
  h3 span { color: #64748b; font-size: 12px; }
  .prompt { margin: 0 0 5px; font-weight: 600; }
  .options { margin: 4px 0 0; padding-right: 22px; }
  .options li { padding: 2px 0; }
  .footer { margin-top: 25px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 12px; color: #64748b; text-align: center; }
</style>
</head>
<body><div class="sheet">
  <header class="header">
    <h1>${escapeHtml(exam.title)}</h1>
    <div class="meta">
      ${exam.subject ? `<span>المادة: ${escapeHtml(exam.subject)}</span>` : ""}
      ${exam.grade ? `<span>الصف: ${escapeHtml(exam.grade)}</span>` : ""}
      <span>${escapeHtml(examType)}</span>
      ${exam.durationMinutes ? `<span>المدة: ${exam.durationMinutes} دقيقة</span>` : ""}
      ${exam.totalMarks !== null && exam.totalMarks !== undefined ? `<span>الدرجة: ${exam.totalMarks}</span>` : ""}
    </div>
  </header>
  <div class="student-line"><span>اسم الطالب: ____________________</span><span>التاريخ: ____ / ____ / ______</span></div>
  ${exam.instructions ? `<div class="instructions"><strong>التعليمات:</strong><br />${linesToHtml(exam.instructions)}</div>` : ""}
  ${questionMarkup}
  <div class="footer">تم إعداد ورقة الاختبار بواسطة دفتر التحضير الذكي</div>
</div></body></html>`;
}

export function downloadExamAsWord(exam: ExamExportData, download = (blob: Blob, filename: string) => downloadBlob(blob, filename)) {
  const html = buildExamWordDocument(exam);
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  download(blob, getExamExportFilename(exam.title, "doc"));
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function getExamPrintDocumentTitle(title: string) {
  return `${title.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "-").trim() || "اختبار"} - اختبار تعليمي`;
}

export function triggerExamPrintExport(title: string, bridge: ExamPrintBridge) {
  const previousTitle = bridge.getTitle();
  const restoreTitle = () => {
    bridge.setTitle(previousTitle);
    bridge.offAfterPrint(restoreTitle);
  };
  bridge.setTitle(getExamPrintDocumentTitle(title));
  bridge.onAfterPrint(restoreTitle);
  bridge.print();
  return restoreTitle;
}
