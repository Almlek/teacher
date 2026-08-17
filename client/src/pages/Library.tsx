import { useAuth } from "@/_core/hooks/useAuth";
import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { getLibraryFileLabel, isSupportedLibraryType } from "@/lib/libraryUpload";
import { BookOpen, Download, Eye, FileText, Plus, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Library() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: "", subject: "", grade: "" });
  const [previewBook, setPreviewBook] = useState<{ id: number; title: string; subject?: string | null; grade?: string | null; fileName?: string | null; fileUrl?: string | null; fileSize?: number | null; fileType?: string | null } | null>(null);

  const utils = trpc.useUtils();
  const libraryQuery = trpc.library.list.useQuery();

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);
  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الملف بنجاح");
      void utils.library.list.invalidate();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const uploadMutation = trpc.library.upload.useMutation({
    onSuccess: async () => {
      toast.success("تم رفع الملف وإضافته إلى المكتبة");
      setUploadOpen(false);
      setSelectedFile(null);
      setUploadForm({ title: "", subject: "", grade: "" });
      await utils.library.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
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

  const handleFileSelection = (file?: File) => {
    if (!file) return;
    if (!isSupportedLibraryType(file.type)) {
      toast.error("الملف غير مدعوم. اختر PDF أو صورة بصيغة JPG أو PNG أو WEBP أو GIF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يجب ألا يتجاوز 10 ميجابايت.");
      return;
    }
    setSelectedFile(file);
    setUploadForm((previous) => ({
      ...previous,
      title: previous.title || file.name.replace(/\.[^/.]+$/, ""),
    }));
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("اختر ملفاً أولاً قبل الرفع.");
      return;
    }
    if (!uploadForm.title.trim()) {
      toast.error("أدخل عنواناً واضحاً للمرجع.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const fileData = result.split(",")[1] || "";
      uploadMutation.mutate({
        title: uploadForm.title.trim(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData,
        subject: uploadForm.subject.trim() || undefined,
        grade: uploadForm.grade.trim() || undefined,
      });
    };
    reader.onerror = () => toast.error("تعذر قراءة الملف من الجهاز.");
    reader.readAsDataURL(selectedFile);
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
          <Button onClick={() => setUploadOpen(true)} className="gap-2 rounded-xl">
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
            <Button onClick={() => setUploadOpen(true)} className="mt-6 gap-2 rounded-xl">
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

      <Dialog open={uploadOpen} onOpenChange={(open) => {
        setUploadOpen(open);
        if (!open && !uploadMutation.isPending) {
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadForm({ title: "", subject: "", grade: "" });
        }
      }}>
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">رفع مرجع تعليمي</DialogTitle>
            <DialogDescription>أضف ملف PDF أو صورة بحجم أقصى 10 ميجابايت إلى مكتبتك الخاصة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-3">
            <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 p-5 text-center">
              <Upload className="mx-auto h-9 w-9 text-primary" />
              <p className="mt-3 text-sm font-semibold">اختر ملفاً من جهازك</p>
              <p className="mt-1 text-xs text-muted-foreground">PDF أو JPG أو PNG أو WEBP أو GIF</p>
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                className="mx-auto mt-4 max-w-sm cursor-pointer rounded-xl bg-background"
                onChange={(event) => handleFileSelection(event.target.files?.[0])}
                disabled={uploadMutation.isPending}
              />
              {selectedFile && <div className="mt-3 space-y-1 text-sm text-primary"><p className="truncate">{selectedFile.name} • {formatFileSize(selectedFile.size)}</p><p className="text-xs font-semibold">نوع الملف: {getLibraryFileLabel(selectedFile.type)}</p></div>}
              {selectedFile?.type.startsWith("image/") && previewUrl && <img src={previewUrl} alt="معاينة الملف" className="mx-auto mt-4 max-h-44 w-full rounded-xl border border-border object-contain bg-background" />}
              {selectedFile?.type === "application/pdf" && previewUrl && <iframe src={previewUrl} title="معاينة ملف PDF" className="mt-4 h-48 w-full rounded-xl border border-border bg-background" />}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="upload-title">عنوان المرجع</Label><Input id="upload-title" value={uploadForm.title} onChange={(event) => setUploadForm((previous) => ({ ...previous, title: event.target.value }))} placeholder="مثال: كتاب الرياضيات للصف الأول" disabled={uploadMutation.isPending} /></div>
              <div className="space-y-2"><Label htmlFor="upload-subject">المادة</Label><Input id="upload-subject" value={uploadForm.subject} onChange={(event) => setUploadForm((previous) => ({ ...previous, subject: event.target.value }))} placeholder="الرياضيات" disabled={uploadMutation.isPending} /></div>
              <div className="space-y-2"><Label htmlFor="upload-grade">الصف</Label><Input id="upload-grade" value={uploadForm.grade} onChange={(event) => setUploadForm((previous) => ({ ...previous, grade: event.target.value }))} placeholder="الصف الأول" disabled={uploadMutation.isPending} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)} className="rounded-xl" disabled={uploadMutation.isPending}>إلغاء</Button>
            <Button onClick={handleUpload} className="gap-2 rounded-xl" disabled={!selectedFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? "جاري الرفع..." : "رفع إلى المكتبة"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewBook} onOpenChange={() => setPreviewBook(null)}>
        <DialogContent className="max-w-xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{previewBook?.title}</DialogTitle>
            <DialogDescription>
              {previewBook?.subject || "بدون تصنيف"} {previewBook?.grade ? `• ${previewBook.grade}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {previewBook?.fileUrl && previewBook.fileType?.startsWith("image/") && <img src={previewBook.fileUrl} alt={previewBook.title} className="max-h-80 w-full rounded-2xl border border-border object-contain bg-muted/30" />}
            {previewBook?.fileUrl && previewBook.fileType === "application/pdf" && <iframe src={previewBook.fileUrl} title={previewBook.title} className="h-80 w-full rounded-2xl border border-border bg-muted/30" />}
            <div className="rounded-2xl bg-muted/40 p-4 text-sm space-y-2">
              <p><strong>اسم الملف:</strong> {previewBook?.fileName || "غير محدد"}</p>
              <p><strong>الحجم:</strong> {formatFileSize(previewBook?.fileSize)}</p>
              <p><strong>النوع:</strong> {getLibraryFileLabel(previewBook?.fileType)}</p>
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
