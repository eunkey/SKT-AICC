'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useRealSTT } from '../hooks/useRealSTT';
import { cn } from '@/lib/utils';

interface STTControlsProps {
  isCallActive: boolean;
}

export function STTControls({ isCallActive }: STTControlsProps) {
  const [activeSpeaker, setActiveSpeaker] = useState<'customer' | 'counselor' | null>(null);

  const customerSTT = useRealSTT({ speaker: 'customer' });
  const counselorSTT = useRealSTT({ speaker: 'counselor' });

  const handleCustomerMic = () => {
    if (customerSTT.isRecording) {
      customerSTT.stopRecording();
      setActiveSpeaker(null);
    } else {
      // 다른 녹음 중지
      if (counselorSTT.isRecording) {
        counselorSTT.stopRecording();
      }
      customerSTT.startRecording();
      setActiveSpeaker('customer');
    }
  };

  const handleCounselorMic = () => {
    if (counselorSTT.isRecording) {
      counselorSTT.stopRecording();
      setActiveSpeaker(null);
    } else {
      // 다른 녹음 중지
      if (customerSTT.isRecording) {
        customerSTT.stopRecording();
      }
      counselorSTT.startRecording();
      setActiveSpeaker('counselor');
    }
  };

  if (!isCallActive) return null;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {/* 고객 마이크 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={customerSTT.isRecording ? 'default' : 'outline'}
              size="sm"
              onClick={handleCustomerMic}
              disabled={customerSTT.isProcessing}
              className={cn(
                'gap-2',
                customerSTT.isRecording && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {customerSTT.isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : customerSTT.isRecording ? (
                <Mic className="w-4 h-4 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              고객
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>고객 음성 녹음 {customerSTT.isRecording ? '중지' : '시작'}</p>
          </TooltipContent>
        </Tooltip>

        {/* 상담사 마이크 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={counselorSTT.isRecording ? 'default' : 'outline'}
              size="sm"
              onClick={handleCounselorMic}
              disabled={counselorSTT.isProcessing}
              className={cn(
                'gap-2',
                counselorSTT.isRecording && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {counselorSTT.isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : counselorSTT.isRecording ? (
                <Mic className="w-4 h-4 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              상담사
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>상담사 음성 녹음 {counselorSTT.isRecording ? '중지' : '시작'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 녹음 상태 표시 */}
      {activeSpeaker && (
        <Badge
          variant="secondary"
          className={cn(
            'animate-pulse',
            activeSpeaker === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          )}
        >
          {activeSpeaker === 'customer' ? '고객' : '상담사'} 음성 인식 중...
        </Badge>
      )}

      {/* 에러 표시 */}
      {(customerSTT.error || counselorSTT.error) && (
        <Badge variant="destructive">
          {customerSTT.error || counselorSTT.error}
        </Badge>
      )}
    </div>
  );
}
