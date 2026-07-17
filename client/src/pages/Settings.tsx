import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, LogOut } from "lucide-react";
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

  const [formData, setFormData] = useState({
    theme: "purple",
    fontSize: "medium",
    fontFamily: "cairo",
    defaultLanguage: "ar",
    defaultModel: "gemini-1.5-flash",
    defaultSchool: "",
    defaultTeacher: "",
    defaultDirectorate: "",
    defaultSubject: "",
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
        defaultDirectorate: settingsQuery.data.defaultDirectorate || "",
        defaultSubject: settingsQuery.data.defaultSubject || "",
      });
    }
  }, [settingsQuery.data]);

  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

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
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        </div>
      </header>

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
                    defaultDirectorate: settingsQuery.data.defaultDirectorate || "",
                    defaultSubject: settingsQuery.data.defaultSubject || "",
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
