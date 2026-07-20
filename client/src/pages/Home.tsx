import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Settings, Archive, Plus, Zap, BarChart3, Users, CheckCircle, ArrowRight, Star } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Navigation */}
        <nav className="border-b border-border/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">دفتر التحضير الذكي</h1>
            </div>
            <Button onClick={startLogin} className="gap-2">
              تسجيل الدخول
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">أداة التحضير الذكية للمعلمين</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              خطط دروس احترافية في <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">ثوان</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              استخدم الذكاء الاصطناعي (Gemini) لإنشاء خطط دروس شاملة واحترافية. وفّر الوقت والجهد، وركز على التدريس الفعال.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={startLogin} size="lg" className="gap-2 h-12 text-base">
                ابدأ مجاناً الآن
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 text-base">
                شاهد العرض التوضيحي
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">معلم يستخدم التطبيق</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">خطة درس تم إنشاؤها</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
              <p className="text-muted-foreground">تقييم المستخدمين</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-slate-900 py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-foreground mb-4">المميزات الرئيسية</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                كل ما تحتاجه لإنشاء خطط دروس احترافية بسهولة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>توليد ذكي فوري</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    استخدم Gemini AI لإنشاء خطط دروس شاملة في ثوان بدلاً من ساعات
                  </p>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>محتوى متعدد الأشكال</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    احصل على الدرس الكامل، السبورة الذكية، والملخصات التفاعلية
                  </p>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>أرشيف منظم</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    احفظ جميع خططك وابحث عنها بسهولة باستخدام البحث المتقدم
                  </p>
                </CardContent>
              </Card>

              {/* Feature 4 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>تصدير احترافي</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    صدّر خططك بصيغ متعددة (PDF, Word, HTML) جاهزة للطباعة
                  </p>
                </CardContent>
              </Card>

              {/* Feature 5 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>مكتبة مشتركة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    شارك خططك مع زملائك واستفد من خطط المعلمين الآخرين
                  </p>
                </CardContent>
              </Card>

              {/* Feature 6 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-4">
                    <Settings className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle>تخصيص كامل</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    اختر من ثيمات ملونة وخطوط عربية وحجوم نصوص مختلفة
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-foreground mb-4">خطط الاشتراك</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                اختر الخطة المناسبة لاحتياجاتك
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>مجاني</CardTitle>
                  <CardDescription>للمعلمين الجدد</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">0</span>
                    <span className="text-muted-foreground"> ر.س/شهر</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>5 خطط دروس شهرياً</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Gemini Flash فقط</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>أرشيف محدود</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    ابدأ الآن
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="border-2 border-primary shadow-lg relative">
                <div className="absolute -top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  الأكثر شهرة
                </div>
                <CardHeader>
                  <CardTitle>احترافي</CardTitle>
                  <CardDescription>للمعلمين النشطين</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">29</span>
                    <span className="text-muted-foreground"> ر.س/شهر</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>خطط دروس غير محدودة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Gemini Flash و Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>أرشيف كامل</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>مكتبة مشتركة</span>
                    </li>
                  </ul>
                  <Button onClick={startLogin} className="w-full gap-2">
                    اشترك الآن
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>مؤسسي</CardTitle>
                  <CardDescription>للمدارس والمؤسسات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">99</span>
                    <span className="text-muted-foreground">+ ر.س/شهر</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>كل ميزات Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>دعم فني أولوي</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>حسابات متعددة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>تقارير متقدمة</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    اتصل بنا
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
          <div className="container mx-auto px-4 text-center text-white">
            <h3 className="text-4xl font-bold mb-4">جاهز لتحسين تحضيرك؟</h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              انضم إلى آلاف المعلمين الذين يوفرون الوقت والجهد باستخدام دفتر التحضير الذكي
            </p>
            <Button onClick={startLogin} size="lg" variant="secondary" className="gap-2">
              ابدأ مجاناً الآن
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t border-border py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-foreground mb-4">عن التطبيق</h4>
                <p className="text-sm text-muted-foreground">
                  أداة ذكية لإنشاء خطط دروس احترافية باستخدام الذكاء الاصطناعي
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">الروابط</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition">الميزات</a></li>
                  <li><a href="#" className="hover:text-foreground transition">الأسعار</a></li>
                  <li><a href="#" className="hover:text-foreground transition">المدونة</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">القانوني</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground transition">سياسة الخصوصية</a></li>
                  <li><a href="#" className="hover:text-foreground transition">شروط الاستخدام</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">التواصل</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="mailto:support@smartplan.com" className="hover:text-foreground transition">البريد الإلكتروني</a></li>
                  <li><a href="#" className="hover:text-foreground transition">تويتر</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2026 دفتر التحضير الذكي. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated user dashboard
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
