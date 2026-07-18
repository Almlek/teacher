import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Download, Copy, Loader2, FileText } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function LessonDetail() {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/lessons/:id");
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDownloadText = () => {
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

  const handleExportHTML = async () => {
    setIsExporting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${lesson.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Cairo', 'Arial', sans-serif; 
              padding: 40px; 
              direction: rtl; 
              background: #f9fafb;
              color: #1f2937;
              line-height: 1.8;
            }
            .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #7c3aed; margin-bottom: 20px; font-size: 2.5em; border-bottom: 3px solid #7c3aed; padding-bottom: 15px; }
            .info { background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); padding: 20px; border-radius: 8px; margin: 30px 0; border-right: 4px solid #7c3aed; }
            .info p { margin: 10px 0; }
            .info strong { color: #7c3aed; }
            .section { margin: 40px 0; }
            .section h2 { color: #7c3aed; font-size: 1.8em; border-bottom: 2px solid #7c3aed; padding-bottom: 10px; margin-bottom: 20px; }
            .section p { margin: 15px 0; }
            .section ul, .section ol { margin: 15px 0 15px 30px; }
            .section li { margin: 8px 0; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 0.9em; }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${lesson.title}</h1>
            <div class="info">
              <p><strong>المادة:</strong> ${lesson.subject}</p>
              ${lesson.grade ? `<p><strong>الصف:</strong> ${lesson.grade}</p>` : ""}
              ${lesson.teacher ? `<p><strong>المعلم:</strong> ${lesson.teacher}</p>` : ""}
              ${lesson.school ? `<p><strong>المدرسة:</strong> ${lesson.school}</p>` : ""}
              ${lesson.date ? `<p><strong>التاريخ:</strong> ${lesson.date}</p>` : ""}
            </div>
            
            ${
              lesson.content
                ? `
              <div class="section">
                <h2>محتوى الدرس</h2>
                <div>${lesson.content
                  .split("\n")
                  .map((line) => `<p>${line}</p>`)
                  .join("")}</div>
              </div>
            `
                : ""
            }
            
            ${
              lesson.boardContent
                ? `
              <div class="section">
                <h2>السبورة الذكية</h2>
                <div>${lesson.boardContent
                  .split("\n")
                  .map((line) => `<p>${line}</p>`)
                  .join("")}</div>
              </div>
            `
                : ""
            }
            
            ${
              lesson.summaryContent
                ? `
              <div class="section">
                <h2>الملخص التفاعلي</h2>
                <div>${lesson.summaryContent
                  .split("\n")
                  .map((line) => `<p>${line}</p>`)
                  .join("")}</div>
              </div>
            `
                : ""
            }
            
            <div class="footer">
              <p>تم إنشاء هذه الخطة باستخدام دفتر التحضير الذكي</p>
              <p>${new Date().toLocaleDateString("ar-EG")}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${lesson.title}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("تم تصدير الملف بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ في التصدير");
    } finally {
      setIsExporting(false);
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
              onClick={handleDownloadText}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              نص
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHTML}
              disabled={isExporting}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              {isExporting ? "جاري..." : "HTML"}
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
