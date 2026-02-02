'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Mic, MicOff, Loader2, Radio } from 'lucide-react';
import { useRealtimeSTT } from '../hooks/useRealtimeSTT';
import { cn } from '@/lib/utils';

interface RealtimeSTTControlsProps {
  isCallActive: boolean;
}

export function RealtimeSTTControls({ isCallActive }: RealtimeSTTControlsProps) {
  const [activeSpeaker, setActiveSpeaker] = useState<'customer' | 'counselor' | null>(null);

  const customerSTT = useRealtimeSTT({ speaker: 'customer' });
  const counselorSTT = useRealtimeSTT({ speaker: 'counselor' });

  const handleCustomerMic = () => {
    if (customerSTT.isConnected) {
      customerSTT.stopConnection();
      setActiveSpeaker(null);
    } else {
      // 다른 연결 중지
      if (counselorSTT.isConnected) {
        counselorSTT.stopConnection();
      }
      customerSTT.startConnection();
      setActiveSpeaker('customer');
    }
  };

  const handleCounselorMic = () => {
    if (counselorSTT.isConnected) {
      counselorSTT.stopConnection();
      setActiveSpeaker(null);
    } else {
      // 다른 연결 중지
      if (customerSTT.isConnected) {
        customerSTT.stopConnection();
      }
      counselorSTT.startConnection();
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
              variant={customerSTT.isConnected ? 'default' : 'outline'}
              size="sm"
              onClick={handleCustomerMic}
              disabled={customerSTT.isConnecting}
              className={cn(
                'gap-2',
                customerSTT.isConnected && 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {customerSTT.isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : customerSTT.isConnected ? (
                <Radio className="w-4 h-4 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              고객
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>고객 실시간 음성 인식 {customerSTT.isConnected ? '중지' : '시작'}</p>
          </TooltipContent>
        </Tooltip>

        {/* 상담사 마이크 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={counselorSTT.isConnected ? 'default' : 'outline'}
              size="sm"
              onClick={handleCounselorMic}
              disabled={counselorSTT.isConnecting}
              className={cn(
                'gap-2',
                counselorSTT.isConnected && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {counselorSTT.isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : counselorSTT.isConnected ? (
                <Radio className="w-4 h-4 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              상담사
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>상담사 실시간 음성 인식 {counselorSTT.isConnected ? '중지' : '시작'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 실시간 연결 상태 표시 */}
      {activeSpeaker && (customerSTT.isConnected || counselorSTT.isConnected) && (
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

      {/* 연결 중 표시 */}
      {(customerSTT.isConnecting || counselorSTT.isConnecting) && (
        <Badge variant="secondary" className="gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          연결 중...
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
