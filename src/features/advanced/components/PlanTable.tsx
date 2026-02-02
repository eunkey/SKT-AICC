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

interface Plan {
  id: string;
  name: string;
  type: '5G' | 'LTE';
  data: string;
  voice: string;
  message: string;
  price: string;
  features: string[];
}

const PLANS: Plan[] = [
  // 5G 요금제
  {
    id: '5g-premium-plus',
    name: '5G 프리미엄 플러스',
    type: '5G',
    data: '무제한',
    voice: '무제한',
    message: '무제한',
    price: '105,000원',
    features: ['5G 최고속도', '테더링 무제한', 'OTT 4종 무료'],
  },
  {
    id: '5g-premium',
    name: '5G 프리미엄',
    type: '5G',
    data: '무제한',
    voice: '무제한',
    message: '무제한',
    price: '89,000원',
    features: ['5G 최고 속도', '데이터 무제한', '영상/음악 무제한'],
  },
  {
    id: '5g-standard-plus',
    name: '5G 스탠다드 플러스',
    type: '5G',
    data: '150GB',
    voice: '무제한',
    message: '무제한',
    price: '79,000원',
    features: ['5G 고속', '데이터 150GB', 'FLO/wavve 무료'],
  },
  {
    id: '5g-standard',
    name: '5G 스탠다드',
    type: '5G',
    data: '100GB',
    voice: '무제한',
    message: '무제한',
    price: '69,000원',
    features: ['5G 고속', '데이터 100GB', '영상/음악 제공'],
  },
  {
    id: '5g-slim-plus',
    name: '5G 슬림 플러스',
    type: '5G',
    data: '36GB',
    voice: '무제한',
    message: '무제한',
    price: '59,000원',
    features: ['5G 기본', '데이터 36GB', 'T map 무료'],
  },
  {
    id: '5g-slim',
    name: '5G 슬림',
    type: '5G',
    data: '12GB',
    voice: '무제한',
    message: '무제한',
    price: '49,000원',
    features: ['5G 기본', '데이터 12GB'],
  },
  {
    id: '5g-light',
    name: '5G 라이트',
    type: '5G',
    data: '6GB',
    voice: '무제한',
    message: '무제한',
    price: '39,000원',
    features: ['5G 입문', '데이터 6GB'],
  },
  // LTE 요금제
  {
    id: 'lte-premium',
    name: 'LTE 프리미엄',
    type: 'LTE',
    data: '무제한',
    voice: '무제한',
    message: '무제한',
    price: '69,000원',
    features: ['LTE 최고 속도', '데이터 무제한'],
  },
  {
    id: 'lte-standard',
    name: 'LTE 스탠다드',
    type: 'LTE',
    data: '50GB',
    voice: '무제한',
    message: '무제한',
    price: '49,000원',
    features: ['LTE 고속', '데이터 50GB'],
  },
  {
    id: 'lte-basic',
    name: 'LTE 베이직',
    type: 'LTE',
    data: '8GB',
    voice: '무제한',
    message: '무제한',
    price: '35,000원',
    features: ['LTE 기본', '데이터 8GB'],
  },
  {
    id: 'lte-simple',
    name: 'LTE 심플',
    type: 'LTE',
    data: '3GB',
    voice: '무제한',
    message: '무제한',
    price: '29,000원',
    features: ['LTE 경제형', '데이터 3GB'],
  },
  {
    id: 'lte-tiny',
    name: 'LTE 타이니',
    type: 'LTE',
    data: '1.5GB',
    voice: '100분',
    message: '100건',
    price: '22,000원',
    features: ['LTE 알뜰', '음성 100분'],
  },
  // 시니어/청소년 요금제
  {
    id: 'senior-safe',
    name: '시니어 안심',
    type: 'LTE',
    data: '2GB',
    voice: '무제한',
    message: '무제한',
    price: '33,000원',
    features: ['65세 이상', '안심케어 서비스', '큰글씨 UI'],
  },
  {
    id: 'youth-dream',
    name: '청소년 드림',
    type: '5G',
    data: '16GB',
    voice: '무제한',
    message: '무제한',
    price: '44,000원',
    features: ['만 19세 이하', '교육앱 무료', '유해차단'],
  },
  {
    id: 'kids-phone',
    name: '키즈폰 요금제',
    type: 'LTE',
    data: '1GB',
    voice: '무제한',
    message: '무제한',
    price: '19,800원',
    features: ['만 12세 이하', '위치확인', '유해차단'],
  },
];

interface PlanTableProps {
  currentPlanId?: string;
  onSelect?: (planId: string) => void;
}

export function PlanTable({ currentPlanId, onSelect }: PlanTableProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(currentPlanId || null);

  const handleSelect = (planId: string) => {
    if (selectedPlan === planId) {
      setSelectedPlan(null);
      onSelect?.(planId);
    } else {
      setSelectedPlan(planId);
      onSelect?.(planId);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>요금제명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>데이터</TableHead>
            <TableHead>음성/문자</TableHead>
            <TableHead>월 요금</TableHead>
            <TableHead>특징</TableHead>
            <TableHead className="text-right">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TableRow
                key={plan.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  <Badge variant={plan.type === '5G' ? 'default' : 'secondary'}>
                    {plan.type}
                  </Badge>
                </TableCell>
                <TableCell>{plan.data}</TableCell>
                <TableCell>
                  {plan.voice} / {plan.message}
                </TableCell>
                <TableCell className="font-semibold">{plan.price}</TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {plan.features.join(', ')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={isSelected ? 'secondary' : 'default'}
                    onClick={() => handleSelect(plan.id)}
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
