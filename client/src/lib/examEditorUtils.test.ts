import { describe, expect, it } from "vitest";
import { moveItem, withSequentialOrder } from "./examEditorUtils";

describe("exam editor ordering", () => {
  it("moves a generated question up or down without mutating the original list", () => {
    const questions = ["سؤال 1", "سؤال 2", "سؤال 3"];
    expect(moveItem(questions, 2, 0)).toEqual(["سؤال 3", "سؤال 1", "سؤال 2"]);
    expect(moveItem(questions, 0, 2)).toEqual(["سؤال 2", "سؤال 3", "سؤال 1"]);
    expect(questions).toEqual(["سؤال 1", "سؤال 2", "سؤال 3"]);
  });

  it("keeps invalid moves safe and normalizes persisted order indexes", () => {
    const questions = [{ orderIndex: 8, prompt: "أ" }, { orderIndex: 3, prompt: "ب" }];
    expect(moveItem(questions, 0, 4)).toBe(questions);
    expect(withSequentialOrder(questions)).toEqual([
      { orderIndex: 0, prompt: "أ" },
      { orderIndex: 1, prompt: "ب" },
    ]);
  });
});
