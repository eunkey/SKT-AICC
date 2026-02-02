'use client';

import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface SummarySectionProps {
  summary: string;
}

export function SummarySection({ summary }: SummarySectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        <FileText className="w-3 h-3" />
        요약
      </Label>
      <div className="prose prose-sm max-w-none bg-blue-50 rounded-lg p-4 text-sm leading-relaxed">
        <div className="whitespace-pre-wrap">{summary}</div>
      </div>
    </div>
  );
}
