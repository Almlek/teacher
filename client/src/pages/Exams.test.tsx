// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generate: { mutate: vi.fn(), isPending: false },
}));

vi.mock("@/components/PublicNav", () => ({ default: () => <nav>التنقل</nav> }));
vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
  useLocation: () => ["/exams", vi.fn()] as const,
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    exams: {
      list: { useQuery: () => ({ data: [], isLoading: false, isError: false, refetch: vi.fn() }) },
      generateFromLesson: { useMutation: () => mocks.generate },
    },
    lessons: {
      list: { useQuery: () => ({ data: [{ id: 7, title: "درس الكسور", subject: "الرياضيات" }], isLoading: false }) },
    },
  },
}));

import Exams from "./Exams";

describe("smart exam generation UI", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens the generator, selects a lesson, and submits generation settings", () => {
    render(<Exams />);

    fireEvent.click(screen.getByRole("button", { name: /توليد اختبار ذكي/ }));
    expect(screen.getByText("توليد اختبار ذكي من درس")).toBeTruthy();

    fireEvent.click(screen.getByRole("combobox", { name: "الدرس المصدر" }));
    fireEvent.click(screen.getByText("درس الكسور — الرياضيات"));
    fireEvent.click(screen.getByRole("button", { name: "توليد وحفظ الاختبار" }));

    expect(mocks.generate.mutate).toHaveBeenCalledWith({
      lessonId: 7,
      examType: "comprehensive",
      questionCount: 10,
      difficulty: "medium",
      language: "ar",
      aiModel: "gemini-1.5-flash",
    });
  });
});
