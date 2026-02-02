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
