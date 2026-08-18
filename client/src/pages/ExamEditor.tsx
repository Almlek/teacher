import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ClipboardCheck, Loader2, Plus, Save, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type QuestionDraft = {
  orderIndex: number;
  questionType: string;
  prompt: string;
  options: string;
  correctAnswer: string;
  explanation: string;
  marks: number;
};

const emptyQuestion = (orderIndex: number): QuestionDraft => ({
  orderIndex,
  questionType: "multiple_choice",
  prompt: "",
  options: "",
  correctAnswer: "",
  explanation: "",
  marks: 1,
});

export default function ExamEditor() {
  const [, setLocation] = useLocation();
  const examId = useMemo(() => Number(new URLSearchParams(window.location.search).get("examId") || 0), []);
  const settingsQuery = trpc.settings.get.useQuery();
  const examQuery = trpc.exams.get.useQuery({ id: examId }, { enabled: examId > 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    grade: "",
    examType: "comprehensive",
    durationMinutes: "",
    instructions: "",
  });
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion(0)]);

  useEffect(() => {
    const settings = settingsQuery.data;
    if (!settings || examId !== 0) return;
    setFormData((previous) => ({
      ...previous,
      examType: settings.defaultExamType || "comprehensive",
    }));
  }, [settingsQuery.data, examId]);

  useEffect(() => {
    const data = examQuery.data;
    if (!data) return;
    setFormData({
      title: data.exam.title,
      subject: data.exam.subject || "",
      grade: data.exam.grade || "",
      examType: data.exam.examType,
      durationMinutes: data.exam.durationMinutes ? String(data.exam.durationMinutes) : "",
      instructions: data.exam.instructions || "",
    });
    setQuestions(data.questions.length > 0 ? data.questions.map((question) => ({
      orderIndex: question.orderIndex,
      questionType: question.questionType,
      prompt: question.prompt,
      options: question.options || "",
      correctAnswer: question.correctAnswer || "",
      explanation: question.explanation || "",
      marks: question.marks,
    })) : [emptyQuestion(0)]);
  }, [examQuery.data]);

  const createExamMutation = trpc.exams.create.useMutation();
  const updateExamMutation = trpc.exams.update.useMutation();
  const replaceQuestionsMutation = trpc.exams.questionsReplace.useMutation();
  const totalMarks = questions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const updateQuestion = (index: number, key: keyof QuestionDraft, value: string | number) => {
    setQuestions((previous) => previous.map((question, questionIndex) => questionIndex === index ? { ...question, [key]: value } : question));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("يرجى إدخال عنوان الاختبار");
      return;
    }
    const validQuestions = questions.filter((question) => question.prompt.trim());
    if (validQuestions.length === 0) {
      toast.error("أضف سؤالاً واحداً على الأقل قبل الحفظ");
      return;
    }
    setIsSaving(true);
    try {
      const examPayload = {
        title: formData.title.trim(),
        subject: formData.subject || undefined,
        grade: formData.grade || undefined,
        examType: formData.examType,
        instructions: formData.instructions || undefined,
        examContent: validQuestions.map((question, index) => `${index + 1}. ${question.prompt}`).join("\n"),
        summaryContent: `اختبار ${formData.title.trim()} — ${validQuestions.length} أسئلة — ${totalMarks} درجات`,
        durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) : undefined,
        totalMarks,
      };
      const savedExamId = examId > 0
        ? examId
        : (await createExamMutation.mutateAsync(examPayload)).id;
      if (examId > 0) {
        await updateExamMutation.mutateAsync({ id: examId, updates: examPayload });
      }
      if (!savedExamId) throw new Error("تعذر الحصول على رقم الاختبار");
      await replaceQuestionsMutation.mutateAsync({
        examId: savedExamId,
        questions: validQuestions.map((question, index) => ({ ...question, orderIndex: index })),
      });
      toast.success("تم حفظ الاختبار والأسئلة بنجاح");
      setLocation("/exams");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر حفظ الاختبار");
    } finally {
      setIsSaving(false);
    }
  };

  if (examQuery.isLoading) {
    return <div className="min-h-screen bg-muted/20"><PublicNav /><main className="container py-10"><LoadingState variant="loading" title="جاري تحميل الاختبار..." description="نستعيد أسئلة الاختبار ومعلوماته." /></main></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 sm:py-14">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href="/exams" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowRight className="h-4 w-4" /> العودة إلى الاختبارات</Link>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">محرر الاختبارات</h1>
              <p className="mt-2 text-muted-foreground">ابنِ الأسئلة، وزّع الدرجات، واحفظ نسخة جاهزة للطباعة أو العرض الإلكتروني.</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 rounded-xl px-5"><Save className="h-4 w-4" />{isSaving ? "جاري الحفظ..." : "حفظ الاختبار"}</Button>
          </div>

          <Card>
            <CardHeader><CardTitle>بيانات الاختبار</CardTitle><CardDescription>تظهر هذه المعلومات في رأس ورقة الاختبار</CardDescription></CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="title">عنوان الاختبار *</Label><Input id="title" name="title" value={formData.title} onChange={handleFormChange} placeholder="اختبار الوحدة الأولى" /></div>
              <div className="space-y-2"><Label htmlFor="subject">المادة</Label><Input id="subject" name="subject" value={formData.subject} onChange={handleFormChange} placeholder="اللغة العربية" /></div>
              <div className="space-y-2"><Label htmlFor="grade">الصف</Label><Input id="grade" name="grade" value={formData.grade} onChange={handleFormChange} placeholder="الصف السادس" /></div>
              <div className="space-y-2"><Label htmlFor="examType">نوع الاختبار</Label><Select value={formData.examType} onValueChange={(value) => setFormData((previous) => ({ ...previous, examType: value }))}><SelectTrigger id="examType"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="comprehensive">اختبار شامل</SelectItem><SelectItem value="formal">اختبار رسمي</SelectItem><SelectItem value="electronic">اختبار إلكتروني</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="durationMinutes">المدة بالدقائق</Label><Input id="durationMinutes" name="durationMinutes" type="number" min="1" value={formData.durationMinutes} onChange={handleFormChange} placeholder="45" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="instructions">تعليمات الاختبار</Label><Textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleFormChange} rows={3} placeholder="أجب عن جميع الأسئلة، واكتب بخط واضح..." /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>محرر الأسئلة</CardTitle><CardDescription>{questions.length} أسئلة · {totalMarks} درجات</CardDescription></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><ClipboardCheck className="h-5 w-5" /></div></div></CardHeader>
            <CardContent className="space-y-5">
              {questions.map((question, index) => (
                <div key={`${question.orderIndex}-${index}`} className="rounded-2xl border border-border/70 bg-muted/15 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">السؤال {index + 1}</span>{questions.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => setQuestions((previous) => previous.filter((_, questionIndex) => questionIndex !== index))} aria-label={`حذف السؤال ${index + 1}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_180px_100px]">
                    <div className="space-y-2 sm:col-span-1"><Label>نص السؤال</Label><Textarea value={question.prompt} onChange={(event) => updateQuestion(index, "prompt", event.target.value)} rows={3} placeholder="اكتب السؤال هنا..." /></div>
                    <div className="space-y-2"><Label>نوع السؤال</Label><Select value={question.questionType} onValueChange={(value) => updateQuestion(index, "questionType", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiple_choice">اختيار من متعدد</SelectItem><SelectItem value="true_false">صح أو خطأ</SelectItem><SelectItem value="short_answer">إجابة قصيرة</SelectItem><SelectItem value="essay">مقالي</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>الدرجة</Label><Input type="number" min="1" value={question.marks} onChange={(event) => updateQuestion(index, "marks", Number(event.target.value))} /></div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>الخيارات</Label><Input value={question.options} onChange={(event) => updateQuestion(index, "options", event.target.value)} placeholder="أ) ... | ب) ... | ج) ..." /></div><div className="space-y-2"><Label>الإجابة الصحيحة</Label><Input value={question.correctAnswer} onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)} placeholder="الإجابة النموذجية" /></div></div>
                  <div className="mt-4 space-y-2"><Label>شرح الإجابة (اختياري)</Label><Textarea value={question.explanation} onChange={(event) => updateQuestion(index, "explanation", event.target.value)} rows={2} placeholder="أضف توضيحاً يساعد على المراجعة..." /></div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setQuestions((previous) => [...previous, emptyQuestion(previous.length)])} className="w-full gap-2 rounded-xl"><Plus className="h-4 w-4" /> إضافة سؤال</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
