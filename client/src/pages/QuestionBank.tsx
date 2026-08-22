import PublicNav from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import QuestionBankStats, { type QuestionBankChartFilter } from "@/components/QuestionBankStats";
import { BarChart3, BookMarked, CheckCircle2, Download, FileSpreadsheet, Filter, Image as ImageIcon, Loader2, Plus, Search, Sparkles, Trash2, Upload, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { downloadQuestionBankAsCsv, printQuestionBankAsPdf } from "@/lib/questionBankExport";
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
  tags: "",
  marks: "1",
};

type ImageQuestion = {
  questionType: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  tags: string;
};

type ImageAssessment = {
  title: string;
  visualSummary: string;
  learningObjectives: string[];
  assessmentNotes: string;
  questions: ImageQuestion[];
  imageUrl: string;
};

export default function QuestionBank() {
  const bankQuery = trpc.questionBank.list.useQuery();
  const examsQuery = trpc.exams.list.useQuery();
  const createMutation = trpc.questionBank.create.useMutation();
  const analyzeMutation = trpc.questionBank.analyzeImage.useMutation();
  const importMutation = trpc.questionBank.importFromExam.useMutation();
  const deleteMutation = trpc.questionBank.delete.useMutation();
  const utils = trpc.useUtils();
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [activeChartFilter, setActiveChartFilter] = useState<QuestionBankChartFilter | null>(null);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [analysisImageData, setAnalysisImageData] = useState("");
  const [analysisMimeType, setAnalysisMimeType] = useState<"image/jpeg" | "image/png" | "image/webp" | "image/gif">("image/png");
  const [analysisPreview, setAnalysisPreview] = useState("");
  const [analysisTitle, setAnalysisTitle] = useState("");
  const [analysisSubject, setAnalysisSubject] = useState("");
  const [analysisGrade, setAnalysisGrade] = useState("");
  const [analysisTags, setAnalysisTags] = useState("تحليل صورة");
  const [analysisCount, setAnalysisCount] = useState("5");
  const [analysisDifficulty, setAnalysisDifficulty] = useState("medium");
  const [analysisType, setAnalysisType] = useState("mixed");
  const [analysisResult, setAnalysisResult] = useState<ImageAssessment | null>(null);

  const subjects = useMemo(() => Array.from(new Set((bankQuery.data || []).map((item) => item.subject).filter(Boolean) as string[])), [bankQuery.data]);
  const grades = useMemo(() => Array.from(new Set((bankQuery.data || []).map((item) => item.grade).filter(Boolean) as string[])), [bankQuery.data]);
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    (bankQuery.data || []).forEach((item) => {
      if (item.tags) {
        item.tags.split(",").forEach((t) => {
          const clean = t.trim();
          if (clean) tagSet.add(clean);
        });
      }
    });
    return Array.from(tagSet);
  }, [bankQuery.data]);

  const searchInput = useMemo(() => ({
    query: search || undefined,
    subject: filterSubject === "all" ? undefined : filterSubject,
    grade: filterGrade === "all" ? undefined : filterGrade,
    questionType: filterType === "all" ? undefined : filterType,
    difficulty: filterDifficulty === "all" ? undefined : filterDifficulty,
    tag: filterTag === "all" ? undefined : filterTag,
  }), [filterDifficulty, filterGrade, filterSubject, filterTag, filterType, search]);
  const settingsQuery = trpc.settings.get.useQuery();
  const searchQuery = trpc.questionBank.search.useQuery(searchInput);
  const filteredItems = searchQuery.data || [];

  const updateForm = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleChartFilter = (filter: QuestionBankChartFilter) => {
    const isSame = activeChartFilter?.dimension === filter.dimension && activeChartFilter.value === filter.value;
    if (filter.dimension === "subject") setFilterSubject(isSame ? "all" : filter.value);
    if (filter.dimension === "difficulty") setFilterDifficulty(isSame ? "all" : filter.value);
    if (filter.dimension === "questionType") setFilterType(isSame ? "all" : filter.value);
    setActiveChartFilter(isSame ? null : filter);
  };

  const clearChartFilter = () => {
    if (!activeChartFilter) return;
    if (activeChartFilter.dimension === "subject") setFilterSubject("all");
    if (activeChartFilter.dimension === "difficulty") setFilterDifficulty("all");
    if (activeChartFilter.dimension === "questionType") setFilterType("all");
    setActiveChartFilter(null);
  };

  const exportTitle = activeChartFilter ? `أسئلة-${activeChartFilter.label}` : "قائمة-الأسئلة";
  const handleExportCsv = () => {
    if (!filteredItems.length) {
      toast.error("لا توجد أسئلة مطابقة لتصديرها");
      return;
    }
    downloadQuestionBankAsCsv(filteredItems, exportTitle);
    toast.success("تم تنزيل ملف CSV للقائمة المصفاة");
  };
  const handleExportPdf = () => {
    if (!filteredItems.length) {
      toast.error("لا توجد أسئلة مطابقة لتصديرها");
      return;
    }
    try {
      printQuestionBankAsPdf(filteredItems, exportTitle, window.open, {
        header: settingsQuery.data?.pdfHeader || settingsQuery.data?.defaultSchool,
        logoUrl: settingsQuery.data?.schoolLogoUrl,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر فتح نافذة الطباعة");
    }
  };

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
        tags: form.tags || undefined,
        marks: Number(form.marks) || 1,
      });
      setForm(initialForm);
      await Promise.all([utils.questionBank.list.invalidate(), utils.questionBank.search.invalidate(), utils.questionBank.stats.invalidate()]);
      toast.success("تمت إضافة السؤال إلى بنك الأسئلة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر إضافة السؤال");
    }
  };

  const handleAnalyzeImage = async () => {
    if (!analysisImageData) {
      toast.error("اختر صورة أو رسماً تعليمياً أولاً");
      return;
    }
    try {
      const result = await analyzeMutation.mutateAsync({
        imageData: analysisImageData,
        mimeType: analysisMimeType,
        title: analysisTitle || undefined,
        subject: analysisSubject || undefined,
        grade: analysisGrade || undefined,
        questionCount: Number(analysisCount) || 5,
        difficulty: analysisDifficulty as "easy" | "medium" | "hard",
        preferredType: analysisType as "mixed" | "multiple_choice" | "true_false" | "short_answer" | "essay",
        language: "ar",
        aiModel: "gemini-1.5-flash",
        tags: analysisTags || undefined,
      });
      setAnalysisResult(result);
      setAnalysisPreview(result.imageUrl);
      toast.success("تم تحليل الصورة وتوليد مسودة الأسئلة. راجعها قبل الحفظ.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحليل الصورة");
    }
  };

  const handleAnalysisFile = (file?: File) => {
    if (!file) return;
    const supported = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!supported.includes(file.type)) {
      toast.error("اختر صورة بصيغة JPG أو PNG أو WEBP أو GIF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ألا يتجاوز 10 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      const encoded = value.split(",")[1] || "";
      setAnalysisImageData(encoded);
      setAnalysisMimeType(file.type as typeof analysisMimeType);
      setAnalysisPreview(value);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveGeneratedQuestion = async (question: ImageQuestion) => {
    if (!analysisResult) return;
    try {
      await createMutation.mutateAsync({
        subject: analysisSubject || undefined,
        grade: analysisGrade || undefined,
        questionType: question.questionType,
        difficulty: analysisDifficulty,
        prompt: question.prompt,
        options: question.options.length ? question.options.join("\n") : undefined,
        correctAnswer: question.correctAnswer || undefined,
        explanation: question.explanation || undefined,
        imageUrl: analysisResult.imageUrl,
        tags: question.tags || analysisTags || undefined,
        marks: question.marks,
      });
      await Promise.all([utils.questionBank.list.invalidate(), utils.questionBank.search.invalidate(), utils.questionBank.stats.invalidate()]);
      toast.success("تم حفظ السؤال الناتج في بنك الأسئلة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ السؤال الناتج");
    }
  };

  const handleImportFromExam = async () => {
    if (!selectedExamId) {
      toast.error("اختر اختباراً لاستيراد أسئلته");
      return;
    }
    try {
      const result = await importMutation.mutateAsync({ examId: Number(selectedExamId) });
      await Promise.all([utils.questionBank.list.invalidate(), utils.questionBank.search.invalidate(), utils.questionBank.stats.invalidate()]);
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
      await Promise.all([utils.questionBank.list.invalidate(), utils.questionBank.search.invalidate(), utils.questionBank.stats.invalidate()]);
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

          <QuestionBankStats onFilter={handleChartFilter} />

          {activeChartFilter && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /><span>تصفية من الرسم:</span><span className="rounded-full bg-primary px-3 py-1 font-bold text-primary-foreground">{activeChartFilter.label}</span></div><Button variant="ghost" size="sm" onClick={clearChartFilter} className="gap-1.5 text-primary hover:bg-primary/10"><X className="h-4 w-4" />إزالة التصفية</Button></div>}

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
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="bank-tags">الإشارات (Tags)</Label><Input id="bank-tags" value={form.tags} onChange={(event) => updateForm("tags", event.target.value)} placeholder="مثال: فصل أول, مهم, مراجعة" /></div>
              <div className="flex items-end sm:col-span-2"><Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full gap-2 rounded-xl">{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}حفظ في بنك الأسئلة</Button></div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] via-background to-blue-500/[0.05]">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />تحليل صورة وتوليد أسئلة بالذكاء الاصطناعي</CardTitle><CardDescription>ارفع خريطة أو مخططاً أو رسماً تعليمياً، وسيقترح الذكاء الاصطناعي أسئلة وتقييماً أولياً. راجع النتائج قبل حفظها.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="analysis-image">الصورة التعليمية</Label><Input id="analysis-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => handleAnalysisFile(event.target.files?.[0])} /></div>
                <div className="space-y-2"><Label htmlFor="analysis-title">عنوان التحليل</Label><Input id="analysis-title" value={analysisTitle} onChange={(event) => setAnalysisTitle(event.target.value)} placeholder="مثال: دورة الماء" /></div>
                <div className="space-y-2"><Label htmlFor="analysis-tags">إشارات النتائج</Label><Input id="analysis-tags" value={analysisTags} onChange={(event) => setAnalysisTags(event.target.value)} placeholder="تحليل صورة, مراجعة" /></div>
                <div className="space-y-2"><Label htmlFor="analysis-subject">المادة</Label><Input id="analysis-subject" value={analysisSubject} onChange={(event) => setAnalysisSubject(event.target.value)} placeholder="العلوم" /></div>
                <div className="space-y-2"><Label htmlFor="analysis-grade">الصف</Label><Input id="analysis-grade" value={analysisGrade} onChange={(event) => setAnalysisGrade(event.target.value)} placeholder="السادس" /></div>
                <div className="space-y-2"><Label>عدد الأسئلة</Label><Input type="number" min="1" max="20" value={analysisCount} onChange={(event) => setAnalysisCount(event.target.value)} /></div>
                <div className="space-y-2"><Label>الصعوبة</Label><Select value={analysisDifficulty} onValueChange={setAnalysisDifficulty}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="easy">سهل</SelectItem><SelectItem value="medium">متوسط</SelectItem><SelectItem value="hard">متقدم</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>نوع الأسئلة</Label><Select value={analysisType} onValueChange={setAnalysisType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mixed">متنوعة</SelectItem><SelectItem value="multiple_choice">اختيار من متعدد</SelectItem><SelectItem value="true_false">صح أو خطأ</SelectItem><SelectItem value="short_answer">إجابة قصيرة</SelectItem><SelectItem value="essay">مقالية</SelectItem></SelectContent></Select></div>
              </div>
              {analysisPreview && <div className="grid gap-4 rounded-2xl border border-dashed border-primary/30 bg-background/70 p-4 sm:grid-cols-[180px_1fr]"><img src={analysisPreview} alt="معاينة الصورة التعليمية" className="h-36 w-full rounded-xl border object-contain" /><div className="flex flex-col justify-center gap-2 text-sm text-muted-foreground"><div className="flex items-center gap-2 font-bold text-foreground"><ImageIcon className="h-4 w-4 text-primary" />الصورة جاهزة للتحليل</div><p>سيتم حفظ نسخة آمنة من الصورة وربطها بالأسئلة التي تختار حفظها.</p></div></div>}
              <Button onClick={() => void handleAnalyzeImage()} disabled={analyzeMutation.isPending || !analysisImageData} className="gap-2 rounded-xl">{analyzeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}تحليل الصورة وتوليد المسودة</Button>

              {analysisResult && <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20"><div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300"><CheckCircle2 className="h-5 w-5" />مسودة قابلة للمراجعة: {analysisResult.title}</div><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs font-bold text-muted-foreground">ملخص بصري</p><p className="mt-1 text-sm leading-7">{analysisResult.visualSummary}</p></div><div><p className="text-xs font-bold text-muted-foreground">ملاحظات التقييم</p><p className="mt-1 text-sm leading-7">{analysisResult.assessmentNotes}</p></div></div>{analysisResult.learningObjectives.length > 0 && <div><p className="text-xs font-bold text-muted-foreground">أهداف التعلم المستخرجة</p><div className="mt-2 flex flex-wrap gap-2">{analysisResult.learningObjectives.map((objective, index) => <span key={index} className="rounded-full bg-background px-3 py-1 text-xs">{objective}</span>)}</div></div>}<div className="grid gap-3 lg:grid-cols-2">{analysisResult.questions.map((question, index) => <div key={`${question.prompt}-${index}`} className="rounded-xl border bg-background p-4"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">السؤال {index + 1}</span><Button size="sm" variant="outline" onClick={() => void handleSaveGeneratedQuestion(question)} disabled={createMutation.isPending} className="gap-1.5"><Upload className="h-3.5 w-3.5" />حفظ في البنك</Button></div><p className="mt-3 font-bold leading-7">{question.prompt}</p>{question.options.length > 0 && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{question.options.join("\n")}</p>}<p className="mt-2 text-sm"><span className="font-bold">الإجابة:</span> {question.correctAnswer}</p><p className="mt-1 text-xs leading-6 text-muted-foreground">{question.explanation}</p><div className="mt-3 flex flex-wrap gap-1.5">{question.tags.split(",").map((tag, tagIndex) => <span key={tagIndex} className="rounded bg-muted px-2 py-0.5 text-[10px]">#{tag.trim()}</span>)}</div></div>)}</div></div>}
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
            <CardHeader className="gap-4"><div><CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-primary" />البحث والتصفية</CardTitle><CardDescription>{filteredItems.length} سؤالاً متاحاً للإدراج في الاختبارات.</CardDescription></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={handleExportPdf} disabled={searchQuery.isLoading || filteredItems.length === 0} className="gap-1.5"><Download className="h-4 w-4" />تصدير PDF</Button><Button variant="outline" size="sm" onClick={handleExportCsv} disabled={searchQuery.isLoading || filteredItems.length === 0} className="gap-1.5"><FileSpreadsheet className="h-4 w-4" />تصدير CSV</Button></div></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="relative sm:col-span-2 lg:col-span-1"><Search className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pr-9" placeholder="ابحث في نص السؤال..." /></div>
              <Select value={filterSubject} onValueChange={setFilterSubject}><SelectTrigger aria-label="تصفية المادة"><SelectValue placeholder="كل المواد" /></SelectTrigger><SelectContent><SelectItem value="all">كل المواد</SelectItem>{subjects.map((subject) => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}</SelectContent></Select>
              <Select value={filterGrade} onValueChange={setFilterGrade}><SelectTrigger aria-label="تصفية الصف"><SelectValue placeholder="كل الصفوف" /></SelectTrigger><SelectContent><SelectItem value="all">كل الصفوف</SelectItem>{grades.map((grade) => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}</SelectContent></Select>
              <Select value={filterType} onValueChange={setFilterType}><SelectTrigger aria-label="تصفية النوع"><SelectValue placeholder="كل الأنواع" /></SelectTrigger><SelectContent><SelectItem value="all">كل الأنواع</SelectItem>{Object.entries(questionTypeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}><SelectTrigger aria-label="تصفية الصعوبة"><SelectValue placeholder="كل الصعوبات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الصعوبات</SelectItem>{Object.entries(difficultyLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
              <Select value={filterTag} onValueChange={setFilterTag}><SelectTrigger aria-label="تصفية الإشارة"><SelectValue placeholder="كل الإشارات" /></SelectTrigger><SelectContent><SelectItem value="all">كل الإشارات</SelectItem>{allTags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}</SelectContent></Select>
            </CardContent>
          </Card>

          {bankQuery.isLoading || searchQuery.isLoading ? <Card><CardContent className="flex items-center justify-center gap-2 py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />جاري تحميل بنك الأسئلة...</CardContent></Card> : filteredItems.length === 0 ? <Card><CardContent className="py-16 text-center text-muted-foreground">لا توجد أسئلة مطابقة للبحث الحالي.</CardContent></Card> : <div className="grid gap-4 lg:grid-cols-2">{filteredItems.map((item) => <Card key={item.id} className="overflow-hidden"><CardContent className="space-y-4 p-5"><div className="flex items-start justify-between gap-3"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{questionTypeLabels[item.questionType] || item.questionType}</span><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-700">{difficultyLabels[item.difficulty] || item.difficulty}</span></div><Button variant="ghost" size="icon" aria-label={`حذف ${item.prompt}`} onClick={() => handleDelete(item.id)} disabled={deleteMutation.isPending} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button></div><p className="text-base font-bold leading-8">{item.prompt}</p>{item.imageUrl && <img src={item.imageUrl} alt="رسم توضيحي للسؤال" className="max-h-48 w-full rounded-xl border object-contain" />}<div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{item.subject || "بدون مادة"}</span><span>•</span><span>{item.grade || "بدون صف"}</span><span>•</span><span>{item.marks} درجة</span></div>{item.tags && <div className="flex flex-wrap gap-1.5 pt-1">{item.tags.split(",").map((t, i) => <span key={i} className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">#{t.trim()}</span>)}</div>}</CardContent></Card>)}</div>}
        </div>
      </main>
    </div>
  );
}
