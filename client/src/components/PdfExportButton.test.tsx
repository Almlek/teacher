// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PdfExportButton from "./PdfExportButton";

describe("PdfExportButton", () => {
  const originalTitle = "دفتر التحضير الذكي";

  beforeEach(() => {
    document.title = originalTitle;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders an accessible Arabic PDF export button", () => {
    render(<PdfExportButton title="درس العلوم" />);

    expect(screen.getByRole("button", { name: "تصدير الخطة إلى PDF" }).textContent).toContain("PDF");
  });

  it("prints when clicked and restores the document title after printing", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<PdfExportButton title="درس: العلوم/الطاقة" />);

    fireEvent.click(screen.getByRole("button", { name: "تصدير الخطة إلى PDF" }));

    expect(print).toHaveBeenCalledOnce();
    expect(document.title).toBe("درس- العلوم-الطاقة - خطة تعليمية");

    fireEvent(window, new Event("afterprint"));

    expect(document.title).toBe(originalTitle);
  });
});
