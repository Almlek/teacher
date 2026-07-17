import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Plus, Trash2, Download, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Library() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const libraryQuery = trpc.library.list.useQuery();
  const deleteMutation = trpc.library.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الملف بنجاح");
      libraryQuery.refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const books = libraryQuery.data || [];
  const filteredBooks = books.filter(
    (book) =>
      book.title.includes(searchTerm) ||
      book.subject?.includes(searchTerm) ||
      book.grade?.includes(searchTerm)
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">المكتبة</h1>
          </div>
          <Button onClick={() => setLocation("/library/upload")} className="gap-2">
            <Plus className="w-4 h-4" />
            رفع ملف
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="ابحث عن ملف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Books List */}
        {libraryQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">لا توجد ملفات في المكتبة</p>
            <Button onClick={() => setLocation("/library/upload")}>
              رفع ملف جديد
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start gap-2">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span className="line-clamp-2">{book.title}</span>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      {book.subject && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {book.subject}
                        </span>
                      )}
                      {book.grade && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                          {book.grade}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {book.fileName && <p>الملف: {book.fileName}</p>}
                    {book.fileSize && <p>الحجم: {formatFileSize(book.fileSize)}</p>}
                  </div>
                  <div className="flex gap-2">
                    {book.fileUrl && (
                      <a
                        href={book.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 ml-2" />
                          تحميل
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("هل تريد حذف هذا الملف؟")) {
                          deleteMutation.mutate({ id: book.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
