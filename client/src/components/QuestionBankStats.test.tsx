// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const stats = {
  total: 6,
  bySubject: { العلوم: 3, الرياضيات: 2, اللغة: 1 },
  byDifficulty: { easy: 2, medium: 3, hard: 1 },
  byType: { multiple_choice: 2, true_false: 2, short_answer: 1, essay: 1 },
};

vi.mock("@/lib/trpc", () => ({
  trpc: { questionBank: { stats: { useQuery: () => ({ data: stats, isLoading: false, isError: false }) } } },
}));

vi.mock("recharts", () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: passthrough,
    BarChart: passthrough,
    PieChart: passthrough,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Cell: () => null,
    Bar: ({ onClick, children }: { onClick?: (item: { key: string; label: string }) => void; children?: React.ReactNode }) => <button aria-label="chart-subject" onClick={() => onClick?.({ key: "العلوم", label: "العلوم" })}>{children}</button>,
    Pie: ({ onClick, children }: { onClick?: (item: { key: string; label: string }) => void; children?: React.ReactNode }) => <button aria-label="chart-difficulty" onClick={() => onClick?.({ key: "easy", label: "سهل" })}>{children}</button>,
  };
});

import QuestionBankStats from "./QuestionBankStats";

describe("QuestionBankStats", () => {
  it("emits a filter when a chart segment is clicked", () => {
    const onFilter = vi.fn();
    render(<QuestionBankStats onFilter={onFilter} />);

    fireEvent.click(screen.getAllByRole("button", { name: "chart-subject" })[0]!);
    expect(onFilter).toHaveBeenCalledWith({ dimension: "subject", value: "العلوم", label: "العلوم" });

    fireEvent.click(screen.getByRole("button", { name: "chart-difficulty" }));
    expect(onFilter).toHaveBeenCalledWith({ dimension: "difficulty", value: "easy", label: "سهل" });
  });
});
