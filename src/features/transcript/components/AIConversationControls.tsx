'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { useAIConversation } from '../hooks/useAIConversation';
import { cn } from '@/lib/utils';

interface AIConversationControlsProps {
  isCallActive: boolean;
}

export function AIConversationControls({ isCallActive }: AIConversationControlsProps) {
  const {
    isRecording,
    isProcessing,
    isSpeaking,
    error,
    startListening,
    stopListening,
  } = useAIConversation();

  const handleToggle = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isCallActive) return null;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isRecording ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={isProcessing || isSpeaking}
        className={cn(
          'gap-2 min-w-[140px]',
          isRecording && 'bg-red-600 hover:bg-red-700'
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            처리 중...
          </>
        ) : isSpeaking ? (
          <>
            <Volume2 className="w-4 h-4 animate-pulse" />
            응답 중...
          </>
        ) : isRecording ? (
          <>
            <Mic className="w-4 h-4 animate-pulse" />
            듣는 중...
          </>
        ) : (
          <>
            <MicOff className="w-4 h-4" />
            대화 시작
          </>
        )}
      </Button>

      {/* 상태 표시 */}
      {isRecording && !isProcessing && !isSpeaking && (
        <Badge variant="secondary" className="bg-red-100 text-red-700 animate-pulse">
          고객 음성 인식 중...
        </Badge>
      )}

      {isProcessing && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          AI 응답 생성 중...
        </Badge>
      )}

      {isSpeaking && (
        <Badge variant="secondary" className="bg-green-100 text-green-700 animate-pulse">
          AI 상담사 응답 중...
        </Badge>
      )}

      {error && (
        <Badge variant="destructive">
          {error}
        </Badge>
      )}
    </div>
  );
}
