import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function NewLesson() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "generating" | "complete">("form");

  const [formData, setFormData] = useState({
    school: "",
    teacher: user?.name || "",
    subject: "",
    grade: "",
    section: "",
    date: new Date().toISOString().split("T")[0],
    period: "",
    title: "",
    language: "ar",
    contentSource: "title",
    aiModel: "gemini-1.5-flash",
    content: "",
  });

  const generateMutation = trpc.lessons.generate.useMutation({
    onSuccess: (generated) => {
      toast.success("تم توليد الخطة بنجاح!");
      setStep("complete");
      
      // Save the generated content
      createLessonMutation.mutate({
        ...formData,
        content: generated.content,
        boardContent: generated.boardContent,
        summaryContent: generated.summaryContent,
      });
    },
    onError: (error) => {
      toast.error("حدث خطأ في التوليد: " + error.message);
      setIsLoading(false);
      setStep("form");
    },
  });

  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الخطة بنجاح!");
      setTimeout(() => {
        setLocation("/lessons");
      }, 1000);
    },
    onError: (error) => {
      toast.error("حدث خطأ في الحفظ: " + error.message);
      setIsLoading(false);
      setStep("form");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.subject || !formData.title) {
      toast.error("يرجى ملء المادة والعنوان");
      setIsLoading(false);
      return;
    }

    setStep("generating");
    try {
      await generateMutation.mutateAsync({
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade || undefined,
        content: formData.content || undefined,
        language: formData.language as "ar" | "en",
        aiModel: formData.aiModel as "gemini-1.5-flash" | "gemini-1.5-pro",
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (step === "generating") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-block mb-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              <Sparkles className="w-12 h-12 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">جاري توليد الخطة...</h2>
          <p className="text-muted-foreground mb-4">
            نحن نستخدم الذكاء الاصطناعي لإنشاء خطة درس شاملة ومتكاملة
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ توليد محتوى الدرس</p>
            <p>✓ إنشاء السبورة الذكية</p>
            <p>✓ تحضير الملخص التفاعلي</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            disabled={isLoading}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">خطة درس جديدة</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* معلومات الحصة */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الحصة</CardTitle>
                <CardDescription>أدخل تفاصيل الحصة الدراسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">المدرسة</Label>
                    <Input
                      id="school"
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      placeholder="اسم المدرسة"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher">المعلم</Label>
                    <Input
                      id="teacher"
                      name="teacher"
                      value={formData.teacher}
                      onChange={handleChange}
                      placeholder="اسم المعلم"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">المادة *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="اللغة العربية، الرياضيات، إلخ"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">الصف</Label>
                    <Input
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="الصف الأول، الثاني، إلخ"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">الشعبة</Label>
                    <Input
                      id="section"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      placeholder="أ، ب، ج"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">التاريخ</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">الحصة</Label>
                  <Input
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    placeholder="الحصة الأولى، الثانية، إلخ"
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* عنوان الدرس والمحتوى */}
            <Card>
              <CardHeader>
                <CardTitle>الدرس</CardTitle>
                <CardDescription>أدخل عنوان الدرس والمحتوى</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الدرس *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="مثال: الأفعال الماضية"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">محتوى الدرس (اختياري)</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="أدخل محتوى الدرس أو اتركه فارغاً لاستخدام العنوان فقط"
                    rows={6}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* الإعدادات المتقدمة */}
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات المتقدمة</CardTitle>
                <CardDescription>اختر نموذج الذكاء الاصطناعي واللغة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">اللغة</Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => handleSelectChange("language", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">الإنجليزية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aiModel">نموذج الذكاء الاصطناعي</Label>
                    <Select 
                      value={formData.aiModel} 
                      onValueChange={(value) => handleSelectChange("aiModel", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="aiModel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (سريع)</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (متقدم)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentSource">مصدر المحتوى</Label>
                  <Select 
                    value={formData.contentSource} 
                    onValueChange={(value) => handleSelectChange("contentSource", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="contentSource">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">عنوان فقط</SelectItem>
                      <SelectItem value="text">نص مكتوب</SelectItem>
                      <SelectItem value="image">صور</SelectItem>
                      <SelectItem value="pdf">ملف PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading || generateMutation.isPending || createLessonMutation.isPending}
                className="gap-2"
              >
                {isLoading || generateMutation.isPending || createLessonMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    توليد وحفظ الخطة
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
