import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ImagePlus, Loader2, LogOut, X } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const settingsQuery = trpc.settings.get.useQuery();
  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
      settingsQuery.refetch();
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
      setIsSaving(false);
    },
  });

  const logoUploadMutation = trpc.settings.logoUpload.useMutation({
    onSuccess: (result) => {
      setFormData((previous) => ({ ...previous, schoolLogoUrl: result.url }));
      toast.success("تم رفع شعار المدرسة؛ اضغط حفظ الإعدادات لاعتماده");
    },
    onError: (error) => toast.error(error.message),
  });

  const [formData, setFormData] = useState({
    theme: "purple",
    fontSize: "medium",
    fontFamily: "cairo",
    defaultLanguage: "ar",
    defaultModel: "gemini-1.5-flash",
    defaultSchool: "",
    defaultTeacher: "",
    pdfHeader: "",
    schoolLogoUrl: "",
    defaultDirectorate: "",
    defaultSubject: "",
    aiProvider: "gemini",
    defaultExamType: "comprehensive",
    defaultQuestionTypes: "اختيار من متعدد، صح وخطأ، مقالي",
    generationTargets: "الخطة، السبورة، الملخص، الخريطة الذهنية، حل التقويم",
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setFormData({
        theme: settingsQuery.data.theme || "purple",
        fontSize: settingsQuery.data.fontSize || "medium",
        fontFamily: settingsQuery.data.fontFamily || "cairo",
        defaultLanguage: settingsQuery.data.defaultLanguage || "ar",
        defaultModel: settingsQuery.data.defaultModel || "gemini-1.5-flash",
        defaultSchool: settingsQuery.data.defaultSchool || "",
        defaultTeacher: settingsQuery.data.defaultTeacher || "",
        pdfHeader: settingsQuery.data.pdfHeader || "",
        schoolLogoUrl: settingsQuery.data.schoolLogoUrl || "",
        defaultDirectorate: settingsQuery.data.defaultDirectorate || "",
        defaultSubject: settingsQuery.data.defaultSubject || "",
        aiProvider: settingsQuery.data.aiProvider || "gemini",
        defaultExamType: settingsQuery.data.defaultExamType || "comprehensive",
        defaultQuestionTypes: settingsQuery.data.defaultQuestionTypes || "اختيار من متعدد، صح وخطأ، مقالي",
        generationTargets: settingsQuery.data.generationTargets || "الخطة، السبورة، الملخص، الخريطة الذهنية، حل التقويم",
      });
    }
  }, [settingsQuery.data]);

  if (!isAuthenticated) {
    return null;
  }

  if (settingsQuery.isLoading) {
    return <div className="min-h-screen bg-muted/20"><PublicNav /><main className="container py-10"><LoadingState variant="loading" title="جاري تحميل الإعدادات..." description="نستعيد تفضيلات حسابك." /></main></div>;
  }

  if (settingsQuery.isError) {
    return <div className="min-h-screen bg-muted/20"><PublicNav /><main className="container py-10"><LoadingState variant="error" title="تعذر تحميل الإعدادات" description="تحقق من الاتصال ثم أعد المحاولة." actionLabel="إعادة المحاولة" onAction={() => settingsQuery.refetch()} /></main></div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync(formData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("ارفع شعاراً بصيغة PNG أو JPG أو WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("يجب ألا يتجاوز حجم الشعار 5 ميجابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result.split(",")[1] : "";
      if (result) logoUploadMutation.mutate({ fileName: file.name, fileType: file.type as "image/png" | "image/jpeg" | "image/webp", fileData: result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => setFormData((previous) => ({ ...previous, schoolLogoUrl: "" }));

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>معلومات حسابك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <div className="p-3 bg-muted rounded-lg text-foreground">{user?.name}</div>
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <div className="p-3 bg-muted rounded-lg text-foreground">{user?.email || "غير محدد"}</div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات العرض</CardTitle>
              <CardDescription>تخصيص مظهر التطبيق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">المظهر</Label>
                <Select value={formData.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purple">بنفسجي</SelectItem>
                    <SelectItem value="blue">أزرق</SelectItem>
                    <SelectItem value="green">أخضر</SelectItem>
                    <SelectItem value="navy">كحلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">حجم الخط</Label>
                <Select value={formData.fontSize} onValueChange={(value) => handleSelectChange("fontSize", value)}>
                  <SelectTrigger id="fontSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">صغير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">نوع الخط</Label>
                <Select value={formData.fontFamily} onValueChange={(value) => handleSelectChange("fontFamily", value)}>
                  <SelectTrigger id="fontFamily">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cairo">Cairo</SelectItem>
                    <SelectItem value="amiri">Amiri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Default Values */}
          <Card>
            <CardHeader>
              <CardTitle>القيم الافتراضية</CardTitle>
              <CardDescription>اختر القيم الافتراضية عند إنشاء خطة جديدة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultSchool">المدرسة الافتراضية</Label>
                <Input
                  id="defaultSchool"
                  name="defaultSchool"
                  value={formData.defaultSchool}
                  onChange={handleChange}
                  placeholder="اسم المدرسة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTeacher">المعلم الافتراضي</Label>
                <Input
                  id="defaultTeacher"
                  name="defaultTeacher"
                  value={formData.defaultTeacher}
                  onChange={handleChange}
                  placeholder="اسم المعلم"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultDirectorate">المديرية</Label>
                <Input
                  id="defaultDirectorate"
                  name="defaultDirectorate"
                  value={formData.defaultDirectorate}
                  onChange={handleChange}
                  placeholder="اسم المديرية أو الإدارة التعليمية"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultSubject">المادة الافتراضية</Label>
                <Input
                  id="defaultSubject"
                  name="defaultSubject"
                  value={formData.defaultSubject}
                  onChange={handleChange}
                  placeholder="اسم المادة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">اللغة الافتراضية</Label>
                <Select value={formData.defaultLanguage} onValueChange={(value) => handleSelectChange("defaultLanguage", value)}>
                  <SelectTrigger id="defaultLanguage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">الإنجليزية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultModel">نموذج الذكاء الاصطناعي الافتراضي</Label>
                <Select value={formData.defaultModel} onValueChange={(value) => handleSelectChange("defaultModel", value)}>
                  <SelectTrigger id="defaultModel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ترويسة المستندات الرسمية</CardTitle>
              <CardDescription>تظهر الترويسة والشعار أعلى ملفات PDF المصدرة من الاختبارات وقائمة الأسئلة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pdfHeader">نص الترويسة</Label>
                <Textarea id="pdfHeader" name="pdfHeader" value={formData.pdfHeader} onChange={handleChange} rows={2} placeholder="وزارة التربية والتعليم — اسم المدرسة — العام الدراسي" />
                <p className="text-xs text-muted-foreground">يمكن كتابة أكثر من معلومة في سطر واحد أو سطرين لتظهر بشكل رسمي أعلى الصفحة.</p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="schoolLogo">شعار المدرسة</Label>
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed p-4">
                  {formData.schoolLogoUrl ? <div className="flex items-center gap-3"><img src={formData.schoolLogoUrl} alt="معاينة شعار المدرسة" className="h-16 w-16 rounded-lg border object-contain p-1" /><Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo} className="gap-1.5 text-destructive"><X className="h-4 w-4" />إزالة الشعار</Button></div> : <div className="flex items-center gap-2 text-sm text-muted-foreground"><ImagePlus className="h-5 w-5" />لم يتم رفع شعار بعد</div>}
                  <Input id="schoolLogo" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} disabled={logoUploadMutation.isPending} className="max-w-sm" />
                </div>
                <p className="text-xs text-muted-foreground">الصيغ المدعومة: PNG وJPG وWEBP، بحد أقصى 5 ميجابايت.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات الذكاء الاصطناعي والاختبارات</CardTitle>
              <CardDescription>حدد محرك التوليد والقيم الافتراضية لوحدة الاختبارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aiProvider">محرك الذكاء الاصطناعي</Label>
                  <Select value={formData.aiProvider} onValueChange={(value) => handleSelectChange("aiProvider", value)}>
                    <SelectTrigger id="aiProvider"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="gemini">Gemini</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultExamType">نوع الاختبار الافتراضي</Label>
                  <Select value={formData.defaultExamType} onValueChange={(value) => handleSelectChange("defaultExamType", value)}>
                    <SelectTrigger id="defaultExamType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">اختبار شامل</SelectItem>
                      <SelectItem value="formal">اختبار رسمي</SelectItem>
                      <SelectItem value="electronic">اختبار إلكتروني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultQuestionTypes">أنواع الأسئلة الافتراضية</Label>
                <Input id="defaultQuestionTypes" name="defaultQuestionTypes" value={formData.defaultQuestionTypes} onChange={handleChange} placeholder="اختيار من متعدد، صح وخطأ، مقالي" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generationTargets">محركات التوليد المفعّلة</Label>
                <Textarea id="generationTargets" name="generationTargets" value={formData.generationTargets} onChange={handleChange} rows={3} placeholder="الخطة، السبورة، الملخص، الخريطة الذهنية، حل التقويم" />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">حساب المستخدم</CardTitle>
              <CardDescription>إجراءات حساب المستخدم</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                if (settingsQuery.data) {
                  setFormData({
                    theme: settingsQuery.data.theme || "purple",
                    fontSize: settingsQuery.data.fontSize || "medium",
                    fontFamily: settingsQuery.data.fontFamily || "cairo",
                    defaultLanguage: settingsQuery.data.defaultLanguage || "ar",
                    defaultModel: settingsQuery.data.defaultModel || "gemini-1.5-flash",
                    defaultSchool: settingsQuery.data.defaultSchool || "",
                    defaultTeacher: settingsQuery.data.defaultTeacher || "",
                    pdfHeader: settingsQuery.data.pdfHeader || "",
                    schoolLogoUrl: settingsQuery.data.schoolLogoUrl || "",
                    defaultDirectorate: settingsQuery.data.defaultDirectorate || "",
                    defaultSubject: settingsQuery.data.defaultSubject || "",
                    aiProvider: settingsQuery.data.aiProvider || "gemini",
                    defaultExamType: settingsQuery.data.defaultExamType || "comprehensive",
                    defaultQuestionTypes: settingsQuery.data.defaultQuestionTypes || "اختيار من متعدد، صح وخطأ، مقالي",
                    generationTargets: settingsQuery.data.generationTargets || "الخطة، السبورة، الملخص، الخريطة الذهنية، حل التقويم",
                  });
                }
              }}
            >
              إعادة تعيين
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || updateSettingsMutation.isPending}
            >
              {isSaving || updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
