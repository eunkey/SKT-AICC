'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User, Phone, Clock, MessageSquare, FileText, Send } from 'lucide-react';

interface HistoryDetailProps {
  id: string;
}

// SK텔레콤 Mock 상세 데이터
const getMockDetail = (id: string) => ({
  id,
  customerName: '김민수',
  customerPhone: '010-1234-5678',
  status: 'completed',
  startedAt: new Date(Date.now() - 1000 * 60 * 30),
  endedAt: new Date(Date.now() - 1000 * 60 * 27),
  duration: 195,
  summary: `## 상담 요약

**고객명**: 김민수
**상담 시간**: 3분 15초

### 문의 내용
- 요금제 변경 문의 (데이터 사용량 적어 저렴한 요금제 희망)
- T멤버십 포인트 사용 방법 문의

### 처리 내용
1. 본인 확인 완료 (생년월일: 1985.07.20)
2. 현재 요금제 확인: 5G 프라임 (월 89,000원)
3. 5G 슬림 요금제 변경 처리 (월 59,000원, 8GB)
4. 변경 적용일: 다음 달 1일
5. T멤버십 포인트 잔액 안내: 3,500점

### 추가 안내
- 요금제 변경 내역 문자 발송 완료
- T월드 앱에서 실시간 데이터 사용량 확인 가능`,
  transcripts: [
    { speaker: 'customer', text: '여보세요, 요금제 변경하려고 전화했는데요', timestamp: new Date() },
    { speaker: 'counselor', text: '네, SK텔레콤 고객센터입니다. 요금제 변경 문의시군요. 본인 확인을 위해 성함과 생년월일 말씀해 주시겠어요?', timestamp: new Date() },
    { speaker: 'customer', text: '네, 김민수고요. 1985년 7월 20일입니다.', timestamp: new Date() },
    { speaker: 'counselor', text: '김민수 고객님, 본인 확인되었습니다. 현재 5G 프라임 요금제 사용 중이신데요, 어떤 요금제로 변경 원하시나요?', timestamp: new Date() },
    { speaker: 'customer', text: '데이터를 많이 안 써서 좀 저렴한 걸로 바꾸고 싶어요.', timestamp: new Date() },
    { speaker: 'counselor', text: '네, 5G 슬림 요금제 추천드립니다. 월 5만 9천원에 8GB 제공됩니다.', timestamp: new Date() },
    { speaker: 'customer', text: '그걸로 변경해 주세요.', timestamp: new Date() },
    { speaker: 'counselor', text: '변경 완료되었습니다. 다음 달 1일부터 적용됩니다.', timestamp: new Date() },
  ],
  smsLogs: [
    {
      recipient: '010-1234-5678',
      content: '[SK텔레콤] 김민수 고객님, 요금제가 5G 슬림으로 변경되었습니다. 적용일: 다음 달 1일. 문의: 114',
      status: 'sent',
      sentAt: new Date(),
    },
  ],
});

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}분 ${secs}초`;
}

export function HistoryDetail({ id }: HistoryDetailProps) {
  const detail = getMockDetail(id);

  return (
    <div className="space-y-6">
      {/* 메타 정보 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">상담 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                고객명
              </p>
              <p className="text-sm font-medium">{detail.customerName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" />
                연락처
              </p>
              <p className="text-sm font-medium">
                {detail.customerPhone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                상담 시간
              </p>
              <p className="text-sm font-medium">{formatDuration(detail.duration)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">시작 시각</p>
              <p className="text-sm font-medium">
                {format(detail.startedAt, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 요약 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            상담 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm">{detail.summary}</div>
          </div>
        </CardContent>
      </Card>

      {/* 전사본 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            대화 내용
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {detail.transcripts.map((item, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    item.speaker === 'counselor' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Badge
                    variant={item.speaker === 'customer' ? 'default' : 'secondary'}
                    className="h-6"
                  >
                    {item.speaker === 'customer' ? '고객' : '상담사'}
                  </Badge>
                  <div
                    className={`flex-1 max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      item.speaker === 'customer'
                        ? 'bg-slate-100'
                        : 'bg-red-50'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* SMS 로그 */}
      {detail.smsLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4" />
              SMS 발송 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {detail.smsLogs.map((log, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="gap-1">
                      <Phone className="w-3 h-3" />
                      {log.recipient.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3')}
                    </Badge>
                    <Badge variant="secondary">{log.status === 'sent' ? '발송 완료' : '실패'}</Badge>
                  </div>
                  <p className="text-sm">{log.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(log.sentAt, 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
