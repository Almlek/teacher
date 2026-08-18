import { useAuth } from "@/_core/hooks/useAuth";
import PublicNav from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseBackup, Download, FileInput, Loader2, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Backup() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const exportQuery = trpc.backup.export.useQuery(undefined, { enabled: false });
  const importMutation = trpc.backup.import.useMutation({
    onSuccess: async () => {
      toast.success("تم استيراد النسخة الاحتياطية بنجاح");
      await Promise.all([utils.lessons.list.invalidate(), utils.library.list.invalidate(), utils.exams.list.invalidate(), utils.settings.get.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });
  const deleteMutation = trpc.backup.deleteAll.useMutation({
    onSuccess: async () => {
      toast.success("تم حذف بياناتك التعليمية");
      await Promise.all([utils.lessons.list.invalidate(), utils.library.list.invalidate(), utils.exams.list.invalidate(), utils.settings.get.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });

  if (!isAuthenticated) return null;

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (!result.data) {
      toast.error("تعذر تجهيز النسخة الاحتياطية");
      return;
    }
    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smart-lesson-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل النسخة الاحتياطية");
  };

  const handleImport = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ""));
        importMutation.mutate({ lessons: parsed.lessons || [], library: parsed.library || [], exams: parsed.exams || [], examQuestions: parsed.examQuestions || [], settings: parsed.settings || undefined });
      } catch {
        toast.error("ملف النسخة الاحتياطية غير صالح أو ليس بصيغة JSON");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => toast.error("تعذر قراءة ملف النسخة الاحتياطية");
    reader.readAsText(file);
  };

  const handleDelete = () => {
    if (!window.confirm("سيؤدي هذا إلى حذف خططك وملفات مكتبتك واختباراتك وإعداداتك. هل تريد المتابعة؟")) return;
    deleteMutation.mutate();
  };

  const busy = exportQuery.isFetching || importMutation.isPending || deleteMutation.isPending;

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 sm:py-14">
        <div className="mx-auto max-w-4xl space-y-8">
          <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-l from-primary/10 via-card to-blue-500/10 p-7 sm:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary"><DatabaseBackup className="h-4 w-4" /> النسخ الاحتياطي</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">احتفظ ببياناتك التعليمية بأمان</h1>
            <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">صدّر خططك واختباراتك وإعداداتك إلى ملف JSON، أو استورد نسخة محفوظة سابقاً. لا تُحذف ملفات التخزين السحابية عند حذف البيانات الوصفية.</p>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="border-border/70"><CardHeader><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Download className="h-5 w-5" /></div><CardTitle className="pt-2">تصدير البيانات</CardTitle><CardDescription>ينشئ ملفاً واحداً يضم الخطط والمراجع والاختبارات وأسئلتها والإعدادات.</CardDescription></CardHeader><CardContent><Button onClick={handleExport} disabled={busy} className="w-full gap-2 rounded-xl">{exportQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} تنزيل نسخة JSON</Button></CardContent></Card>
            <Card className="border-border/70"><CardHeader><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600"><FileInput className="h-5 w-5" /></div><CardTitle className="pt-2">استيراد نسخة</CardTitle><CardDescription>استعد بياناتك من ملف JSON صادر من دفتر التحضير الذكي.</CardDescription></CardHeader><CardContent><input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => handleImport(event.target.files?.[0])} /><Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={busy} className="w-full gap-2 rounded-xl"><Upload className="h-4 w-4" /> اختيار ملف النسخة</Button></CardContent></Card>
          </div>

          <Card className="border-destructive/30"><CardHeader><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Trash2 className="h-5 w-5" /></div><CardTitle className="pt-2 text-destructive">حذف بيانات الحساب</CardTitle><CardDescription>إجراء حساس يحذف الخطط والاختبارات وبيانات المكتبة والإعدادات من قاعدة البيانات.</CardDescription></CardHeader><CardContent><Button variant="destructive" onClick={handleDelete} disabled={busy} className="gap-2 rounded-xl"><Trash2 className="h-4 w-4" /> حذف جميع البيانات</Button></CardContent></Card>

          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm leading-7 text-muted-foreground"><ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /><p>راجع ملف JSON قبل استيراده، واستعمل النسخ الاحتياطية كطبقة إضافية إلى جانب التخزين السحابي. عمليات الحذف والاستيراد لا يمكن التراجع عنها تلقائياً.</p></div>
        </div>
      </main>
    </div>
  );
}
