import PublicNav from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, LucideIcon, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  primaryHref?: string;
  primaryLabel?: string;
};

export default function ModulePlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
  features,
  primaryHref = "/prepare",
  primaryLabel = "ابدأ من التحضير الجديد",
}: ModulePlaceholderProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-blue-500/10 p-7 shadow-sm sm:p-12">
            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-xs font-bold text-primary">
                <Icon className="h-4 w-4" />
                {eyebrow}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">{title}</h1>
              <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={primaryHref}>
                  <Button className="gap-2 rounded-xl px-5">
                    {primaryLabel}
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl"
                  onClick={() => toast.info("هذه الوحدة قيد التوسعة وستظهر أدواتها هنا قريباً")}
                >
                  <Sparkles className="h-4 w-4" />
                  استكشف الإمكانات
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature} className="border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{feature}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-muted-foreground">
                  هذه الوظيفة مرتبطة بوحدة {title} وستُدار من هذه المساحة الموحدة.
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
