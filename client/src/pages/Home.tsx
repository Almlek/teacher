import { startLogin } from "@/const";
import PublicNav from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, BookOpen, Check, FolderSearch, LayoutTemplate, Library, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "wouter";

const capabilities = [
  {
    icon: WandSparkles,
    title: "توليد ذكي منظم",
    description: "أنشئ خطة متوازنة تشمل الأهداف والتمهيد والأنشطة والتقويم بلغة واضحة ومناسبة للصف.",
    tone: "from-violet-500/15 to-fuchsia-500/10 text-violet-600",
  },
  {
    icon: LayoutTemplate,
    title: "قالب جاهز للتدريس",
    description: "انتقل من فكرة الدرس إلى مستند مرتب يسهل مراجعته وتعديله وطباعته قبل الحصة.",
    tone: "from-blue-500/15 to-cyan-500/10 text-blue-600",
  },
  {
    icon: FolderSearch,
    title: "أرشيف قابل للبحث",
    description: "احتفظ بخططك السابقة في مساحة واحدة، ثم اعثر عليها حسب المادة أو الصف أو عنوان الدرس.",
    tone: "from-emerald-500/15 to-teal-500/10 text-emerald-600",
  },
  {
    icon: Library,
    title: "مكتبة مصادر تعليمية",
    description: "نظّم المراجع والملفات التي تعتمد عليها لتعود إليها عند إعداد درس جديد.",
    tone: "from-amber-500/15 to-orange-500/10 text-amber-600",
  },
];

