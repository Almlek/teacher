import { invokeLLM } from "./_core/llm";

export interface LessonGenerationParams {
  title: string;
  subject: string;
  grade?: string;
  content?: string;
  language: "ar" | "en";
  aiModel: "gemini-1.5-flash" | "gemini-1.5-pro";
}

export interface GeneratedLesson {
  content: string;
  boardContent: string;
  summaryContent: string;
  mindMapContent: string;
  assessmentContent: string;
}

const SYSTEM_PROMPT_AR = `أنت معلم خبير في تصميم خطط الدروس الفعّالة والمتكاملة. 
مهمتك هي إنشاء خطط دروس احترافية وشاملة تتضمن:
1. مقدمة الدرس وأهدافه
2. المحتوى التفصيلي للدرس
3. الأنشطة والتمارين
4. التقييم والخلاصة

اكتب الخطة بصيغة منظمة وسهلة الفهم.`;

const SYSTEM_PROMPT_EN = `You are an expert teacher in designing effective and comprehensive lesson plans.
Your task is to create professional and detailed lesson plans that include:
1. Lesson introduction and objectives
2. Detailed lesson content
3. Activities and exercises
4. Assessment and conclusion

Write the plan in an organized and easy-to-understand format.`;

export async function generateLessonPlan(
  params: LessonGenerationParams
): Promise<GeneratedLesson> {
  const systemPrompt = params.language === "ar" ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;

  const userPrompt =
    params.language === "ar"
      ? `أنشئ خطة درس شاملة بناءً على المعلومات التالية:
العنوان: ${params.title}
المادة: ${params.subject}
${params.grade ? `الصف: ${params.grade}` : ""}
${params.content ? `المحتوى الإضافي: ${params.content}` : ""}

يرجى إنشاء خطة درس متكاملة وشاملة.`
      : `Create a comprehensive lesson plan based on the following information:
Title: ${params.title}
Subject: ${params.subject}
${params.grade ? `Grade: ${params.grade}` : ""}
${params.content ? `Additional Content: ${params.content}` : ""}

Please create an integrated and comprehensive lesson plan.`;

  try {
    // Generate main lesson content
    const mainResponse = await invokeLLM({
      model: params.aiModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      maxTokens: 2000,
    });

    const content =
      mainResponse.choices[0]?.message?.content?.toString() || "";

    // Generate board summary
    const boardPrompt =
      params.language === "ar"
        ? `بناءً على خطة الدرس التالية، أنشئ ملخصاً مختصراً للسبورة الذكية (لا يتجاوز 500 كلمة):
${content}`
        : `Based on the following lesson plan, create a brief summary for the smart board (no more than 500 words):
${content}`;

    const boardResponse = await invokeLLM({
      model: params.aiModel,
      messages: [
        {
          role: "user",
          content: boardPrompt,
        },
      ],
      maxTokens: 1000,
    });

    const boardContent =
      boardResponse.choices[0]?.message?.content?.toString() || "";

    // Generate interactive summary
    const summaryPrompt =
      params.language === "ar"
        ? `بناءً على خطة الدرس التالية، أنشئ ملخصاً تفاعلياً يتضمن أسئلة وأجوبة (لا يتجاوز 500 كلمة):
${content}`
        : `Based on the following lesson plan, create an interactive summary with questions and answers (no more than 500 words):
${content}`;

    const summaryResponse = await invokeLLM({
      model: params.aiModel,
      messages: [
        {
          role: "user",
          content: summaryPrompt,
        },
      ],
      maxTokens: 1000,
    });

    const summaryContent =
      summaryResponse.choices[0]?.message?.content?.toString() || "";

    const mindMapPrompt =
      params.language === "ar"
        ? `حوّل خطة الدرس التالية إلى خريطة ذهنية نصية منظمة باستخدام Markdown. اجعل العقد الرئيسية واضحة، واربط المفاهيم بعلاقات مختصرة، ولا تستخدم أكثر من 500 كلمة:\n${content}`
        : `Turn the following lesson plan into a structured text mind map using Markdown. Make the main nodes clear, connect concepts with concise relationships, and stay under 500 words:\n${content}`;

    const mindMapResponse = await invokeLLM({
      model: params.aiModel,
      messages: [{ role: "user", content: mindMapPrompt }],
      maxTokens: 1000,
    });

    const mindMapContent =
      mindMapResponse.choices[0]?.message?.content?.toString() || "";

    const assessmentPrompt =
      params.language === "ar"
        ? `بناءً على خطة الدرس التالية، اكتب قسم حل التقويم يتضمن أسئلة تقويمية متنوعة مع إجابات نموذجية وشرح موجز. نظّم الناتج بعناوين واضحة ولا تتجاوز 700 كلمة:\n${content}`
        : `Based on the following lesson plan, write an assessment solution section with varied assessment questions, model answers, and brief explanations. Use clear headings and stay under 700 words:\n${content}`;

    const assessmentResponse = await invokeLLM({
      model: params.aiModel,
      messages: [{ role: "user", content: assessmentPrompt }],
      maxTokens: 1200,
    });

    const assessmentContent =
      assessmentResponse.choices[0]?.message?.content?.toString() || "";

    return {
      content,
      boardContent,
      summaryContent,
      mindMapContent,
      assessmentContent,
    };
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    throw new Error("Failed to generate lesson plan");
  }
}
