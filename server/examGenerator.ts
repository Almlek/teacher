import { invokeLLM } from "./_core/llm";

export type ExamQuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay";
export type ExamQuestionPreference = "mixed" | "multiple_choice" | "true_false" | "essay";

export interface ExamGenerationParams {
  title: string;
  subject?: string;
  grade?: string;
  content: string;
  examType: "comprehensive" | "formal" | "electronic";
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  preferredType?: ExamQuestionPreference;
  language: "ar" | "en";
  aiModel: "gemini-1.5-flash" | "gemini-1.5-pro";
}

export interface GeneratedExamQuestion {
  questionType: ExamQuestionType;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface GeneratedExam {
  title: string;
  instructions: string;
  summary: string;
  questions: GeneratedExamQuestion[];
}

const QUESTION_TYPES: ExamQuestionType[] = ["multiple_choice", "true_false", "short_answer", "essay"];

function getTextContent(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "string" ? part : (part as { text?: string }).text || "")).join(" ");
  }
  return String(content ?? "");
}

function normalizeQuestion(question: Partial<GeneratedExamQuestion>, index: number, preferredType: ExamQuestionPreference = "mixed"): GeneratedExamQuestion {
  const generatedType = QUESTION_TYPES.includes(question.questionType as ExamQuestionType)
    ? (question.questionType as ExamQuestionType)
    : "multiple_choice";
  const type = preferredType === "mixed" ? generatedType : preferredType;
  const options = Array.isArray(question.options) ? question.options.filter(Boolean).map(String).slice(0, 6) : [];
  return {
    questionType: type,
    prompt: String(question.prompt || `سؤال ${index + 1}`),
    options,
    correctAnswer: String(question.correctAnswer || ""),
    explanation: String(question.explanation || ""),
    marks: Math.max(1, Math.min(10, Number(question.marks) || 1)),
  };
}

export async function generateExamFromLesson(params: ExamGenerationParams): Promise<GeneratedExam> {
  const languageArabic = params.language === "ar";
  const source = params.content.trim().slice(0, 18000);
  const difficultyLabel = languageArabic
    ? { easy: "سهل", medium: "متوسط", hard: "متقدم" }[params.difficulty]
    : params.difficulty;
  const preferredType = params.preferredType || "mixed";
  const preferredTypeLabel = languageArabic
    ? { mixed: "متنوعة", multiple_choice: "اختيار من متعدد فقط", true_false: "صح أو خطأ فقط", essay: "مقالية فقط" }[preferredType]
    : { mixed: "mixed", multiple_choice: "multiple-choice only", true_false: "true/false only", essay: "essay only" }[preferredType];

  const systemPrompt = languageArabic
    ? "أنت خبير تقويم تربوي. أنشئ اختباراً دقيقاً من محتوى الدرس فقط، ولا تخترع معلومات غير موجودة في المصدر. أعد JSON مطابقاً للمخطط المطلوب، واجعل الأسئلة مناسبة للصف والمادة."
    : "You are an expert educational assessment designer. Create an accurate exam using only the lesson content and do not invent information outside the source. Return JSON matching the requested schema, appropriate for the grade and subject.";

  const userPrompt = languageArabic
    ? `أنشئ اختباراً ${params.examType === "formal" ? "رسمياً" : params.examType === "electronic" ? "إلكترونياً" : "شاملاً"} من الدرس التالي.
العنوان: ${params.title}
المادة: ${params.subject || "غير محددة"}
الصف: ${params.grade || "غير محدد"}
مستوى الصعوبة: ${difficultyLabel}
نوع الأسئلة المطلوب: ${preferredTypeLabel}
عدد الأسئلة المطلوب: ${params.questionCount}

قواعد مهمة:
- ${preferredType === "mixed" ? "استخدم أسئلة متنوعة من الأنواع المناسبة للمحتوى." : `اجعل جميع الأسئلة من نوع ${preferredTypeLabel} ولا تستخدم نوعاً آخر.`}
- سؤال الاختيار من متعدد يجب أن يحتوي 4 خيارات، والصح والخطأ خياران واضحان.
- اكتب الإجابة الصحيحة والشرح الموجز لكل سؤال.
- اجعل الدرجات أعداداً صحيحة.
- أعد جميع الحقول المطلوبة حتى تكون المصفوفة الفارغة مناسبة للأسئلة غير الاختيارية.

محتوى الدرس:
${source}`
    : `Create a ${params.examType} exam from the following lesson.
Title: ${params.title}
Subject: ${params.subject || "Not specified"}
Grade: ${params.grade || "Not specified"}
Difficulty: ${difficultyLabel}
Requested question type: ${preferredTypeLabel}
Requested question count: ${params.questionCount}

Rules:
- ${preferredType === "mixed" ? "Use varied question types that fit the source." : `Use only ${preferredTypeLabel} questions.`}
- Multiple-choice questions should have 4 options; true/false questions should have two clear options.
- Include the correct answer and a brief explanation for every question.
- Use integer marks.
- Return every required field; use an empty array for non-choice questions.

Lesson content:
${source}`;

  const response = await invokeLLM({
    model: params.aiModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "generated_exam",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            instructions: { type: "string" },
            summary: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionType: { type: "string", enum: QUESTION_TYPES },
                  prompt: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctAnswer: { type: "string" },
                  explanation: { type: "string" },
                  marks: { type: "integer", minimum: 1, maximum: 10 },
                },
                required: ["questionType", "prompt", "options", "correctAnswer", "explanation", "marks"],
                additionalProperties: false,
              },
            },
          },
          required: ["title", "instructions", "summary", "questions"],
          additionalProperties: false,
        },
      },
    },
    maxTokens: 4000,
  });

  const raw = getTextContent(response.choices[0]?.message?.content);
  let parsed: Partial<GeneratedExam>;
  try {
    parsed = JSON.parse(raw) as Partial<GeneratedExam>;
  } catch {
    throw new Error("تعذر قراءة مخرجات توليد الاختبار. حاول مرة أخرى.");
  }

  const questions = Array.isArray(parsed.questions)
    ? parsed.questions.slice(0, params.questionCount).map((question, index) => normalizeQuestion(question, index, preferredType))
    : [];
  if (questions.length === 0) throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء أسئلة من محتوى الدرس.");

  return {
    title: String(parsed.title || `اختبار: ${params.title}`),
    instructions: String(parsed.instructions || "أجب عن جميع الأسئلة بوضوح."),
    summary: String(parsed.summary || "اختبار مولد آلياً من محتوى الدرس المحدد."),
    questions,
  };
}
