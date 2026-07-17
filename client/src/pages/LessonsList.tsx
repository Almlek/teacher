import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Plus, Trash2, Eye } from "lucide-react";
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
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const lessons = lessonsQuery.data || [];
  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.includes(searchTerm) ||
      lesson.subject.includes(searchTerm) ||
      lesson.teacher?.includes(searchTerm)
  );

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
            <h1 className="text-2xl font-bold text-foreground">الأرشيف</h1>
          </div>
          <Button onClick={() => setLocation("/lessons/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            خطة جديدة
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="ابحث عن خطة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Lessons List */}
        {lessonsQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">لا توجد خطط دروس بعد</p>
            <Button onClick={() => setLocation("/lessons/new")}>
              إنشاء خطة جديدة
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {lesson.subject}
                      </span>
                      {lesson.grade && (
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
                          {lesson.grade}
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {lesson.teacher && <p>المعلم: {lesson.teacher}</p>}
                    {lesson.date && <p>التاريخ: {lesson.date}</p>}
                    {lesson.school && <p>المدرسة: {lesson.school}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setLocation(`/lessons/${lesson.id}`)}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("هل تريد حذف هذه الخطة؟")) {
                          deleteMutation.mutate({ id: lesson.id });
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
