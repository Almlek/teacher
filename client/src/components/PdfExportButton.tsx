import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { triggerPrintExport } from "@/lib/printExport";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

type PdfExportButtonProps = {
  title: string;
};

export default function PdfExportButton({ title }: PdfExportButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handleExportPDF = () => {
    setIsPrinting(true);
    window.addEventListener("afterprint", () => setIsPrinting(false), { once: true });
    triggerPrintExport(title, {
      getTitle: () => document.title,
      setTitle: (nextTitle) => {
        document.title = nextTitle;
      },
      print: () => window.print(),
      onAfterPrint: (callback) => window.addEventListener("afterprint", callback),
      offAfterPrint: (callback) => window.removeEventListener("afterprint", callback),
    });
    toast.success("تم فتح نافذة الطباعة؛ اختر حفظ بصيغة PDF لإكمال التصدير");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportPDF}
      disabled={isPrinting}
      aria-label="تصدير الخطة إلى PDF"
      className="gap-2 rounded-xl"
    >
      <FileDown className="h-4 w-4" />
      {isPrinting ? "جاري فتح الطباعة..." : "PDF"}
    </Button>
  );
}
