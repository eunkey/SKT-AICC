'use client';

import { useAIAnalysisStore, AIAnalysisResult } from '@/stores';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Clock, FileText } from 'lucide-react';

export function HistoryTab() {
  const { history, setCurrentResult } = useAIAnalysisStore();

  const handleSelect = (result: AIAnalysisResult) => {
    setCurrentResult(result);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">분석 히스토리가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {history.map((item) => (
        <button
          key={item.id}
          onClick={() => handleSelect(item)}
          className="w-full text-left p-3 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
        >
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.query}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.summary.split('\n')[0]}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {format(item.createdAt, 'HH:mm:ss', { locale: ko })}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
