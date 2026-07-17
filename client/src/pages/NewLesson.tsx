import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function NewLesson() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

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

  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الخطة بنجاح!");
      setLocation("/lessons");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.subject || !formData.title) {
      toast.error("يرجى ملء المادة والعنوان");
      setIsLoading(false);
      return;
    }

    try {
      await createLessonMutation.mutateAsync({
        ...formData,
        content: formData.content || undefined,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) {
    return null;
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
                    <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
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
                    <Select value={formData.aiModel} onValueChange={(value) => handleSelectChange("aiModel", value)}>
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
                  <Select value={formData.contentSource} onValueChange={(value) => handleSelectChange("contentSource", value)}>
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
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading || createLessonMutation.isPending}
              >
                {isLoading || createLessonMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء الخطة"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
