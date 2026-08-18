import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock3, FilePlus2, GraduationCap, Plus } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const examTypeLabels: Record<string, string> = {
  comprehensive: "اختبار شامل",
  formal: "اختبار رسمي",
  electronic: "اختبار إلكتروني",
};

export default function Exams() {
  const examsQuery = trpc.exams.list.useQuery();
  const exams = examsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="flex flex-col justify-between gap-5 rounded-[2rem] border border-primary/15 bg-gradient-to-l from-primary/10 via-card to-blue-500/10 p-7 sm:flex-row sm:items-end sm:p-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary">
                <ClipboardList className="h-4 w-4" />
                وحدة الاختبارات
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">اختباراتك في مساحة واحدة</h1>
              <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">أنشئ اختباراً شاملاً أو رسمياً أو إلكترونياً، واحفظ الأسئلة والإجابات والدرجات ضمن أرشيفك التعليمي.</p>
            </div>
            <Link href="/exams/editor">
              <Button className="gap-2 rounded-xl px-5"><Plus className="h-4 w-4" /> اختبار جديد</Button>
            </Link>
          </section>

          {examsQuery.isLoading ? (
            <LoadingState variant="loading" title="جاري تحميل الاختبارات..." description="نستعيد أرشيف الاختبارات الخاص بك." />
          ) : examsQuery.isError ? (
            <LoadingState variant="error" title="تعذر تحميل الاختبارات" description="تحقق من الاتصال ثم حاول مرة أخرى." actionLabel="إعادة المحاولة" onAction={() => examsQuery.refetch()} />
          ) : exams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FilePlus2 className="h-8 w-8" /></div>
                <div><h2 className="text-xl font-bold">لم تنشئ اختباراً بعد</h2><p className="mt-2 text-sm leading-7 text-muted-foreground">ابدأ من محرر الاختبارات لبناء أول ورقة اختبار.</p></div>
                <Link href="/exams/editor"><Button className="rounded-xl">فتح المحرر</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <Card key={exam.id} className="border-border/70 bg-card/95 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="h-5 w-5" /></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{examTypeLabels[exam.examType] || exam.examType}</span></div>
                    <CardTitle className="pt-2 text-lg">{exam.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-3"><span>{exam.subject || "مادة غير محددة"}</span><span>{exam.grade || "صف غير محدد"}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{exam.durationMinutes ? `${exam.durationMinutes} دقيقة` : "بدون زمن"}</span></div>
                    <Link href={`/exams/editor?examId=${exam.id}`}><Button variant="outline" className="w-full rounded-xl">فتح في المحرر</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
