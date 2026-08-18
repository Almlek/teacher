import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Archive as ArchiveIcon, BookOpenText, ClipboardList, FileText, GitBranch, Lightbulb, ListChecks } from "lucide-react";
import { Link } from "wouter";

const lessonSections = [
  { key: "plans", label: "الخطط", icon: FileText, field: "content", empty: "لا توجد خطط محفوظة بعد" },
  { key: "boards", label: "السبورات", icon: BookOpenText, field: "boardContent", empty: "لا توجد سبورات محفوظة بعد" },
  { key: "summaries", label: "الملخصات", icon: Lightbulb, field: "summaryContent", empty: "لا توجد ملخصات محفوظة بعد" },
  { key: "mindmaps", label: "الخرائط", icon: GitBranch, field: "mindMapContent", empty: "لا توجد خرائط ذهنية محفوظة بعد" },
  { key: "assessments", label: "إجابات التقويم", icon: ListChecks, field: "assessmentContent", empty: "لا توجد إجابات تقويمية محفوظة بعد" },
] as const;

export default function Archive() {
  const lessonsQuery = trpc.lessons.list.useQuery();
  const examsQuery = trpc.exams.list.useQuery();
  const lessons = lessonsQuery.data ?? [];
  const exams = examsQuery.data ?? [];
  const isLoading = lessonsQuery.isLoading || examsQuery.isLoading;

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-l from-primary/10 via-card to-blue-500/10 p-7 sm:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary"><ArchiveIcon className="h-4 w-4" /> الأرشيف الموحد</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">كل مخرجاتك التعليمية في مكان واحد</h1>
            <p className="mt-3 max-w-3xl leading-8 text-muted-foreground">انتقل بين الخطط والسبورات والملخصات والاختبارات والخرائط وإجابات التقويم دون البحث في صفحات متعددة.</p>
          </section>

          {isLoading ? <LoadingState variant="loading" title="جاري تحميل الأرشيف..." description="نجمع مخرجاتك التعليمية المحفوظة." /> : (
            <Tabs defaultValue="plans" dir="rtl">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
                {lessonSections.map((section) => <TabsTrigger key={section.key} value={section.key} className="gap-1.5 py-3 text-xs sm:text-sm"><section.icon className="h-4 w-4" />{section.label}</TabsTrigger>)}
                <TabsTrigger value="exams" className="gap-1.5 py-3 text-xs sm:text-sm"><ClipboardList className="h-4 w-4" /> الاختبارات</TabsTrigger>
              </TabsList>

              {lessonSections.map((section) => {
                const items = lessons.filter((lesson) => Boolean(lesson[section.field]));
                return <TabsContent key={section.key} value={section.key} className="mt-6"><ArchiveGrid items={items} section={section} /></TabsContent>;
              })}
              <TabsContent value="exams" className="mt-6"><ExamArchiveGrid exams={exams} /></TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
}

function ArchiveGrid({ items, section }: { items: any[]; section: (typeof lessonSections)[number] }) {
  if (!items.length) return <EmptyArchive title={section.empty} href="/prepare" action="إنشاء خطة جديدة" />;
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((lesson) => <Card key={lesson.id} className="border-border/70 shadow-sm"><CardHeader><CardTitle className="line-clamp-2 text-lg">{lesson.title}</CardTitle><div className="flex flex-wrap gap-2"><Badge variant="secondary">{lesson.subject}</Badge>{lesson.grade && <Badge variant="outline">{lesson.grade}</Badge>}</div></CardHeader><CardContent><p className="line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{String(lesson[section.field] || "").replace(/[#*_`]/g, "").slice(0, 320)}</p><Link href={`/lessons/${lesson.id}`} className="mt-4 inline-flex text-sm font-bold text-primary">فتح الخطة</Link></CardContent></Card>)}</div>;
}

function ExamArchiveGrid({ exams }: { exams: any[] }) {
  if (!exams.length) return <EmptyArchive title="لا توجد اختبارات محفوظة بعد" href="/exams/editor" action="فتح محرر الاختبارات" />;
  return <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{exams.map((exam) => <Card key={exam.id} className="border-border/70 shadow-sm"><CardHeader><CardTitle className="line-clamp-2 text-lg">{exam.title}</CardTitle><Badge variant="secondary" className="w-fit">{exam.examType === "formal" ? "رسمي" : exam.examType === "electronic" ? "إلكتروني" : "شامل"}</Badge></CardHeader><CardContent><p className="text-sm leading-7 text-muted-foreground">{exam.summaryContent || "اختبار محفوظ في الأرشيف."}</p><Link href={`/exams/editor?examId=${exam.id}`} className="mt-4 inline-flex text-sm font-bold text-primary">فتح المحرر</Link></CardContent></Card>)}</div>;
}

function EmptyArchive({ title, href, action }: { title: string; href: string; action: string }) {
  return <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center"><ArchiveIcon className="h-12 w-12 text-muted-foreground/40" /><h2 className="text-xl font-bold">{title}</h2><Link href={href} className="font-bold text-primary">{action}</Link></CardContent></Card>;
}
