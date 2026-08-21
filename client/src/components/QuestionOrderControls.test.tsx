// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import QuestionOrderControls from "./QuestionOrderControls";

describe("QuestionOrderControls", () => {
  afterEach(() => cleanup());

  it("disables unavailable directions and calls move callbacks", () => {
    const onMove = vi.fn();
    const onDelete = vi.fn();
    render(<QuestionOrderControls index={1} total={3} onMove={onMove} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "نقل السؤال 2 إلى الأعلى" }));
    fireEvent.click(screen.getByRole("button", { name: "نقل السؤال 2 إلى الأسفل" }));
    fireEvent.click(screen.getByRole("button", { name: "حذف السؤال 2" }));

    expect(onMove).toHaveBeenNthCalledWith(1, -1);
    expect(onMove).toHaveBeenNthCalledWith(2, 1);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("disables moving above the first question and below the last question", () => {
    const onMove = vi.fn();
    render(<QuestionOrderControls index={0} total={2} onMove={onMove} onDelete={() => undefined} />);
    expect((screen.getByRole("button", { name: "نقل السؤال 1 إلى الأعلى" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "نقل السؤال 1 إلى الأسفل" }) as HTMLButtonElement).disabled).toBe(false);
  });
});
