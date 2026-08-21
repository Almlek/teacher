import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Clock3, FilePlus2, GraduationCap, Plus, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const examTypeLabels: Record<string, string> = {
  comprehensive: "اختبار شامل",
  formal: "اختبار رسمي",
  electronic: "اختبار إلكتروني",
};

const difficultyLabels = { easy: "سهل", medium: "متوسط", hard: "متقدم" } as const;
const questionTypeLabels = {
  mixed: "متنوع",
  multiple_choice: "اختيار من متعدد",
  true_false: "صح أو خطأ",
  essay: "مقالي",
} as const;

export default function Exams() {
  const [, setLocation] = useLocation();
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [examType, setExamType] = useState<"comprehensive" | "formal" | "electronic">("comprehensive");
  const [questionCount, setQuestionCount] = useState("10");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [preferredType, setPreferredType] = useState<"mixed" | "multiple_choice" | "true_false" | "essay">("mixed");
  const [aiModel, setAiModel] = useState<"gemini-1.5-flash" | "gemini-1.5-pro">("gemini-1.5-flash");
  const examsQuery = trpc.exams.list.useQuery();
  const lessonsQuery = trpc.lessons.list.useQuery();
  const generateMutation = trpc.exams.generateFromLesson.useMutation({
    onSuccess: (result) => {
      toast.success(`تم توليد ${result.questionCount} أسئلة وحفظ الاختبار بنجاح`);
      setGeneratorOpen(false);
      setLocation(`/exams/editor?examId=${result.examId}`);
    },
    onError: (error) => toast.error(error.message || "تعذر توليد الاختبار"),
  });
  const exams = examsQuery.data ?? [];
  const lessons = lessonsQuery.data ?? [];

  const handleGenerate = () => {
    const lessonId = Number(selectedLessonId);
    const count = Number(questionCount);
    if (!lessonId) {
      toast.error("اختر درساً مصدرًا لتوليد الاختبار");
      return;
    }
    if (!Number.isInteger(count) || count < 3 || count > 30) {
      toast.error("عدد الأسئلة يجب أن يكون بين 3 و30");
      return;
    }
    generateMutation.mutate({ lessonId, examType, questionCount: count, difficulty, preferredType, language: "ar", aiModel });
  };

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
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setGeneratorOpen(true)} className="gap-2 rounded-xl px-5"><Sparkles className="h-4 w-4" /> توليد اختبار ذكي</Button>
              <Link href="/exams/editor">
                <Button variant="outline" className="gap-2 rounded-xl px-5"><Plus className="h-4 w-4" /> اختبار يدوي</Button>
              </Link>
            </div>
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

      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-primary" /> توليد اختبار ذكي من درس</DialogTitle>
            <DialogDescription>اختر خطة درس محفوظة، وسيحوّل الذكاء الاصطناعي محتواها إلى اختبار جاهز مع الإجابات والدرجات.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sourceLesson">الدرس المصدر</Label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId} disabled={lessonsQuery.isLoading || generateMutation.isPending}>
                <SelectTrigger id="sourceLesson"><SelectValue placeholder={lessonsQuery.isLoading ? "جاري تحميل الدروس..." : "اختر درساً محفوظاً"} /></SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => <SelectItem key={lesson.id} value={String(lesson.id)}>{lesson.title} — {lesson.subject || "مادة غير محددة"}</SelectItem>)}
                </SelectContent>
              </Select>
              {!lessonsQuery.isLoading && lessons.length === 0 && <p className="text-xs text-muted-foreground">أنشئ خطة درس أولاً حتى تستخدم التوليد الذكي.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="generatedExamType">نوع الاختبار</Label>
              <Select value={examType} onValueChange={(value) => setExamType(value as typeof examType)} disabled={generateMutation.isPending}>
                <SelectTrigger id="generatedExamType"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(examTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="generatedDifficulty">الصعوبة</Label>
              <Select value={difficulty} onValueChange={(value) => setDifficulty(value as typeof difficulty)} disabled={generateMutation.isPending}>
                <SelectTrigger id="generatedDifficulty"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(difficultyLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="generatedQuestionType">نوع الأسئلة</Label>
              <Select value={preferredType} onValueChange={(value) => setPreferredType(value as typeof preferredType)} disabled={generateMutation.isPending}>
                <SelectTrigger id="generatedQuestionType"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(questionTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="generatedQuestionCount">عدد الأسئلة</Label>
              <Input id="generatedQuestionCount" type="number" min={3} max={30} value={questionCount} onChange={(event) => setQuestionCount(event.target.value)} disabled={generateMutation.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generatedAiModel">نموذج الذكاء الاصطناعي</Label>
              <Select value={aiModel} onValueChange={(value) => setAiModel(value as typeof aiModel)} disabled={generateMutation.isPending}>
                <SelectTrigger id="generatedAiModel"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="gemini-1.5-flash">Gemini Flash — أسرع</SelectItem><SelectItem value="gemini-1.5-pro">Gemini Pro — أعمق</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGeneratorOpen(false)} disabled={generateMutation.isPending}>إلغاء</Button>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending || lessons.length === 0} className="gap-2">{generateMutation.isPending ? "جاري بناء الأسئلة..." : <><Sparkles className="h-4 w-4" /> توليد وحفظ الاختبار</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
