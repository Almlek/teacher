import PublicNav from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BookMarked, Filter, Loader2, Plus, Search, Trash2 } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const questionTypeLabels: Record<string, string> = {
  multiple_choice: "اختيار من متعدد",
  true_false: "صح أو خطأ",
  short_answer: "إجابة قصيرة",
  essay: "مقالي",
};

const difficultyLabels: Record<string, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "متقدم",
};

const initialForm = {
  subject: "",
  grade: "",
  questionType: "multiple_choice",
  difficulty: "medium",
  prompt: "",
  options: "",
  correctAnswer: "",
  explanation: "",
  marks: "1",
};

export default function QuestionBank() {
  const bankQuery = trpc.questionBank.list.useQuery();
  const examsQuery = trpc.exams.list.useQuery();
  const createMutation = trpc.questionBank.create.useMutation();
  const importMutation = trpc.questionBank.importFromExam.useMutation();
  const deleteMutation = trpc.questionBank.delete.useMutation();
  const utils = trpc.useUtils();
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState("");

  const subjects = useMemo(() => Array.from(new Set((bankQuery.data || []).map((item) => item.subject).filter(Boolean) as string[])), [bankQuery.data]);
  const grades = useMemo(() => Array.from(new Set((bankQuery.data || []).map((item) => item.grade).filter(Boolean) as string[])), [bankQuery.data]);
  const searchInput = useMemo(() => ({
    query: search || undefined,
    subject: filterSubject === "all" ? undefined : filterSubject,
    grade: filterGrade === "all" ? undefined : filterGrade,
    questionType: filterType === "all" ? undefined : filterType,
    difficulty: filterDifficulty === "all" ? undefined : filterDifficulty,
  }), [filterDifficulty, filterGrade, filterSubject, filterType, search]);
  const searchQuery = trpc.questionBank.search.useQuery(searchInput);
  const filteredItems = searchQuery.data || [];

  const updateForm = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleCreate = async () => {
    if (!form.prompt.trim()) {
      toast.error("اكتب نص السؤال أولاً");
      return;
    }
    try {
      await createMutation.mutateAsync({
        subject: form.subject || undefined,
        grade: form.grade || undefined,
        questionType: form.questionType,
        difficulty: form.difficulty,
        prompt: form.prompt.trim(),
        options: form.options || undefined,
        correctAnswer: form.correctAnswer || undefined,
        explanation: form.explanation || undefined,
        marks: Number(form.marks) || 1,
      });
      setForm(initialForm);
      await utils.questionBank.list.invalidate();
      toast.success("تمت إضافة السؤال إلى بنك الأسئلة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إضافة السؤال");
    }
  };

  const handleImportFromExam = async () => {
    if (!selectedExamId) {
      toast.error("اختر اختباراً لاستيراد أسئلته");
      return;
    }
    try {
      const result = await importMutation.mutateAsync({ examId: Number(selectedExamId) });
      await Promise.all([utils.questionBank.list.invalidate(), utils.questionBank.search.invalidate()]);
      toast.success(`تم استيراد ${result.importedCount} سؤالاً إلى البنك`);
      setSelectedExamId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر استيراد أسئلة الاختبار");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل تريد حذف هذا السؤال من بنك الأسئلة؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      await utils.questionBank.list.invalidate();
      toast.success("تم حذف السؤال");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حذف السؤال");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 sm:py-14">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/[0.12] via-background to-blue-500/[0.08] p-7 sm:p-10">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-xs font-bold text-primary"><BookMarked className="h-3.5 w-3.5" /> مورد تعليمي قابل لإعادة الاستخدام</span>
                <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">بنك الأسئلة</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">احفظ الأسئلة المميزة حسب المادة والصف والصعوبة، ثم أدرجها مباشرة داخل أي اختبار من محرر الاختبارات.</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><BookMarked className="h-7 w-7" /></div>
            </div>
          </section>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" />إضافة سؤال إلى البنك</CardTitle><CardDescription>يمكنك أيضاً حفظ أي سؤال مباشرة من محرر الاختبارات.</CardDescription></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="bank-subject">المادة</Label><Input id="bank-subject" value={form.subject} onChange={(event) => updateForm("subject", event.target.value)} placeholder="العلوم" /></div>
              <div className="space-y-2"><Label htmlFor="bank-grade">الصف</Label><Input id="bank-grade" value={form.grade} onChange={(event) => updateForm("grade", event.target.value)} placeholder="السادس" /></div>
              <div className="space-y-2"><Label>نوع السؤال</Label><Select value={form.questionType} onValueChange={(value) => updateForm("questionType", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiple_choice">اختيار من متعدد</SelectItem><SelectItem value="true_false">صح أو خطأ</SelectItem><SelectItem value="short_answer">إجابة قصيرة</SelectItem><SelectItem value="essay">مقالي</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>الصعوبة</Label><Select value={form.difficulty} onValueChange={(value) => updateForm("difficulty", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">سهل</SelectItem><SelectItem value="medium">متوسط</SelectItem><SelectItem value="hard">متقدم</SelectItem></SelectContent></Select></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="bank-prompt">نص السؤال *</Label><Textarea id="bank-prompt" value={form.prompt} onChange={(event) => updateForm("prompt", event.target.value)} rows={3} placeholder="اكتب سؤالاً قابلاً لإعادة الاستخدام..." /></div>
              <div className="space-y-2"><Label htmlFor="bank-options">الخيارات</Label><Input id="bank-options" value={form.options} onChange={(event) => updateForm("options", event.target.value)} placeholder="أ) ... | ب) ..." /></div>
              <div className="space-y-2"><Label htmlFor="bank-answer">الإجابة الصحيحة</Label><Input id="bank-answer" value={form.correctAnswer} onChange={(event) => updateForm("correctAnswer", event.target.value)} placeholder="الإجابة النموذجية" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="bank-explanation">شرح الإجابة</Label><Textarea id="bank-explanation" value={form.explanation} onChange={(event) => updateForm("explanation", event.target.value)} rows={2} placeholder="توضيح اختياري..." /></div>
              <div className="space-y-2"><Label htmlFor="bank-marks">الدرجة</Label><Input id="bank-marks" type="number" min="1" value={form.marks} onChange={(event) => updateForm("marks", event.target.value)} /></div>
              <div className="flex items-end"><Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full gap-2 rounded-xl">{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}حفظ في بنك الأسئلة</Button></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookMarked className="h-5 w-5 text-primary" />استيراد أسئلة من اختبار</CardTitle><CardDescription>أضف جميع أسئلة اختبار محفوظ إلى البنك لتعديلها وإعادة استخدامها لاحقاً.</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Select value={selectedExamId} onValueChange={setSelectedExamId}><SelectTrigger aria-label="الاختبار المراد استيراد أسئلته" className="flex-1"><SelectValue placeholder="اختر اختباراً محفوظاً" /></SelectTrigger><SelectContent>{examsQuery.data?.length ? examsQuery.data.map((exam) => <SelectItem key={exam.id} value={String(exam.id)}>{exam.title}</SelectItem>) : <SelectItem value="empty" disabled>لا توجد اختبارات محفوظة</SelectItem>}</SelectContent></Select>
              <Button onClick={() => void handleImportFromExam()} disabled={importMutation.isPending || !selectedExamId} className="gap-2 rounded-xl">{importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookMarked className="h-4 w-4" />}استيراد الأسئلة</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" />البحث والتصفية</CardTitle><CardDescription>{filteredItems.length} سؤالاً متاحاً للإدراج في الاختبارات.</CardDescription></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative sm:col-span-2 lg:col-span-1"><Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pr-9" placeholder="ابحث في نص السؤال..." /></div>
              <Select value={filterSubject} onValueChange={setFilterSubject}><SelectTrigger aria-label="تصفية المادة"><SelectValue placeholder="كل المواد" /></SelectTrigger><SelectContent><SelectItem value="all">كل المواد</SelectItem>{subjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent></Select>
              <Select value={filterGrade} onValueChange={setFilterGrade}><SelectTrigger aria-label="تصفية الصف"><SelectValue placeholder="كل الصفوف" /></SelectTrigger><SelectContent><SelectItem value="all">كل الصفوف</SelectItem>{grades.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select>
              <Select value={filterType} onValueChange={setFilterType}><SelectTrigger aria-label="تصفية النوع"><SelectValue placeholder="كل الأنواع" /></SelectTrigger><SelectContent><SelectItem value="all">كل الأنواع</SelectItem>{Object.entries(questionTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}><SelectTrigger aria-label="تصفية الصعوبة"><SelectValue placeholder="كل الصعوبات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الصعوبات</SelectItem>{Object.entries(difficultyLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
            </CardContent>
          </Card>

          {bankQuery.isLoading || searchQuery.isLoading ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />جاري تحميل بنك الأسئلة...</CardContent></Card> : filteredItems.length === 0 ? <Card><CardContent className="py-16 text-center text-muted-foreground">لا توجد أسئلة مطابقة للبحث الحالي.</CardContent></Card> : <div className="grid gap-4 lg:grid-cols-2">{filteredItems.map((item) => <Card key={item.id} className="overflow-hidden"><CardContent className="space-y-4 p-5"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{questionTypeLabels[item.questionType] || item.questionType}</span><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-700">{difficultyLabels[item.difficulty] || item.difficulty}</span></div><Button variant="ghost" size="icon" aria-label={`حذف ${item.prompt}`} onClick={() => handleDelete(item.id)} disabled={deleteMutation.isPending} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></div><p className="text-base font-bold leading-8">{item.prompt}</p>{item.imageUrl && <img src={item.imageUrl} alt="رسم توضيحي للسؤال" className="max-h-48 w-full rounded-xl border object-contain" />}<div className="flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{item.subject || "بدون مادة"}</span><span>{item.grade || "بدون صف"}</span><span>{item.marks} درجة</span></div></CardContent></Card>)}</div>}
        </div>
      </main>
    </div>
  );
}
