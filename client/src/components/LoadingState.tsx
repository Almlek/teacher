import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type LoadingStateProps = {
  variant: "loading" | "empty" | "error";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const loadingStateDefaults = {
  loading: { title: "جاري التحميل...", description: "لحظات ونجهز المحتوى لك." },
  empty: { title: "لا يوجد محتوى بعد", description: "ابدأ بإضافة عنصر جديد ليظهر هنا." },
  error: { title: "تعذر تحميل المحتوى", description: "حدثت مشكلة مؤقتة. حاول مرة أخرى." },
} as const;

export function getLoadingStateCopy(variant: LoadingStateProps["variant"]) {
  return loadingStateDefaults[variant];
}

export default function LoadingState({ variant, title, description, actionLabel, onAction }: LoadingStateProps) {
  const copy = getLoadingStateCopy(variant);
  const Icon = variant === "loading" ? Loader2 : variant === "empty" ? Inbox : AlertCircle;
  const iconClass = variant === "error" ? "text-destructive" : variant === "empty" ? "text-muted-foreground/60" : "text-primary";

  return (
    <div role={variant === "error" ? "alert" : "status"} className="rounded-3xl border border-border/70 bg-card px-6 py-20 text-center shadow-sm">
      <Icon className={`mx-auto h-11 w-11 ${iconClass} ${variant === "loading" ? "animate-spin" : ""}`} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-extrabold">{title || copy.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description || copy.description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 rounded-xl">{actionLabel}</Button>
      )}
    </div>
  );
}
