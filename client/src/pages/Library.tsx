import { useAuth } from "@/_core/hooks/useAuth";
import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { BookOpen, Download, Eye, FileText, Plus, Search, Trash2, Upload } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Library() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [previewBook, setPreviewBook] = useState<{ id: number; title: string; subject?: string | null; grade?: string | null; fileName?: string | null; fileUrl?: string | null; fileSize?: number | null } | null>(null);

  const libraryQuery = trpc.library.list.useQuery();
  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الملف بنجاح");
      libraryQuery.refetch();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  if (!isAuthenticated) return null;

  const books = libraryQuery.data || [];
  const subjects = Array.from(new Set(books.map((b) => b.subject).filter(Boolean))) as string[];

  const filteredBooks = books.filter((book) => {
    const matchesSearch = [book.title, book.subject, book.grade, book.fileName].some((value) =>
      value?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSubject = selectedSubject === "all" || book.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "غير محدد";
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 lg:py-14">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <BookOpen className="h-3.5 w-3.5" /> مصادر العمل
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">المكتبة الرقمية</h1>
            <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
              احتفظ بمراجعك التعليمية قريبة منك، وعاينها أو حمّلها بسرعة عند إعداد أي درس جديد.
            </p>
          </div>
          <Button onClick={() => setLocation("/library/upload")} className="gap-2 rounded-xl">
            <Upload className="h-4 w-4" /> رفع ملف جديد
          </Button>
        </div>

        <div className="mb-7 grid gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="البحث في المكتبة"
              placeholder="ابحث بعنوان الملف أو المادة أو الصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 rounded-xl pr-10"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="تصفية حسب المادة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المواد</SelectItem>
              {subjects.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {libraryQuery.isLoading ? (
          <LoadingState variant="loading" title="جاري تحميل المكتبة..." description="نرتب مراجعك التعليمية في مساحة واحدة." />
        ) : libraryQuery.isError ? (
          <LoadingState variant="error" title="تعذر تحميل المكتبة" description="تحقق من الاتصال ثم أعد المحاولة." actionLabel="إعادة المحاولة" onAction={() => libraryQuery.refetch()} />
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-20 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-5 text-xl font-extrabold">لا توجد ملفات مطابقة</h2>
            <p className="mt-2 text-muted-foreground">ارفع مرجعاً جديداً أو جرّب كلمة بحث أو تصنيفاً مختلفاً.</p>
            <Button onClick={() => setLocation("/library/upload")} className="mt-6 gap-2 rounded-xl">
              <Plus className="h-4 w-4" /> إضافة أول ملف
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="group overflow-hidden rounded-3xl border-border/70 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                <CardHeader className="bg-gradient-to-br from-primary/8 to-blue-500/5">
                  <CardTitle className="flex items-start gap-3 text-lg">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <span className="line-clamp-2">{book.title}</span>
                  </CardTitle>
                  <CardDescription className="flex flex-wrap gap-2 pt-2">
                    {book.subject && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{book.subject}</span>}
                    {book.grade && <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-600">{book.grade}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>الملف: {book.fileName || "مرجع تعليمي"}</p>
                    <p>الحجم: {formatFileSize(book.fileSize)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 rounded-xl"
                      onClick={() => setPreviewBook(book)}
                    >
                      <Eye className="h-4 w-4" /> معاينة
                    </Button>
                    {book.fileUrl && (
                      <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl">
                        <a href={book.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        if (window.confirm("هل تريد حذف هذا الملف؟")) {
                          deleteMutation.mutate({ id: book.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!previewBook} onOpenChange={() => setPreviewBook(null)}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{previewBook?.title}</DialogTitle>
            <DialogDescription>
              {previewBook?.subject || "بدون تصنيف"} {previewBook?.grade ? `• ${previewBook.grade}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="rounded-2xl bg-muted/40 p-4 text-sm space-y-2">
              <p><strong>اسم الملف:</strong> {previewBook?.fileName || "غير محدد"}</p>
              <p><strong>الحجم:</strong> {formatFileSize(previewBook?.fileSize)}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              هذه معاينة سريعة لبيانات المرجع التعليمي المحفوظ في المكتبة. يمكنك تحميل الملف كاملاً للاستفادة منه أثناء التحضير.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPreviewBook(null)} className="rounded-xl">إغلاق</Button>
            {previewBook?.fileUrl && (
              <Button asChild className="gap-2 rounded-xl">
                <a href={previewBook.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> تحميل الملف كاملاً
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
