'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Clock, Timer, CreditCard, FileText, Gift } from 'lucide-react';
import { useCallStore } from '@/stores';

function maskPhoneNumber(phone: string): string {
  // 010-1234-5678 -> 010-****-5678
  const parts = phone.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-****-${parts[2]}`;
  }
  // 01012345678 -> 010****5678
  if (phone.length === 11) {
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  }
  return phone;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function CustomerInfoCard() {
  const { customerInfo, callStatus, startedAt } = useCallStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || callStatus === 'idle' || callStatus === 'wrap-up') {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, callStatus]);

  const isCallActive = callStatus !== 'idle' && callStatus !== 'wrap-up';

  if (!isCallActive || !customerInfo) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            고객 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            상담 대기 중
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            고객 정보
          </CardTitle>
          <Badge
            variant={callStatus === 'hold' ? 'secondary' : 'default'}
            className={callStatus === 'active' ? 'bg-green-500' : ''}
          >
            {callStatus === 'active' ? '상담 중' : callStatus === 'hold' ? '보류' : '연결 중'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">고객명</p>
              <p className="text-sm font-medium">{customerInfo.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">전화번호</p>
              <p className="text-sm font-medium">{maskPhoneNumber(customerInfo.phone)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">시작 시간</p>
              <p className="text-sm font-medium">{startedAt ? formatTime(startedAt) : '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">경과 시간</p>
              <p className="text-sm font-medium font-mono">{formatDuration(elapsed)}</p>
            </div>
          </div>
        </div>

        {/* 요금제 정보 */}
        {customerInfo.plan && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">요금제</p>
                <p className="text-sm font-medium">
                  {customerInfo.plan}
                  {customerInfo.planPrice && (
                    <span className="text-muted-foreground ml-1">
                      ({customerInfo.planPrice})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {customerInfo.contractType && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">약정</p>
                  <p className="text-sm font-medium">{customerInfo.contractType}</p>
                </div>
              </div>
            )}

            {customerInfo.services && customerInfo.services.length > 0 && (
              <div className="flex items-start gap-2">
                <Gift className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">이용 서비스</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {customerInfo.services.map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
