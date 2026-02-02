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

interface RoamingPlan {
  id: string;
  name: string;
  region: string;
  countries: string;
  data: string;
  validity: string;
  price: string;
  autoConnect: boolean;
}

const ROAMING_PLANS: RoamingPlan[] = [
  {
    id: 'roaming-asia-unlimited',
    name: '아시아 무제한 로밍',
    region: '아시아',
    countries: '일본, 중국, 태국, 베트남 등 20개국',
    data: '무제한',
    validity: '24시간',
    price: '9,900원/일',
    autoConnect: true,
  },
  {
    id: 'roaming-asia-basic',
    name: '아시아 베이직 로밍',
    region: '아시아',
    countries: '일본, 중국, 태국, 베트남 등 20개국',
    data: '500MB',
    validity: '24시간',
    price: '5,500원/일',
    autoConnect: true,
  },
  {
    id: 'roaming-europe-unlimited',
    name: '유럽 무제한 로밍',
    region: '유럽',
    countries: '영국, 프랑스, 독일, 이탈리아 등 30개국',
    data: '무제한',
    validity: '24시간',
    price: '11,900원/일',
    autoConnect: true,
  },
  {
    id: 'roaming-americas',
    name: '미주 로밍',
    region: '미주',
    countries: '미국, 캐나다, 멕시코',
    data: '1GB',
    validity: '24시간',
    price: '12,900원/일',
    autoConnect: true,
  },
  {
    id: 'roaming-global',
    name: '글로벌 무제한 로밍',
    region: '전세계',
    countries: '전세계 120개국',
    data: '무제한',
    validity: '7일',
    price: '89,000원/주',
    autoConnect: true,
  },
  {
    id: 'roaming-baro',
    name: 'T 바로로밍',
    region: '전세계',
    countries: '전세계 대부분 국가',
    data: '건별 과금',
    validity: '사용시',
    price: '2.5원/KB',
    autoConnect: false,
  },
];

interface RoamingTableProps {
  selectedRoaming?: string[];
  onSelect?: (roamingId: string) => void;
}

export function RoamingTable({ selectedRoaming = [], onSelect }: RoamingTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedRoaming));

  const handleSelect = (roamingId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(roamingId)) {
      newSelected.delete(roamingId);
    } else {
      newSelected.add(roamingId);
    }
    setSelected(newSelected);
    onSelect?.(roamingId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>로밍 상품명</TableHead>
            <TableHead>지역</TableHead>
            <TableHead>제공 국가</TableHead>
            <TableHead>데이터</TableHead>
            <TableHead>유효기간</TableHead>
            <TableHead>요금</TableHead>
            <TableHead>자동연결</TableHead>
            <TableHead className="text-right">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROAMING_PLANS.map((plan) => {
            const isSelected = selected.has(plan.id);
            return (
              <TableRow
                key={plan.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{plan.region}</Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-xs text-muted-foreground truncate">
                    {plan.countries}
                  </div>
                </TableCell>
                <TableCell>{plan.data}</TableCell>
                <TableCell>{plan.validity}</TableCell>
                <TableCell className="font-semibold">{plan.price}</TableCell>
                <TableCell>
                  {plan.autoConnect ? (
                    <Badge variant="default" className="bg-green-500">
                      자동
                    </Badge>
                  ) : (
                    <Badge variant="secondary">수동</Badge>
                  )}
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
