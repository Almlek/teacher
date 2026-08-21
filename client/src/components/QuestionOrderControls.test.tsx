// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import QuestionOrderControls from "./QuestionOrderControls";
import { moveItem, withSequentialOrder } from "@/lib/examEditorUtils";

describe("QuestionOrderControls and Editor Utils", () => {
  afterEach(() => cleanup());

  it("renders order controls and fires move/delete callbacks", () => {
    const onMove = vi.fn();
    const onDelete = vi.fn();
    render(<QuestionOrderControls index={0} total={3} onMove={onMove} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "نقل السؤال 1 إلى الأسفل" }));
    fireEvent.click(screen.getByRole("button", { name: "حذف السؤال 1" }));

    expect(onMove).toHaveBeenCalledWith(1);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("reorders questions and assigns sequential orderIndex", () => {
    const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const moved = moveItem(list, 0, 2);
    const sequenced = withSequentialOrder(moved.map((item, idx) => ({ ...item, orderIndex: idx })));
    expect(sequenced).toEqual([
      { id: 2, orderIndex: 0 },
      { id: 3, orderIndex: 1 },
      { id: 1, orderIndex: 2 },
    ]);
  });
});
