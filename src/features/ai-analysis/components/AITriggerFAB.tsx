'use client';

import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, Sparkles } from 'lucide-react';
import { useAIAnalysisStore, useCallStore } from '@/stores';
import { useMockAI } from '../hooks/useMockAI';
import { cn } from '@/lib/utils';

export function AITriggerFAB() {
  const { isLoading } = useAIAnalysisStore();
  const { callStatus } = useCallStore();
  const { analyzeContext } = useMockAI();

  const handleClick = useCallback(async () => {
    if (!isLoading) {
      await analyzeContext();
    }
  }, [isLoading, analyzeContext]);

  // 통화 중이 아니면 비활성화
  const isDisabled = callStatus === 'idle' || isLoading;

  // 키보드 단축키: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        // 통화 중일 때만 작동
        if (!isDisabled) {
          handleClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick, isDisabled]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className={cn(
              'fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50',
              'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700',
              isLoading && 'animate-pulse'
            )}
            onClick={handleClick}
            disabled={isDisabled}
          >
            {isLoading ? (
              <Sparkles className="w-6 h-6 animate-spin" />
            ) : (
              <Bot className="w-6 h-6" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>AI 컨텍스트 분석</p>
          <p className="text-xs text-muted-foreground">Ctrl+Shift+A</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
