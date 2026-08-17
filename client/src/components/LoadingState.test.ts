import { describe, expect, it } from "vitest";
import { getLoadingStateCopy } from "./LoadingState";

describe("LoadingState", () => {
  it("returns localized copy for every supported state", () => {
    expect(getLoadingStateCopy("loading").title).toBe("جاري التحميل...");
    expect(getLoadingStateCopy("empty").title).toBe("لا يوجد محتوى بعد");
    expect(getLoadingStateCopy("error").title).toBe("تعذر تحميل المحتوى");
  });

  it("keeps a useful description for retryable errors", () => {
    expect(getLoadingStateCopy("error").description).toContain("مشكلة مؤقتة");
  });
});
