// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LessonDetail from "./LessonDetail";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/lessons/1", () => undefined],
  useRoute: () => [true, { id: "1" }],
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    lessons: {
      get: {
        useQuery: () => ({
          isLoading: false,
          isError: false,
          data: {
            id: 1,
            title: "درس العلوم",
            subject: "العلوم",
            grade: "الصف الرابع",
            school: "مدرسة النور",
            teacher: "أحمد علي",
            date: "2026-08-18",
            content: "محتوى الدرس",
            boardContent: "نقاط السبورة",
            summaryContent: "أسئلة الملخص",
          },
          refetch: vi.fn(),
        }),
      },
    },
  },
}));

vi.mock("@/components/PublicNav", () => ({
  default: () => <nav aria-label="التنقل الرئيسي">التنقل</nav>,
}));

vi.mock("@/components/LoadingState", () => ({
  default: () => <div>تحميل</div>,
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("LessonDetail PDF integration", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.title = "دفتر التحضير الذكي";
  });

  it("renders the lesson sections and exposes the PDF action", () => {
    render(<LessonDetail />);

    expect(screen.getByRole("button", { name: "تصدير الخطة إلى PDF" })).toBeTruthy();
    const cardTitles = Array.from(document.querySelectorAll('[data-slot="card-title"]')).map(
      (element) => element.textContent
    );
    expect(cardTitles).toEqual(
      expect.arrayContaining([
        "معلومات الدرس",
        "محتوى الدرس الكامل",
        "السبورة الذكية",
        "الملخص التفاعلي",
      ])
    );
  });

  it("invokes browser printing from the PDF action on the lesson page", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<LessonDetail />);

    fireEvent.click(screen.getByRole("button", { name: "تصدير الخطة إلى PDF" }));

    expect(print).toHaveBeenCalledOnce();
    expect(document.title).toBe("درس العلوم - خطة تعليمية");

    fireEvent(window, new Event("afterprint"));
    expect(document.title).toBe("دفتر التحضير الذكي");
  });
});
