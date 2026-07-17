import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Download, Copy, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function LessonDetail() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/lessons/:id");
  const [isCopied, setIsCopied] = useState(false);

  const lessonId = params?.id ? parseInt(params.id) : null;
  const lessonQuery = trpc.lessons.get.useQuery(
    { id: lessonId! },
    { enabled: !!lessonId }
  );

  if (!isAuthenticated || !lessonId) {
    return null;
  }

  if (lessonQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!lessonQuery.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">لم يتم العثور على الخطة</p>
          <Button onClick={() => setLocation("/lessons")}>
            العودة للأرشيف
          </Button>
        </div>
      </div>
    );
  }

  const lesson = lessonQuery.data;

  const handleCopy = () => {
    if (lesson.content) {
      navigator.clipboard.writeText(lesson.content);
      setIsCopied(true);
      toast.success("تم نسخ المحتوى");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (lesson.content) {
      const element = document.createElement("a");
      const file = new Blob([lesson.content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${lesson.title}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("تم تحميل الملف");
    }
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
              onClick={() => setLocation("/lessons")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">{lesson.subject}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              {isCopied ? "تم النسخ" : "نسخ"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Lesson Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>معلومات الدرس</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lesson.school && (
                  <div>
                    <p className="text-sm text-muted-foreground">المدرسة</p>
                    <p className="font-medium">{lesson.school}</p>
                  </div>
                )}
                {lesson.teacher && (
                  <div>
                    <p className="text-sm text-muted-foreground">المعلم</p>
                    <p className="font-medium">{lesson.teacher}</p>
                  </div>
                )}
                {lesson.grade && (
                  <div>
                    <p className="text-sm text-muted-foreground">الصف</p>
                    <p className="font-medium">{lesson.grade}</p>
                  </div>
                )}
                {lesson.date && (
                  <div>
                    <p className="text-sm text-muted-foreground">التاريخ</p>
                    <p className="font-medium">{lesson.date}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lesson Content Tabs */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">محتوى الدرس</TabsTrigger>
              <TabsTrigger value="board">السبورة الذكية</TabsTrigger>
              <TabsTrigger value="summary">الملخص التفاعلي</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>محتوى الدرس الكامل</CardTitle>
                </CardHeader>
                <CardContent>
                  {lesson.content ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <Streamdown>{lesson.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">لا يوجد محتوى متاح</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="board" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>السبورة الذكية</CardTitle>
                  <CardDescription>ملخص مرئي للدرس</CardDescription>
                </CardHeader>
                <CardContent>
                  {lesson.boardContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <Streamdown>{lesson.boardContent}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">لا يوجد محتوى متاح</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>الملخص التفاعلي</CardTitle>
                  <CardDescription>أسئلة وأجوبة</CardDescription>
                </CardHeader>
                <CardContent>
                  {lesson.summaryContent ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <Streamdown>{lesson.summaryContent}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">لا يوجد محتوى متاح</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
