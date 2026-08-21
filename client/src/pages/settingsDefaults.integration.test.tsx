// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  settingsQuery: vi.fn(),
  examQuery: vi.fn(),
  location: vi.fn(() => ["/", vi.fn()] as const),
  mutation: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { name: "معلم الاختبار" }, isAuthenticated: true }),
}));

vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
  useLocation: mocks.location,
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      lessons: { list: { prefetch: vi.fn() } },
      library: { list: { prefetch: vi.fn() } },
      settings: { get: { prefetch: vi.fn() } },
      exams: { list: { prefetch: vi.fn() }, versionsList: { invalidate: vi.fn() } },
      questionBank: { list: { prefetch: vi.fn(), invalidate: vi.fn() } },
    }),
    settings: { get: { useQuery: mocks.settingsQuery } },
    lessons: { generate: { useMutation: mocks.mutation }, create: { useMutation: mocks.mutation } },
    exams: {
      get: { useQuery: mocks.examQuery },
      create: { useMutation: mocks.mutation },
      update: { useMutation: mocks.mutation },
      questionsReplace: { useMutation: mocks.mutation },
      questionImageUpload: { useMutation: mocks.mutation },
      versionsList: { useQuery: () => ({ data: [], isLoading: false }) },
      versionCreate: { useMutation: mocks.mutation },
      versionRestore: { useMutation: mocks.mutation },
    },
    questionBank: {
      list: { useQuery: () => ({ data: [], isLoading: false }) },
      create: { useMutation: mocks.mutation },
    },
  },
}));

import NewLesson from "./NewLesson";
import ExamEditor from "./ExamEditor";

describe("saved settings integration", () => {
  beforeEach(() => {
    mocks.settingsQuery.mockReturnValue({
      data: {
        defaultSchool: "مدرسة المستقبل",
        defaultTeacher: "معلم الاختبار",
        defaultSubject: "العلوم",
        defaultLanguage: "ar",
        defaultModel: "gemini-1.5-pro",
        defaultExamType: "formal",
        generationTargets: "الخطة، الخريطة الذهنية، حل التقويم",
      },
      isLoading: false,
    });
    mocks.examQuery.mockReturnValue({ data: undefined, isLoading: false });
    mocks.location.mockReturnValue(["/", vi.fn()] as const);
    mocks.mutation.mockImplementation(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("applies saved generation targets in NewLesson", async () => {
    render(<NewLesson />);

    await waitFor(() => {
      expect(screen.getByText("الخطة")).toBeTruthy();
      expect(screen.getByText("الخريطة الذهنية")).toBeTruthy();
      expect(screen.getByText("حل التقويم")).toBeTruthy();
    });
    expect(screen.queryByText("السبورة")).toBeNull();
  });

  it("applies saved default exam type in a new ExamEditor", async () => {
    render(<ExamEditor />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: "نوع الاختبار" }).textContent).toContain("اختبار رسمي");
    });
  });
});
