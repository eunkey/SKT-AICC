'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, Hash, ChevronRight, CheckCircle2, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface CallSummarySectionProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
}

export function CallSummarySection({
  summary,
  onSummaryChange,
}: CallSummarySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);

  const handleSave = () => {
    onSummaryChange(editedSummary);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSummary(summary);
    setIsEditing(false);
  };

  const markdownComponents = {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="flex items-center gap-2 text-base font-semibold bg-muted/50 dark:bg-muted/30 border-l-4 border-[#E4002B] pl-3 py-1.5 pr-3 rounded-r-md mb-2 mt-4 first:mt-0">
        <Hash className="w-3.5 h-3.5 text-[#E4002B] flex-shrink-0" />
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="flex items-center gap-1.5 text-sm font-medium border-l-2 border-gray-300 dark:border-gray-600 pl-3 mb-1.5 mt-3">
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        {children}
      </h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-relaxed mb-2 text-sm">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-2 space-y-1 list-none pl-0">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-2 space-y-1 list-none pl-0">{children}</ol>
    ),
    li: ({ children, ordered, index }: { children?: React.ReactNode; ordered?: boolean; index?: number }) => {
      if (ordered) {
        return (
          <li className="flex items-start gap-2 pl-0 text-sm">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E4002B]/10 text-[#E4002B] text-xs font-medium flex items-center justify-center mt-0.5">
              {(index ?? 0) + 1}
            </span>
            <span className="flex-1">{children}</span>
          </li>
        );
      }
      return (
        <li className="flex items-start gap-2 pl-0 text-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#E4002B]/70 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{children}</span>
        </li>
      );
    },
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-muted-foreground">{children}</em>
    ),
    hr: () => (
      <div className="my-4 flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <Minus className="w-3 h-3 text-muted-foreground/50" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    ),
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const isCodeBlock = className?.includes('language-');
      if (isCodeBlock) {
        return <code className={cn('block', className)}>{children}</code>;
      }
      return (
        <code className="px-1 py-0.5 bg-[#E4002B]/10 text-[#E4002B] dark:bg-[#E4002B]/20 dark:text-red-300 rounded text-xs font-mono">
          {children}
        </code>
      );
    },
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-3 rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-muted/70 dark:bg-muted/50">{children}</thead>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-3 py-1.5 text-left font-semibold text-foreground border-b border-border text-sm">{children}</th>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="divide-y divide-border">{children}</tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors">{children}</tr>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-3 py-1.5 text-foreground text-sm">{children}</td>
    ),
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">통화 요약</Label>
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            편집
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            rows={15}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="w-3 h-3 mr-1" />
              취소
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-3 h-3 mr-1" />
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-none bg-muted/50 rounded-lg p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {summary}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
