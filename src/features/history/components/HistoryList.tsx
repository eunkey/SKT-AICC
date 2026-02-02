'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, Phone, Clock, User, ChevronRight } from 'lucide-react';

// SK텔레콤 Mock 이력 데이터
const mockHistory = [
  {
    id: '1',
    customerName: '김민수',
    customerPhone: '010-1234-5678',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 30),
    duration: 195,
    summary: '5G 프라임 → 5G 슬림 요금제 변경, T멤버십 포인트 안내',
  },
  {
    id: '2',
    customerName: '이영희',
    customerPhone: '010-9876-5432',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 120),
    duration: 180,
    summary: '일본 로밍 서비스 문의, baro 로밍 신청',
  },
  {
    id: '3',
    customerName: '박철수',
    customerPhone: '010-5555-1234',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    duration: 240,
    summary: '휴대폰 분실 신고, 회선 정지 및 임대폰 안내',
  },
  {
    id: '4',
    customerName: '정수진',
    customerPhone: '010-3333-4444',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    duration: 150,
    summary: 'SK브로드밴드 인터넷 결합 상품 문의',
  },
  {
    id: '5',
    customerName: '최동훈',
    customerPhone: '010-7777-8888',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    duration: 120,
    summary: 'T멤버십 등급 및 포인트 사용 방법 안내',
  },
  {
    id: '6',
    customerName: '한미영',
    customerPhone: '010-2222-3333',
    status: 'completed',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    duration: 210,
    summary: '청구서 요금 이의제기, 데이터 사용량 확인',
  },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}분 ${secs}초`;
}

export function HistoryList() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = mockHistory.filter(
    (item) =>
      item.customerName.includes(searchTerm) ||
      item.summary.includes(searchTerm)
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base">상담 이력</CardTitle>
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="고객명 또는 상담 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredHistory.map((item) => (
                <Link
                  key={item.id}
                  href={`/history/${item.id}`}
                  className="block"
                >
                  <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <User className="w-3 h-3" />
                            {item.customerName}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Phone className="w-3 h-3" />
                            {item.customerPhone.replace(
                              /(\d{3})-?(\d{4})-?(\d{4})/,
                              '$1-****-$3'
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm mt-2 text-foreground line-clamp-1">
                          {item.summary}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(item.startedAt, 'MM/dd HH:mm', { locale: ko })}
                          </span>
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