const steps = [
  { number: "01", title: "أدخل تفاصيل الدرس", description: "المادة والصف والعنوان والمدة وأي سياق تريد أن يعتمد عليه التوليد." },
  { number: "02", title: "اختر أسلوب التوليد", description: "حدد اللغة والنموذج ومصدر المحتوى المناسب لطبيعة حصتك." },
  { number: "03", title: "راجع خطتك وطورها", description: "احصل على مسودة واضحة ثم عدّلها أو احفظها أو صدّرها بالطريقة المناسبة." },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <PublicNav />

      <main>
        <section className="relative isolate overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_12%_14%,hsl(var(--primary)/0.16),transparent_30%),radial-gradient(circle_at_90%_0%,hsl(205_90%_60%/0.14),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.16))]">
          <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="container grid gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-sm font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                مساحة عمل عربية للمعلم العصري
              </div>
              <h1 className="text-4xl font-black leading-[1.18] tracking-tight sm:text-5xl lg:text-6xl">
                حضّر درسك بوضوح،
                <span className="block bg-gradient-to-l from-primary via-violet-500 to-blue-500 bg-clip-text text-transparent">واعلّم بثقة.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-9 text-muted-foreground sm:text-xl">
                دفتر التحضير الذكي يساعدك على بناء خطط دروس عملية ومنظمة، ويمنحك مساحة هادئة لتجميع أفكارك ومصادرك قبل دخول الفصل.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-13 gap-2 rounded-2xl px-6 text-base shadow-xl shadow-primary/20">
                  <Link href={user ? "/lessons/new" : "/lessons/new"}>
                    ابدأ تحضيراً جديداً
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-13 gap-2 rounded-2xl px-6 text-base">
                  <Link href="/library">
                    استكشف المكتبة
                    <BookOpen className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> واجهة عربية RTL</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> حفظ وتنظيم الخطط</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> قابل للتخصيص</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mr-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-blue-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-card/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
                <div className="flex items-center justify-between border-b border-border/70 px-3 pb-4">
                  <div className="flex items-center gap-2 text-sm font-bold"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> مساحة التحضير</div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">مسودة جديدة</span>
                </div>
                <div className="grid gap-4 p-3 sm:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-3 rounded-2xl bg-muted/35 p-4">
                    <p className="text-xs font-bold text-muted-foreground">بيانات الحصة</p>
                    <div className="space-y-2">
                      <div className="h-10 rounded-xl border border-border/70 bg-background" />
                      <div className="grid grid-cols-2 gap-2"><div className="h-10 rounded-xl border border-border/70 bg-background" /><div className="h-10 rounded-xl border border-border/70 bg-background" /></div>
                      <div className="h-20 rounded-xl border border-border/70 bg-background" />
                    </div>
                    <div className="h-10 rounded-xl bg-gradient-to-l from-primary to-blue-500" />
                  </div>
                  <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 to-blue-500/8 p-4">
                    <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold text-primary">اقتراح ذكي</p><p className="mt-1 font-bold">الكسور الاعتيادية</p></div><WandSparkles className="h-5 w-5 text-primary" /></div>
                    <div className="space-y-3">
                      <div className="h-3 w-4/5 rounded-full bg-foreground/10" />
                      <div className="h-3 w-full rounded-full bg-foreground/10" />
                      <div className="h-3 w-3/5 rounded-full bg-foreground/10" />
                      <div className="mt-7 grid grid-cols-2 gap-2"><div className="h-20 rounded-xl bg-background/80" /><div className="h-20 rounded-xl bg-background/80" /></div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-emerald-500" /> جاهز للمراجعة والتعديل</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-5 hidden items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-xl sm:flex"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Check className="h-5 w-5" /></span><div><p className="text-xs text-muted-foreground">الخطوة التالية</p><p className="text-sm font-bold">راجع أهداف الدرس</p></div></div>
            </div>
          </div>
        </section>

        <section className="container py-20 lg:py-28">
          <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">كل ما تحتاجه في مكان واحد</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">أدوات بسيطة لعمل أكثر تركيزاً</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">صممنا التجربة لتساعدك على التفكير في جودة الدرس، لا في تنسيق المستندات وتبعثر الملفات.</p></div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => { const Icon = item.icon; return <article key={item.title} className="group rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"><div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone}`}><Icon className="h-6 w-6" /></div><h3 className="text-lg font-extrabold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p></article>; })}
          </div>
        </section>

        <section className="border-y border-border/70 bg-muted/20">
          <div className="container grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:py-24">
            <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">طريقة العمل</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">من الفكرة إلى خطة جاهزة في ثلاث خطوات</h2><p className="mt-5 max-w-md leading-8 text-muted-foreground">ابدأ بالمعلومات التي تعرفها، ودع الأدوات تساعدك على ترتيب التفاصيل دون أن تفقد أسلوبك التربوي.</p><Button asChild variant="outline" className="mt-7 gap-2 rounded-xl"><Link href="/lessons/new">جرّب النموذج الآن <ArrowLeft className="h-4 w-4" /></Link></Button></div>
            <div className="space-y-4">{steps.map((step) => <div key={step.number} className="flex gap-5 rounded-3xl border border-border/70 bg-card p-5 shadow-sm"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">{step.number}</span><div><h3 className="font-extrabold">{step.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p></div></div>)}</div>
          </div>
        </section>

        <section className="container py-20 lg:py-28">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-2xl shadow-slate-900/20 sm:px-12 lg:px-16"><div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" /><div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" /><div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center"><div className="max-w-2xl"><p className="text-sm font-bold text-violet-300">مساحتك التعليمية تبدأ هنا</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">اجعل التحضير عادة هادئة ومنظمة.</h2><p className="mt-4 leading-8 text-slate-300">أنشئ حسابك وابدأ ببناء أول خطة، أو استكشف المكتبة لترتيب مصادرك التعليمية.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Button asChild size="lg" className="gap-2 rounded-2xl bg-white text-slate-950 hover:bg-slate-100"><Link href="/lessons/new">أنشئ أول خطة <ArrowLeft className="h-5 w-5" /></Link></Button><Button asChild size="lg" variant="outline" className="gap-2 rounded-2xl border-slate-700 bg-transparent text-white hover:bg-slate-900"><Link href="/library">افتح المكتبة <BookOpen className="h-5 w-5" /></Link></Button></div></div></div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-muted/15"><div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 font-bold text-foreground"><BookOpen className="h-4 w-4 text-primary" /> دفتر التحضير الذكي</div><p>{loading ? "" : user ? `مرحباً ${user.name || "بك"} — مساحتك جاهزة.` : "أدوات عربية تساعد المعلم على التحضير بتركيز."}</p><button type="button" onClick={startLogin} className="font-semibold text-primary hover:underline">تسجيل الدخول</button></div></footer>
    </div>
  );
}
