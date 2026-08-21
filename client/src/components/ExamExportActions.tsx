import { Button } from "@/components/ui/button";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";
import { downloadExamAsWord, ExamExportData, triggerExamPrintExport } from "@/lib/examExport";

type ExamExportActionsProps = {
  exam: ExamExportData;
  disabled?: boolean;
};

export default function ExamExportActions({ exam, disabled = false }: ExamExportActionsProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePdfExport = () => {
    setIsPrinting(true);
    const notifyAfterPrint = () => {
      setIsPrinting(false);
      toast.success("تم فتح نافذة الطباعة. اختر حفظ بصيغة PDF لإكمال التصدير.");
    };
    window.addEventListener("afterprint", notifyAfterPrint, { once: true });
    triggerExamPrintExport(exam.title, {
      getTitle: () => document.title,
      setTitle: (title: string) => { document.title = title; },
      print: () => window.print(),
      onAfterPrint: (callback: () => void) => window.addEventListener("afterprint", callback, { once: true }),
      offAfterPrint: (callback: () => void) => window.removeEventListener("afterprint", callback),
    });
  };

  const handleWordExport = () => {
    downloadExamAsWord(exam);
    toast.success("تم تنزيل ملف Word الجاهز للطباعة والمشاركة.");
  };

  return (
    <div className="flex flex-wrap gap-2" data-print-hide>
      <Button type="button" variant="outline" onClick={handlePdfExport} disabled={disabled || isPrinting} className="gap-2 rounded-xl">
        {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        {isPrinting ? "جاري فتح الطباعة..." : "تصدير PDF"}
      </Button>
      <Button type="button" variant="outline" onClick={handleWordExport} disabled={disabled} className="gap-2 rounded-xl">
        <FileText className="h-4 w-4" /> تصدير Word
      </Button>
    </div>
  );
}
