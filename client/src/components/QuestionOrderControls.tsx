import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import React from "react";

type QuestionOrderControlsProps = {
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
};

export default function QuestionOrderControls({ index, total, onMove, onDelete }: QuestionOrderControlsProps) {
  return (
    <div className="flex items-center gap-1" aria-label={`ترتيب السؤال ${index + 1}`}>
      <Button type="button" variant="ghost" size="icon" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`نقل السؤال ${index + 1} إلى الأعلى`} title="نقل إلى الأعلى"><ArrowUp className="h-4 w-4" /></Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => onMove(1)} disabled={index === total - 1} aria-label={`نقل السؤال ${index + 1} إلى الأسفل`} title="نقل إلى الأسفل"><ArrowDown className="h-4 w-4" /></Button>
      {total > 1 && <Button type="button" variant="ghost" size="icon" onClick={onDelete} aria-label={`حذف السؤال ${index + 1}`} title="حذف السؤال"><Trash2 className="h-4 w-4 text-destructive" /></Button>}
    </div>
  );
}
