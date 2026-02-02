'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranscriptStore, useUIStore } from '@/stores';
import { TranscriptList } from './TranscriptList';
import { JumpToLiveButton } from './JumpToLiveButton';
import { MessageSquare } from 'lucide-react';

export function ConversationStream() {
  const { transcripts, currentInterim, isStreaming } = useTranscriptStore();
  const { setJumpToLiveVisible } = useUIStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // 자동 스크롤
  useEffect(() => {
    if (isAutoScrolling && scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [transcripts, currentInterim, isAutoScrolling]);

  // 스크롤 감지
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

    setIsAutoScrolling(isNearBottom);
    setJumpToLiveVisible(!isNearBottom && isStreaming);
  };

  const handleJumpToLive = () => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
      setIsAutoScrolling(true);
      setJumpToLiveVisible(false);
    }
  };

  const allTranscripts = currentInterim
    ? [...transcripts, currentInterim]
    : transcripts;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          실시간 대화
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-normal">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              실시간
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative overflow-hidden">
        <div ref={scrollRef} className="h-full">
          <ScrollArea
            className="h-full"
            onScrollCapture={handleScroll}
          >
            <div className="p-4">
              {allTranscripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p>통화가 시작되면 대화 내용이 여기에 표시됩니다.</p>
                </div>
              ) : (
                <TranscriptList transcripts={allTranscripts} />
              )}
            </div>
          </ScrollArea>
        </div>
        <JumpToLiveButton onClick={handleJumpToLive} />
      </CardContent>
    </Card>
  );
}
