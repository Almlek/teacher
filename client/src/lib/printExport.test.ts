import { describe, expect, it, vi } from "vitest";
import { getPrintDocumentTitle, triggerPrintExport } from "./printExport";

describe("print export helpers", () => {
  it("creates a safe Arabic document title from a lesson title", () => {
    expect(getPrintDocumentTitle('درس: الكسوف/الخسوف* اليوم')).toBe(
      "درس- الكسوف-الخسوف- اليوم - خطة تعليمية"
    );
  });

  it("uses a fallback title when the lesson title is empty", () => {
    expect(getPrintDocumentTitle("   ")).toBe("خطة-درس - خطة تعليمية");
  });

  it("sets the print title, triggers printing, and restores the previous title", () => {
    let currentTitle = "دفتر التحضير الذكي";
    let afterPrintCallback: (() => void) | undefined;
    const print = vi.fn();
    const offAfterPrint = vi.fn((callback: () => void) => {
      if (afterPrintCallback === callback) afterPrintCallback = undefined;
    });

    triggerPrintExport("درس العلوم", {
      getTitle: () => currentTitle,
      setTitle: (title) => {
        currentTitle = title;
      },
      print,
      onAfterPrint: (callback) => {
        afterPrintCallback = callback;
      },
      offAfterPrint,
    });

    expect(currentTitle).toBe("درس العلوم - خطة تعليمية");
    expect(print).toHaveBeenCalledOnce();
    expect(afterPrintCallback).toBeTypeOf("function");

    afterPrintCallback?.();

    expect(currentTitle).toBe("دفتر التحضير الذكي");
    expect(offAfterPrint).toHaveBeenCalledOnce();
  });
});
