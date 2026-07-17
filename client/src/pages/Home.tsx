import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Settings, Archive, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">دفتر التحضير الذكي</h1>
            <p className="text-muted-foreground">إعداد خطط الدروس بسهولة باستخدام الذكاء الاصطناعي</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle>مرحباً بك</CardTitle>
              <CardDescription>سجل دخولك لبدء إنشاء خطط الدروس</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={startLogin}
                className="w-full h-12 text-base"
                size="lg"
              >
                تسجيل الدخول
              </Button>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">خطط احترافية</h3>
                <p className="text-sm text-muted-foreground">إنشاء خطط دروس منظمة وشاملة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">ذكاء اصطناعي</h3>
                <p className="text-sm text-muted-foreground">توليد محتوى ذكي وملخصات تفاعلية</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">أرشيف منظم</h3>
                <p className="text-sm text-muted-foreground">حفظ واسترجاع خططك بسهولة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">دفتر التحضير الذكي</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">أهلاً بك، {user?.name?.split(" ")[0]}</h2>
          <p className="text-muted-foreground text-lg">ابدأ بإنشاء خطة درس جديدة أو استعرض خططك السابقة</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Link href="/lessons/new">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">تحضير جديد</h3>
                  <p className="text-sm text-muted-foreground">إنشاء خطة درس جديدة</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lessons">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">الأرشيف</h3>
                  <p className="text-sm text-muted-foreground">استعرض خططك السابقة</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/library">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">المكتبة</h3>
                  <p className="text-sm text-muted-foreground">مكتبة المراجع والكتب</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="cursor-pointer hover:shadow-lg hover:border-primary transition-all h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">الإعدادات</h3>
                  <p className="text-sm text-muted-foreground">تخصيص تفضيلاتك</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-6">المميزات الرئيسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">✨</span>
                  </div>
                  توليد ذكي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">استخدم قوة الذكاء الاصطناعي (Gemini) لإنشاء خطط دروس احترافية وشاملة في ثوان</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">📊</span>
                  </div>
                  محتوى متنوع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">احصل على السبورة الذكية والملخصات التفاعلية والدروس الصوتية</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">💾</span>
                  </div>
                  حفظ منظم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">احفظ جميع خططك في أرشيف منظم وابحث عنها بسهولة</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center border border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-3">جاهز لبدء التحضير؟</h3>
          <p className="text-muted-foreground mb-6">أنشئ خطة درسك الأولى الآن واستمتع بتجربة التحضير الذكي</p>
          <Link href="/lessons/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              إنشاء خطة درس جديدة
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
