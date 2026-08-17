import PublicNav from "@/components/PublicNav";
import LoadingState from "@/components/LoadingState";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-muted/20">
      <PublicNav />
      <main className="container py-16">
        <LoadingState
          variant="empty"
          title="الصفحة غير موجودة"
          description="يبدو أن الرابط غير صحيح أو أن الصفحة نُقلت. يمكنك العودة إلى الصفحة الرئيسية ومتابعة العمل من هناك."
          actionLabel="العودة للرئيسية"
          onAction={() => setLocation("/")}
        />
      </main>
    </div>
  );
}
