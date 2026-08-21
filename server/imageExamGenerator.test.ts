import { beforeEach, describe, expect, it, vi } from "vitest";
import { invokeLLM } from "./_core/llm";
import { generateExamFromImage } from "./imageExamGenerator";

vi.mock("./_core/llm", () => ({ invokeLLM: vi.fn() }));

describe("imageExamGenerator", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends the image to the vision model and normalizes reviewable questions", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            title: "تقييم دورة الماء",
            visualSummary: "مخطط يوضح التبخر والتكاثف والهطول.",
            learningObjectives: ["تمييز مراحل دورة الماء"],
            assessmentNotes: "تحقق من أن السؤال مرتبط بالأسهم الظاهرة.",
            questions: [{
              questionType: "multiple_choice",
              prompt: "ما المرحلة التي يتحول فيها الماء إلى بخار؟",
              options: ["التبخر", "الهطول", "التجمد", "الانصهار"],
              correctAnswer: "التبخر",
              explanation: "التبخر يحول الماء السائل إلى بخار.",
              marks: 2,
              tags: "علوم, دورة الماء",
            }],
          }),
        },
      }],
    } as never);

    const result = await generateExamFromImage({
      imageData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB",
      mimeType: "image/png",
      title: "دورة الماء",
      subject: "العلوم",
      grade: "السادس",
      questionCount: 3,
      difficulty: "medium",
      preferredType: "essay",
      language: "ar",
      aiModel: "gemini-1.5-flash",
      tags: "علوم",
    });

    expect(result.questions[0]?.questionType).toBe("essay");
    expect(result.questions[0]?.tags).toBe("علوم, دورة الماء");
    const request = vi.mocked(invokeLLM).mock.calls[0]?.[0];
    const userMessage = request?.messages?.[1];
    expect(Array.isArray(userMessage?.content)).toBe(true);
    expect(userMessage?.content).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "image_url" }),
      expect.objectContaining({ type: "text" }),
    ]));
    expect(String((userMessage?.content as Array<{ text?: string }>).find((part) => part.text)?.text)).toContain("مستوى الصعوبة: متوسط");
  });
});
