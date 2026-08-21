import { invokeLLM } from "./_core/llm";

export type ImageQuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay";
export type ImageQuestionPreference = "mixed" | ImageQuestionType;

export interface ImageExamGenerationParams {
  imageData: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  title?: string;
  subject?: string;
  grade?: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  preferredType: ImageQuestionPreference;
  language: "ar" | "en";
  aiModel: "gemini-1.5-flash" | "gemini-1.5-pro";
  tags?: string;
}

export interface GeneratedImageQuestion {
  questionType: ImageQuestionType;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  tags: string;
}

export interface GeneratedImageAssessment {
  title: string;
  visualSummary: string;
  learningObjectives: string[];
  assessmentNotes: string;
  questions: GeneratedImageQuestion[];
}

const QUESTION_TYPES: ImageQuestionType[] = ["multiple_choice", "true_false", "short_answer", "essay"];

function textContent(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "string" ? part : (part as { text?: string }).text || "")).join(" ");
  }
  return String(content ?? "");
}

function normalizeQuestion(question: Partial<GeneratedImageQuestion>, index: number, preferredType: ImageQuestionPreference, tags: string) {
  const generatedType = QUESTION_TYPES.includes(question.questionType as ImageQuestionType)
    ? (question.questionType as ImageQuestionType)
    : "multiple_choice";
  const type = preferredType === "mixed" ? generatedType : preferredType;
  return {
    questionType: type,
    prompt: String(question.prompt || `سؤال مستخرج من الصورة ${index + 1}`),
    options: Array.isArray(question.options) ? question.options.filter(Boolean).map(String).slice(0, 6) : [],
    correctAnswer: String(question.correctAnswer || ""),
    explanation: String(question.explanation || ""),
    marks: Math.max(1, Math.min(10, Number(question.marks) || 1)),
    tags: String(question.tags || tags || "تحليل صورة"),
  } satisfies GeneratedImageQuestion;
}

export async function generateExamFromImage(params: ImageExamGenerationParams): Promise<GeneratedImageAssessment> {
  const languageArabic = params.language === "ar";
  const difficultyLabel = languageArabic
    ? { easy: "سهل", medium: "متوسط", hard: "متقدم" }[params.difficulty]
    : params.difficulty;
  const preferredTypeLabel = languageArabic
    ? { mixed: "متنوعة", multiple_choice: "اختيار من متعدد فقط", true_false: "صح أو خطأ فقط", short_answer: "إجابة قصيرة فقط", essay: "مقالية فقط" }[params.preferredType]
    : { mixed: "mixed", multiple_choice: "multiple-choice only", true_false: "true/false only", short_answer: "short-answer only", essay: "essay only" }[params.preferredType];

  const systemPrompt = languageArabic
    ? "أنت خبير تحليل بصري وتقويم تربوي. حلل الصورة التعليمية فقط، ولا تخترع معلومات غير ظاهرة أو غير قابلة للاستنتاج منها. أعد JSON مطابقاً للمخطط، واجعل الأسئلة مناسبة للمادة والصف. اعتبر النتيجة مسودة تحتاج مراجعة المعلم قبل اعتمادها."
    : "You are an expert visual analyst and educational assessment designer. Analyze only the educational image and do not invent information that is not visible or reasonably inferable. Return JSON matching the schema and make questions appropriate for the subject and grade. Treat the result as a draft requiring teacher review.";

  const userPrompt = languageArabic
    ? `حلل الصورة التعليمية المرفقة وأنشئ منها أسئلة وتقييماً قابلاً للمراجعة.
العنوان: ${params.title || "تحليل صورة تعليمية"}
المادة: ${params.subject || "غير محددة"}
الصف: ${params.grade || "غير محدد"}
مستوى الصعوبة: ${difficultyLabel}
نوع الأسئلة المطلوب: ${preferredTypeLabel}
عدد الأسئلة المطلوب: ${params.questionCount}
الإشارات المقترحة: ${params.tags || "تحليل صورة"}

قواعد مهمة:
- صف العناصر أو العلاقات أو البيانات الظاهرة في الصورة في visualSummary.
- استخرج أهداف تعلم قابلة للملاحظة، ولا تضف مفاهيم غير مدعومة بالصورة.
- اكتب سؤالاً واضحاً مع إجابة صحيحة وشرح موجز لكل سؤال.
- ${params.preferredType === "mixed" ? "استخدم أنواعاً متنوعة مناسبة للصورة." : `اجعل كل الأسئلة من نوع ${preferredTypeLabel}.`}
- سؤال الاختيار من متعدد يحتوي أربعة خيارات، والصح والخطأ خياران واضحان، والأسئلة غير الاختيارية تعيد options كمصفوفة فارغة.
- أضف ملاحظة تقييمية عملية تساعد المعلم على مراجعة الدقة وملاءمة السؤال للصورة.`
    : `Analyze the attached educational image and create reviewable questions and an assessment.
Title: ${params.title || "Educational image analysis"}
Subject: ${params.subject || "Not specified"}
Grade: ${params.grade || "Not specified"}
Difficulty: ${difficultyLabel}
Requested question type: ${preferredTypeLabel}
Question count: ${params.questionCount}
Suggested tags: ${params.tags || "image-analysis"}

Rules:
- Describe visible elements, relationships, or data in visualSummary.
- Extract observable learning objectives without adding unsupported concepts.
- Write a clear question with a correct answer and brief explanation.
- ${params.preferredType === "mixed" ? "Use varied types appropriate for the image." : `Use only ${preferredTypeLabel} questions.`}
- Multiple-choice questions have four options; true/false has two clear options; non-choice questions return an empty options array.
- Include a practical assessment note helping the teacher review accuracy and image alignment.`;

  const dataUrl = `data:${params.mimeType};base64,${params.imageData}`;
  const response = await invokeLLM({
    model: params.aiModel,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "image_exam_assessment",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            visualSummary: { type: "string" },
            learningObjectives: { type: "array", items: { type: "string" } },
            assessmentNotes: { type: "string" },
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
                  tags: { type: "string" },
                },
                required: ["questionType", "prompt", "options", "correctAnswer", "explanation", "marks", "tags"],
                additionalProperties: false,
              },
            },
          },
          required: ["title", "visualSummary", "learningObjectives", "assessmentNotes", "questions"],
          additionalProperties: false,
        },
      },
    },
    maxTokens: 5000,
  });

  const raw = textContent(response.choices[0]?.message?.content);
  let parsed: Partial<GeneratedImageAssessment>;
  try {
    parsed = JSON.parse(raw) as Partial<GeneratedImageAssessment>;
  } catch {
    throw new Error("تعذر قراءة تحليل الصورة. حاول مرة أخرى أو استخدم صورة أوضح.");
  }

  const questions = Array.isArray(parsed.questions)
    ? parsed.questions.slice(0, params.questionCount).map((question, index) => normalizeQuestion(question, index, params.preferredType, params.tags || "تحليل صورة"))
    : [];
  if (questions.length === 0) throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء أسئلة من الصورة.");

  return {
    title: String(parsed.title || params.title || "تقييم من صورة تعليمية"),
    visualSummary: String(parsed.visualSummary || "تحليل بصري يحتاج مراجعة المعلم."),
    learningObjectives: Array.isArray(parsed.learningObjectives) ? parsed.learningObjectives.map(String).slice(0, 8) : [],
    assessmentNotes: String(parsed.assessmentNotes || "راجع ارتباط كل سؤال بالعناصر الظاهرة في الصورة قبل الاعتماد."),
    questions,
  };
}
