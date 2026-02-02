'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AddonService {
  id: string;
  name: string;
  category: string;
  description: string;
  benefit: string;
  price: string;
  isFree: boolean;
}

const ADDON_SERVICES: AddonService[] = [
  {
    id: 'addon-caller-id',
    name: '발신번호 표시',
    category: '통화',
    description: '전화 걸어온 상대방 번호 표시',
    benefit: '스팸/사기 전화 차단',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-call-waiting',
    name: '통화 대기',
    category: '통화',
    description: '통화 중 다른 전화 수신',
    benefit: '중요한 전화 놓치지 않기',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-voicemail',
    name: '음성사서함',
    category: '통화',
    description: '부재중 음성 메시지 저장',
    benefit: '부재중 메시지 확인',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-spam-block',
    name: '스팸차단 프리미엄',
    category: '보안',
    description: 'AI 기반 스팸/사기 전화 자동 차단',
    benefit: '스팸 전화 100% 차단',
    price: '3,300원/월',
    isFree: false,
  },
  {
    id: 'addon-data-rollover',
    name: '데이터 롤오버',
    category: '데이터',
    description: '남은 데이터 다음 달 이월',
    benefit: '데이터 손실 방지',
    price: '1,100원/월',
    isFree: false,
  },
  {
    id: 'addon-family-share',
    name: '가족 데이터 쉐어링',
    category: '데이터',
    description: '가족 간 데이터 공유',
    benefit: '가족 데이터 효율 사용',
    price: '2,200원/월',
    isFree: false,
  },
  {
    id: 'addon-tmap',
    name: 'T map 무료',
    category: '앱',
    description: 'T map 프리미엄 무료 이용',
    benefit: '실시간 교통정보, 주차정보',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-music',
    name: 'FLO 음악',
    category: '앱',
    description: 'FLO 스트리밍 무료 이용',
    benefit: '5천만곡 무제한 스트리밍',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-ott',
    name: 'OTT 멤버십',
    category: '앱',
    description: '넷플릭스/웨이브 할인',
    benefit: '월 30% 할인',
    price: '5,500원/월',
    isFree: false,
  },
  {
    id: 'addon-insurance',
    name: '휴대폰 보험',
    category: '보험',
    description: '분실/파손 보상',
    benefit: '최대 100만원 보상',
    price: '8,800원/월',
    isFree: false,
  },
];

interface AddonServiceTableProps {
  selectedServices?: string[];
  onSelect?: (serviceId: string) => void;
}

export function AddonServiceTable({
  selectedServices = [],
  onSelect,
}: AddonServiceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedServices));

  const handleSelect = (serviceId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelected(newSelected);
    onSelect?.(serviceId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>서비스명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>혜택</TableHead>
            <TableHead>요금</TableHead>
            <TableHead className="text-right">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ADDON_SERVICES.map((service) => {
            const isSelected = selected.has(service.id);
            return (
              <TableRow
                key={service.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{service.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {service.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {service.benefit}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {service.isFree ? (
                    <Badge variant="default" className="bg-green-500">
                      {service.price}
                    </Badge>
                  ) : (
                    service.price
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={isSelected ? 'secondary' : 'default'}
                    onClick={() => handleSelect(service.id)}
                    className={isSelected ? 'bg-gray-400 hover:bg-gray-500' : ''}
                  >
                    {isSelected ? '사용 중' : '선택'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
