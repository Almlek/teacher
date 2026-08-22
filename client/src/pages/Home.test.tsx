// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => cleanup());
import Home from "./Home";

describe("واجهة المعلم الذكي الرئيسية", () => {
  it("تعرض العنوان والإصدار وبطاقات الأقسام الخمس", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "المعلم الذكي ⭐" })).toBeTruthy();
    expect(screen.getByText("دفتر التحضير الذكي — الإصدار 2.0")).toBeTruthy();
    expect(screen.getByRole("link", { name: /الأرشيف/ }).getAttribute("href")).toBe("/archive");
    expect(screen.getByRole("link", { name: /تحضير جديد/ }).getAttribute("href")).toBe("/lessons/new");
    expect(screen.getByRole("link", { name: /المكتبة/ }).getAttribute("href")).toBe("/library");
    expect(screen.getByRole("link", { name: /المستودع/ }).getAttribute("href")).toBe("/archive");
    expect(screen.getByRole("link", { name: /الإعدادات/ }).getAttribute("href")).toBe("/settings");
  });

  it("تحافظ على أدوات شريط المعاينة القابلة للوصول", () => {
    render(<Home />);

    expect(screen.getByRole("button", { name: "رجوع" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "الوضع الليلي" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "تغيير اللغة" })).toBeTruthy();
    expect(screen.getByText("معاينة")).toBeTruthy();
  });
});
