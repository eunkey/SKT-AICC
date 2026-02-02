'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Radio, AlertCircle } from 'lucide-react';
import { useWebSpeechSTT } from '../hooks/useWebSpeechSTT';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WebSpeechSTTControlsProps {
  isCallActive: boolean;
}

export function WebSpeechSTTControls({ isCallActive }: WebSpeechSTTControlsProps) {
  const [activeSpeaker, setActiveSpeaker] = useState<'customer' | 'counselor' | null>(null);

  const customerSTT = useWebSpeechSTT({ speaker: 'customer', language: 'ko-KR' });
  const counselorSTT = useWebSpeechSTT({ speaker: 'counselor', language: 'ko-KR' });

  const handleCustomerMic = () => {
    if (customerSTT.isListening) {
      customerSTT.stopListening();
      setActiveSpeaker(null);
    } else {
      // 다른 인식 중지
      if (counselorSTT.isListening) {
        counselorSTT.stopListening();
      }
      customerSTT.startListening();
      setActiveSpeaker('customer');
    }
  };

  const handleCounselorMic = () => {
    if (counselorSTT.isListening) {
      counselorSTT.stopListening();
      setActiveSpeaker(null);
    } else {
      // 다른 인식 중지
      if (customerSTT.isListening) {
        customerSTT.stopListening();
      }
      counselorSTT.startListening();
      setActiveSpeaker('counselor');
    }
  };

  // 브라우저 지원 확인
  if (!customerSTT.isSupported || !counselorSTT.isSupported) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isCallActive) return null;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {/* 고객 마이크 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={customerSTT.isListening ? 'default' : 'outline'}
              size="sm"
              onClick={handleCustomerMic}
              className={cn(
                'gap-2',
                customerSTT.isListening && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {customerSTT.isListening ? (
                <Radio className="w-4 h-4 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              고객
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>고객 실시간 음성 인식 {customerSTT.isListening ? '중지' : '시작'}</p>
          </TooltipContent>
        </Tooltip>

        {/* 상담사 마이크 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={counselorSTT.isListening ? 'default' : 'outline'}
              size="sm"
              onClick={handleCounselorMic}
              className={cn(
                'gap-2',
                counselorSTT.isListening && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {counselorSTT.isListening ? (
                <Radio className="w-4 h-4 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              상담사
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>상담사 실시간 음성 인식 {counselorSTT.isListening ? '중지' : '시작'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 실시간 연결 상태 표시 */}
      {activeSpeaker && (customerSTT.isListening || counselorSTT.isListening) && (
        <Badge
          variant="secondary"
          className={cn(
            'gap-1.5',
            activeSpeaker === 'customer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          )}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {activeSpeaker === 'customer' ? '고객' : '상담사'} 실시간 인식 중
        </Badge>
      )}

      {/* 에러 표시 */}
      {(customerSTT.error || counselorSTT.error) && (
        <Badge variant="destructive" className="gap-1.5">
          <AlertCircle className="w-3 h-3" />
          {customerSTT.error || counselorSTT.error}
        </Badge>
      )}
    </div>
  );
}
