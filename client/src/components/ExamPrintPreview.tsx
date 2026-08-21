import React from "react";
import { ExamExportData, parseExamOptions } from "@/lib/examExport";

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

export default function ExamPrintPreview({ exam }: { exam: ExamExportData }) {
  const questions = [...exam.questions].sort((a, b) => a.orderIndex - b.orderIndex);
  return (
    <section data-print-only data-print-content dir="rtl" className="exam-print-preview">
      <header className="exam-print-header">
        <h1>{exam.title || "اختبار تعليمي"}</h1>
        <div className="exam-print-meta">
          {exam.subject && <span>المادة: {exam.subject}</span>}
          {exam.grade && <span>الصف: {exam.grade}</span>}
          {exam.examType && <span>{examTypeLabels[exam.examType] || exam.examType}</span>}
          {exam.durationMinutes && <span>المدة: {exam.durationMinutes} دقيقة</span>}
          {exam.totalMarks !== null && exam.totalMarks !== undefined && <span>الدرجة: {exam.totalMarks}</span>}
        </div>
      </header>
      <div className="exam-print-student-line"><span>اسم الطالب: ____________________</span><span>التاريخ: ____ / ____ / ______</span></div>
      {exam.instructions && <div className="exam-print-instructions"><strong>التعليمات:</strong><br />{exam.instructions}</div>}
      <div className="exam-print-questions">
        {questions.map((question, index) => (
          <article key={`${question.orderIndex}-${index}`} className="exam-print-question">
            <h2>السؤال {index + 1} — {questionTypeLabels[question.questionType] || question.questionType} <small>({question.marks} درجة)</small></h2>
            <p>{question.prompt}</p>
            {question.imageUrl && <figure className="exam-print-illustration"><img src={question.imageUrl} alt={`رسم توضيحي للسؤال ${index + 1}`} /><figcaption>رسم توضيحي للسؤال {index + 1}</figcaption></figure>}
            {parseExamOptions(question.options).length > 0 && (
              <ol type="a">
                {parseExamOptions(question.options).map((option, optionIndex) => <li key={`${index}-${optionIndex}`}>{option}</li>)}
              </ol>
            )}
          </article>
        ))}
      </div>
      <footer className="exam-print-footer">تم إعداد ورقة الاختبار بواسطة دفتر التحضير الذكي</footer>
    </section>
  );
}
