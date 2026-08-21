import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { trpc } from "@/lib/trpc";
import { BarChart3, BookOpenCheck, Layers3, ListChecks, Loader2, PieChart as PieChartIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

type Distribution = Record<string, number>;

type Stats = {
  total: number;
  bySubject: Distribution;
  byDifficulty: Distribution;
  byType: Distribution;
};

const difficultyLabels: Record<string, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "متقدم",
};

const typeLabels: Record<string, string> = {
  multiple_choice: "اختيار من متعدد",
  true_false: "صح أو خطأ",
  short_answer: "إجابة قصيرة",
  essay: "مقالي",
};

const subjectColors = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#ea580c", "#db2777", "#64748b"];
const difficultyColors = ["#22c55e", "#f59e0b", "#ef4444"];
const typeColors = ["#2563eb", "#8b5cf6", "#06b6d4", "#f97316"];

function toRows(values: Distribution, labels?: Record<string, string>) {
  return Object.entries(values).filter(([, count]) => count > 0).map(([key, count]) => ({
    key,
    label: labels?.[key] || key,
    count,
  }));
}

function EmptyChart({ message }: { message: string }) {
  return <div className="flex h-56 items-center justify-center rounded-xl border border-dashed bg-muted/20 px-5 text-center text-sm text-muted-foreground">{message}</div>;
}

export default function QuestionBankStats() {
  const statsQuery = trpc.questionBank.stats.useQuery();
  const stats = statsQuery.data as Stats | undefined;

  if (statsQuery.isLoading) {
    return <Card><CardContent className="flex items-center justify-center gap-2 py-14 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />جاري تجهيز إحصائيات بنك الأسئلة...</CardContent></Card>;
  }

  if (statsQuery.isError || !stats) {
    return <Card><CardContent className="py-12 text-center text-sm text-destructive">تعذر تحميل إحصائيات بنك الأسئلة حالياً.</CardContent></Card>;
  }

  const subjects = toRows(stats.bySubject);
  const difficulties = toRows(stats.byDifficulty, difficultyLabels);
  const types = toRows(stats.byType, typeLabels);
  const maxSubject = Math.max(...subjects.map((item) => item.count), 1);

  const subjectConfig = Object.fromEntries(subjects.map((item, index) => [item.key, { label: item.label, color: subjectColors[index % subjectColors.length] }]));
  const difficultyConfig = Object.fromEntries(difficulties.map((item, index) => [item.key, { label: item.label, color: difficultyColors[index % difficultyColors.length] }]));
  const typeConfig = Object.fromEntries(types.map((item, index) => [item.key, { label: item.label, color: typeColors[index % typeColors.length] }]));

  return <section aria-labelledby="question-bank-stats-title" className="space-y-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-primary"><BarChart3 className="h-5 w-5" /><span className="text-sm font-bold">نظرة تحليلية</span></div>
        <h2 id="question-bank-stats-title" className="mt-1 text-2xl font-black tracking-tight">إحصائيات بنك الأسئلة</h2>
        <p className="mt-1 text-sm text-muted-foreground">توزيع حيّ مبني على الأسئلة المحفوظة في بنكك، لمساعدتك على اكتشاف الفجوات بسرعة.</p>
      </div>
      <div className="rounded-2xl border bg-background px-4 py-3 text-right shadow-sm"><div className="text-xs text-muted-foreground">إجمالي الأسئلة</div><div className="mt-1 text-3xl font-black text-primary">{stats.total.toLocaleString("ar-EG")}</div></div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="border-blue-200/70 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs font-bold text-muted-foreground">المواد المغطاة</p><p className="mt-1 text-2xl font-black">{subjects.length}</p></div><BookOpenCheck className="h-8 w-8 text-blue-600" /></CardContent></Card>
      <Card className="border-violet-200/70 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs font-bold text-muted-foreground">مستويات الصعوبة</p><p className="mt-1 text-2xl font-black">{difficulties.length}</p></div><Layers3 className="h-8 w-8 text-violet-600" /></CardContent></Card>
      <Card className="border-emerald-200/70 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs font-bold text-muted-foreground">أنواع التقييم</p><p className="mt-1 text-2xl font-black">{types.length}</p></div><ListChecks className="h-8 w-8 text-emerald-600" /></CardContent></Card>
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BookOpenCheck className="h-5 w-5 text-primary" />حسب المادة</CardTitle><CardDescription>عدد الأسئلة المحفوظة لكل مادة.</CardDescription></CardHeader><CardContent>{subjects.length ? <ChartContainer config={subjectConfig} className="h-64 w-full aspect-auto"><BarChart accessibilityLayer data={subjects} layout="vertical" margin={{ left: 8, right: 16, top: 6, bottom: 6 }}><CartesianGrid horizontal={false} /><YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={92} tick={{ fontSize: 12 }} /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="count" radius={[0, 8, 8, 0]}>{subjects.map((item, index) => <Cell key={item.key} fill={subjectColors[index % subjectColors.length]} />)}</Bar></BarChart></ChartContainer> : <EmptyChart message="أضف أسئلة إلى البنك لتظهر مقارنة المواد هنا." />}</CardContent></Card>

      <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><PieChartIcon className="h-5 w-5 text-primary" />مستوى الصعوبة</CardTitle><CardDescription>نسبة توزيع الأسئلة حسب صعوبتها.</CardDescription></CardHeader><CardContent>{difficulties.length ? <ChartContainer config={difficultyConfig} className="h-64 w-full aspect-auto"><PieChart><ChartTooltip content={<ChartTooltipContent hideLabel />} /><Pie data={difficulties} dataKey="count" nameKey="label" innerRadius={55} outerRadius={82} paddingAngle={4}>{difficulties.map((item, index) => <Cell key={item.key} fill={difficultyColors[index % difficultyColors.length]} />)}</Pie><ChartLegend content={<ChartLegendContent nameKey="label" />} /></PieChart></ChartContainer> : <EmptyChart message="لا توجد بيانات صعوبة كافية للعرض." />}</CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5 text-primary" />نوع التقييم</CardTitle><CardDescription>مقارنة مباشرة بين صيغ الأسئلة المستخدمة.</CardDescription></CardHeader><CardContent>{types.length ? <ChartContainer config={typeConfig} className="h-64 w-full aspect-auto"><BarChart accessibilityLayer data={types} margin={{ left: 8, right: 8, top: 12, bottom: 8 }}><CartesianGrid vertical={false} /><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} interval={0} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="count" radius={[8, 8, 0, 0]}>{types.map((item, index) => <Cell key={item.key} fill={typeColors[index % typeColors.length]} />)}</Bar></BarChart></ChartContainer> : <EmptyChart message="أضف أسئلة متنوعة لتظهر مقارنة أنواع التقييم هنا." />}</CardContent></Card>

    {stats.total > 0 && <p className="text-xs text-muted-foreground">أعلى مادة حالياً: <span className="font-bold text-foreground">{subjects.sort((a, b) => b.count - a.count)[0]?.label}</span> ({Math.round((Math.max(...subjects.map((item) => item.count), 0) / stats.total) * 100)}% من البنك).</p>}
  </section>;
}
