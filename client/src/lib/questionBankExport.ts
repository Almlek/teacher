export type QuestionBankExportItem = {
  id: number;
  subject?: string | null;
  grade?: string | null;
  questionType: string;
  difficulty: string;
  prompt: string;
  options?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  imageUrl?: string | null;
  tags?: string | null;
  marks: number;
};

const questionTypeLabels: Record<string, string> = {
  multiple_choice: "اختيار من متعدد",
  true_false: "صح أو خطأ",
  short_answer: "إجابة قصيرة",
  essay: "مقالي",
};

const difficultyLabels: Record<string, string> = { easy: "سهل", medium: "متوسط", hard: "متقدم" };

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function safeFilename(value: string, extension: "csv" | "pdf") {
  const clean = value.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "-").replace(/\s+/g, " ").trim() || "بنك-الأسئلة";
  return `${clean}.${extension}`;
}

function parseOptions(options?: string | null) {
  if (!options?.trim()) return "";
  try {
    const parsed = JSON.parse(options);
    if (Array.isArray(parsed)) return parsed.map(String).join(" | ");
  } catch {
    // Legacy bank items can use a pipe-separated string.
  }
  return options.replace(/\r?\n/g, " | ");
}

export function buildQuestionBankCsv(items: QuestionBankExportItem[]) {
  const headers = ["رقم", "المادة", "الصف", "نوع السؤال", "الصعوبة", "نص السؤال", "الخيارات", "الإجابة الصحيحة", "الشرح", "الإشارات", "الدرجة", "رابط الصورة"];
  const rows = items.map((item, index) => [
    index + 1,
    item.subject || "بدون مادة",
    item.grade || "بدون صف",
    questionTypeLabels[item.questionType] || item.questionType,
    difficultyLabels[item.difficulty] || item.difficulty,
    item.prompt,
    parseOptions(item.options),
    item.correctAnswer,
    item.explanation,
    item.tags,
    item.marks,
    item.imageUrl,
  ]);
  return `\ufeff${[headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
}

export function downloadQuestionBankAsCsv(items: QuestionBankExportItem[], title = "بنك-الأسئلة-المصفاة", download = (blob: Blob, filename: string) => downloadBlob(blob, filename)) {
  const blob = new Blob([buildQuestionBankCsv(items)], { type: "text/csv;charset=utf-8" });
  download(blob, safeFilename(title, "csv"));
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildQuestionBankPrintDocument(items: QuestionBankExportItem[], title = "قائمة الأسئلة المصفاة") {
  const questions = items.map((item, index) => {
    const options = parseOptions(item.options);
    const image = item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="رسم توضيحي للسؤال ${index + 1}" />` : "";
    return `<article class="question"><h2>${index + 1}. ${escapeHtml(item.prompt)} <span>(${item.marks} درجة)</span></h2><div class="meta">المادة: ${escapeHtml(item.subject || "بدون مادة")} · الصف: ${escapeHtml(item.grade || "بدون صف")} · ${escapeHtml(questionTypeLabels[item.questionType] || item.questionType)} · ${escapeHtml(difficultyLabels[item.difficulty] || item.difficulty)}</div>${image}<p class="options">${escapeHtml(options)}</p>${item.correctAnswer ? `<p><strong>الإجابة:</strong> ${escapeHtml(item.correctAnswer)}</p>` : ""}${item.tags ? `<p class="tags"><strong>الإشارات:</strong> ${escapeHtml(item.tags)}</p>` : ""}</article>`;
  }).join("\n");
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>@page{size:A4;margin:16mm}body{direction:rtl;font-family:Tahoma,Arial,sans-serif;color:#172033;line-height:1.8;margin:0}.sheet{max-width:180mm;margin:auto}.header{text-align:center;border:2px solid #2563eb;border-radius:12px;padding:16px;margin-bottom:18px}h1{margin:0;color:#1d4ed8;font-size:23px}.summary{margin-top:6px;color:#64748b;font-size:12px}.question{border-bottom:1px solid #cbd5e1;padding:12px 0 16px;page-break-inside:avoid}.question h2{font-size:15px;margin:0 0 4px;color:#1e3a8a}.question h2 span{font-size:11px;color:#64748b}.meta,.tags{font-size:11px;color:#64748b}.options{white-space:pre-wrap;margin:7px 0}.question img{display:block;max-width:140mm;max-height:65mm;margin:10px auto;border:1px solid #dbeafe;border-radius:8px;object-fit:contain}.footer{text-align:center;margin-top:20px;border-top:1px solid #cbd5e1;padding-top:8px;font-size:11px;color:#64748b}</style></head><body><div class="sheet"><header class="header"><h1>${escapeHtml(title)}</h1><div class="summary">عدد الأسئلة: ${items.length}</div></header>${questions || "<p>لا توجد أسئلة مطابقة للتصدير.</p>"}<div class="footer">تم التصدير من دفتر التحضير الذكي</div></div></body></html>`;
}

export function printQuestionBankAsPdf(items: QuestionBankExportItem[], title = "قائمة الأسئلة المصفاة", openWindow: typeof window.open = window.open) {
  const popup = openWindow("", "_blank", "noopener,noreferrer");
  if (!popup) throw new Error("تعذر فتح نافذة الطباعة. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.");
  popup.document.write(buildQuestionBankPrintDocument(items, title));
  popup.document.close();
  popup.focus();
  popup.onload = () => popup.print();
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
