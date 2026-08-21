import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./_core/llm";
import { generateExamFromLesson } from "./examGenerator";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));

describe("examGenerator preferences", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes difficulty and preferred type in the prompt and normalizes generated types", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            title: "اختبار العلوم",
            instructions: "أجب عن الأسئلة.",
            summary: "اختبار مقالي",
            questions: [{
              questionType: "multiple_choice",
              prompt: "فسر دورة الماء.",
              options: [],
              correctAnswer: "الإجابة النموذجية",
              explanation: "لأن الدورة تشرح انتقال الماء.",
              marks: 3,
            }],
          }),
        },
      }],
    } as never);

    const result = await generateExamFromLesson({
      title: "دورة الماء",
      subject: "العلوم",
      grade: "السادس",
      content: "يتبخر الماء ثم يتكاثف ويهطل.",
      examType: "comprehensive",
      questionCount: 3,
      difficulty: "hard",
      preferredType: "essay",
      language: "ar",
      aiModel: "gemini-1.5-flash",
    });

    expect(result.questions[0]?.questionType).toBe("essay");
    const userPrompt = vi.mocked(invokeLLM).mock.calls[0]?.[0].messages?.[1]?.content;
    expect(String(userPrompt)).toContain("مستوى الصعوبة: متقدم");
    expect(String(userPrompt)).toContain("نوع الأسئلة المطلوب: مقالية فقط");
    expect(String(userPrompt)).toContain("اجعل جميع الأسئلة من نوع مقالية فقط");
  });
});
