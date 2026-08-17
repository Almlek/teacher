import { useAuth } from "@/_core/hooks/useAuth";
import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Archive, Download, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function LessonsList() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const lessonsQuery = trpc.lessons.list.useQuery();
  const deleteMutation = trpc.lessons.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الخطة بنجاح");
      lessonsQuery.refetch();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  if (!isAuthenticated) return null;

  const lessons = lessonsQuery.data || [];
  const normalizedSearch = searchTerm.toLowerCase();
  const filteredLessons = lessons.filter((lesson) =>
    [lesson.title, lesson.subject, lesson.teacher, lesson.grade].some((value) => value?.toLowerCase().includes(normalizedSearch))
  );

  const exportLesson = (lesson: (typeof lessons)[number]) => {
    const content = lesson.content || `خطة درس: ${lesson.title}\nالمادة: ${lesson.subject}\nالصف: ${lesson.grade || "غير محدد"}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${lesson.title || "خطة-درس"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل نسخة نصية من الخطة");
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 lg:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"><Archive className="h-3.5 w-3.5" /> مساحة المعرفة</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">أرشيف الخطط</h1>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">راجع خططك السابقة، طوّرها، أو ابدأ من قالب قريب من احتياجك الحالي.</p>
          </div>
          <Button onClick={() => setLocation("/lessons/new")} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> خطة جديدة</Button>
        </div>

        <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1"><Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="البحث في الأرشيف" placeholder="ابحث بعنوان الخطة أو المادة أو المعلم..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-11 rounded-xl pr-10" /></div>
          <span className="px-2 text-sm text-muted-foreground">{filteredLessons.length} خطة</span>
        </div>

        {lessonsQuery.isLoading ? (
          <LoadingState variant="loading" title="جاري تحميل الأرشيف..." description="نرتب خططك المحفوظة لتصل إليها بسرعة." />
        ) : lessonsQuery.isError ? (
          <LoadingState variant="error" title="تعذر تحميل الأرشيف" description="تحقق من الاتصال ثم أعد المحاولة." actionLabel="إعادة المحاولة" onAction={() => lessonsQuery.refetch()} />
        ) : filteredLessons.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center"><Archive className="mx-auto h-12 w-12 text-muted-foreground/50" /><h2 className="mt-5 text-xl font-extrabold">لا توجد خطط مطابقة</h2><p className="mt-2 text-muted-foreground">أنشئ خطة جديدة أو جرّب عبارة بحث مختلفة.</p><Button onClick={() => setLocation("/lessons/new")} className="mt-6 gap-2 rounded-xl"><Plus className="h-4 w-4" /> إنشاء خطة جديدة</Button></div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="overflow-hidden rounded-3xl border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-br from-primary/8 to-blue-500/5"><CardTitle className="line-clamp-2 text-lg">{lesson.title}</CardTitle><CardDescription className="flex flex-wrap gap-2 pt-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{lesson.subject}</span>{lesson.grade && <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600">{lesson.grade}</span>}</CardDescription></CardHeader>
                <CardContent className="space-y-4 pt-5"><div className="space-y-1 text-sm text-muted-foreground">{lesson.teacher && <p>المعلم: {lesson.teacher}</p>}{lesson.date && <p>التاريخ: {lesson.date}</p>}{lesson.school && <p>المدرسة: {lesson.school}</p>}</div><div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1 gap-2 rounded-xl" onClick={() => setLocation(`/lessons/${lesson.id}`)}><Eye className="h-4 w-4" /> عرض الخطة</Button><Button variant="ghost" size="sm" className="gap-1.5 rounded-xl" onClick={() => exportLesson(lesson)} aria-label={`تصدير ${lesson.title}`}><Download className="h-4 w-4" /> تصدير</Button><Button variant="destructive" size="sm" className="rounded-xl" onClick={() => { if (window.confirm("هل تريد حذف هذه الخطة؟")) deleteMutation.mutate({ id: lesson.id }); }} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" /></Button></div></CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
