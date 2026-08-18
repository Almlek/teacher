import { describe, expect, it } from "vitest";
import { applyLessonSettings, getGenerationEngines } from "./lessonDefaults";

describe("lesson settings defaults", () => {
  it("uses saved generation targets in the preparation interface model", () => {
    expect(getGenerationEngines("الخطة، الخريطة الذهنية، حل التقويم")).toEqual([
      "الخطة",
      "الخريطة الذهنية",
      "حل التقويم",
    ]);
  });

  it("falls back to all generation engines when no targets are saved", () => {
    expect(getGenerationEngines(null)).toEqual([
      "الخطة",
      "السبورة",
      "الملخص",
      "الخريطة الذهنية",
      "حل التقويم",
    ]);
  });

  it("applies saved defaults while preserving the rest of the lesson form", () => {
    const previous = {
      school: "",
      teacher: "المعلم",
      subject: "",
      language: "ar",
      aiModel: "gemini-1.5-flash",
      grade: "الصف السادس",
      title: "درس تجريبي",
    };
    const result = applyLessonSettings(previous, {
      school: "مدرسة النور",
      teacher: "أحمد",
      subject: "الرياضيات",
      language: "ar",
      aiModel: "gemini-1.5-pro",
    });

    expect(result.school).toBe("مدرسة النور");
    expect(result.aiModel).toBe("gemini-1.5-pro");
    expect(result.grade).toBe("الصف السادس");
    expect(result.title).toBe("درس تجريبي");
  });
});
