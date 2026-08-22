import React from "react";
import { ArrowLeft, Globe2, MoonStar } from "lucide-react";
import { Link } from "wouter";

const modules = [
  { href: "/lessons/new", icon: "✏️", label: "تحضير جديد" },
  { href: "/archive", icon: "📚", label: "الأرشيف" },
  { href: "/archive", icon: "🗄️", label: "المستودع" },
  { href: "/library", icon: "📖", label: "المكتبة" },
];

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#242326] text-white selection:bg-[#efb6ef]/30">
      <header className="h-[92px] border-b border-[#d8d8dc] bg-[#f5f5f7] text-[#252329] shadow-sm">
        <div className="mx-auto flex h-full max-w-[720px] items-center justify-between gap-5 px-5 sm:px-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <button type="button" aria-label="تغيير اللغة" className="rounded-full p-2 transition hover:bg-black/5 active:scale-95">
              <Globe2 className="h-9 w-9 stroke-[1.8] text-[#4c4b50]" />
            </button>
            <button type="button" aria-label="الوضع الليلي" className="rounded-full p-2 transition hover:bg-black/5 active:scale-95">
              <MoonStar className="h-9 w-9 stroke-[1.8] text-[#4c4b50]" />
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center leading-tight">
            <p className="text-[25px] font-medium tracking-tight">معاينة</p>
            <p dir="ltr" className="mt-1 truncate text-left text-[18px] text-[#727176]">/storage/emulated/0/.../مجلد جديد/</p>
          </div>

          <button type="button" aria-label="رجوع" onClick={() => window.history.back()} className="rounded-full p-2 transition hover:bg-black/5 active:scale-95">
            <ArrowLeft className="h-11 w-11 stroke-[1.7] text-[#252329]" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-3 py-9 sm:px-6 sm:py-12">
        <section className="rounded-[2.75rem] bg-[#0f0f10] px-5 py-14 shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:px-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-[clamp(2.25rem,8vw,4rem)] font-black leading-tight tracking-tight text-[#f5d8f5]">المعلم الذكي ⭐</h1>
            <p className="mt-6 text-[clamp(1.15rem,4vw,1.8rem)] font-medium text-[#8f96b4]">دفتر التحضير الذكي — الإصدار 2.0</p>
          </div>

          <nav aria-label="أقسام المنصة" className="mt-16 grid grid-cols-2 gap-5 sm:gap-7">
            {modules.map((module) => (
              <Link
                key={module.label}
                href={module.href}
                className="group flex min-h-[220px] flex-col items-center justify-center rounded-[2.15rem] border-2 border-[#55505f] bg-[#242127] px-4 py-8 text-center shadow-[0_5px_16px_rgba(0,0,0,0.18)] transition duration-200 hover:border-[#a47fa8] hover:bg-[#2b2730] hover:shadow-[0_8px_22px_rgba(0,0,0,0.28)] active:scale-[0.98] sm:min-h-[260px]"
              >
                <span aria-hidden="true" className="text-[4.6rem] leading-none drop-shadow-md transition duration-200 group-hover:-translate-y-1 sm:text-[5.25rem]">{module.icon}</span>
                <span className="mt-8 text-[clamp(1.65rem,5vw,2.35rem)] font-bold leading-none text-[#ecb9ee]">{module.label}</span>
              </Link>
            ))}

            <Link
              href="/settings"
              className="group col-span-2 flex min-h-[230px] flex-col items-center justify-center rounded-[2.15rem] border-2 border-[#55505f] bg-[#242127] px-4 py-8 text-center shadow-[0_5px_16px_rgba(0,0,0,0.18)] transition duration-200 hover:border-[#a47fa8] hover:bg-[#2b2730] hover:shadow-[0_8px_22px_rgba(0,0,0,0.28)] active:scale-[0.98] sm:min-h-[275px]"
            >
              <span aria-hidden="true" className="text-[5.3rem] leading-none grayscale drop-shadow-md transition duration-200 group-hover:-translate-y-1 sm:text-[6rem]">⚙️</span>
              <span className="mt-8 text-[clamp(1.65rem,5vw,2.35rem)] font-bold leading-none text-[#ecb9ee]">الإعدادات</span>
            </Link>
          </nav>
        </section>
      </main>
    </div>
  );
}
