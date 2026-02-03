'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';

interface RoamingPlan {
  id: string;
  name: string;
  category: string;
  coverage: string;
  data: string;
  voice: string;
  sms: string;
  validity: string;
  price: string;
  features: string;
}

const ROAMING_PLANS: RoamingPlan[] = [
  // ── T 로밍 baro 요금제 ──
  {
    id: 'baro-3gb',
    name: 'baro 3GB',
    category: 'baro',
    coverage: '전세계 70여 개국',
    data: '3GB',
    voice: '30분',
    sms: '30건',
    validity: '사용일 기준',
    price: '33,000원',
    features: '단기 출장/여행',
  },
  {
    id: 'baro-6gb',
    name: 'baro 6GB',
    category: 'baro',
    coverage: '전세계 70여 개국',
    data: '6GB',
    voice: '60분',
    sms: '30건',
    validity: '사용일 기준',
    price: '55,000원',
    features: '중기 여행',
  },
  {
    id: 'baro-12gb',
    name: 'baro 12GB',
    category: 'baro',
    coverage: '전세계 70여 개국',
    data: '12GB',
    voice: '120분',
    sms: '50건',
    validity: '사용일 기준',
    price: '77,000원',
    features: '장기 여행/출장',
  },
  {
    id: 'baro-24gb',
    name: 'baro 24GB',
    category: 'baro',
    coverage: '전세계 70여 개국',
    data: '24GB',
    voice: '240분',
    sms: '100건',
    validity: '사용일 기준',
    price: '110,000원',
    features: '장기 체류',
  },
  // ── T 로밍 OnePass ──
  {
    id: 'onepass-500',
    name: 'OnePass 500',
    category: 'OnePass',
    coverage: '전세계 70여 개국',
    data: '500MB/일',
    voice: '사용량 차감',
    sms: '사용량 차감',
    validity: '일 단위 자동 적용',
    price: '9,900원/일',
    features: '가벼운 일일 사용',
  },
  {
    id: 'onepass-data-vip',
    name: 'OnePass Data VIP',
    category: 'OnePass',
    coverage: '전세계 70여 개국',
    data: '무제한/일',
    voice: '사용량 차감',
    sms: '사용량 차감',
    validity: '일 단위 자동 적용',
    price: '14,900원/일',
    features: '데이터 무제한',
  },
  {
    id: 'onepass-vip',
    name: 'OnePass VIP',
    category: 'OnePass',
    coverage: '전세계 70여 개국',
    data: '무제한/일',
    voice: '무제한/일',
    sms: '무제한/일',
    validity: '일 단위 자동 적용',
    price: '19,800원/일',
    features: '올인원 무제한',
  },
  // ── T 로밍 eSIM ──
  {
    id: 'esim-1gb',
    name: 'eSIM 1GB',
    category: 'eSIM',
    coverage: '주요 50여 개국',
    data: '1GB',
    voice: '미포함',
    sms: '미포함',
    validity: '30일',
    price: '11,000원',
    features: '데이터 전용, 듀얼심',
  },
  {
    id: 'esim-3gb',
    name: 'eSIM 3GB',
    category: 'eSIM',
    coverage: '주요 50여 개국',
    data: '3GB',
    voice: '미포함',
    sms: '미포함',
    validity: '30일',
    price: '22,000원',
    features: '데이터 전용, 듀얼심',
  },
  {
    id: 'esim-5gb',
    name: 'eSIM 5GB',
    category: 'eSIM',
    coverage: '주요 50여 개국',
    data: '5GB',
    voice: '미포함',
    sms: '미포함',
    validity: '30일',
    price: '33,000원',
    features: '데이터 전용, 듀얼심',
  },
  {
    id: 'esim-10gb',
    name: 'eSIM 10GB',
    category: 'eSIM',
    coverage: '주요 50여 개국',
    data: '10GB',
    voice: '미포함',
    sms: '미포함',
    validity: '30일',
    price: '44,000원',
    features: '데이터 전용, 듀얼심',
  },
  {
    id: 'esim-unlimited',
    name: 'eSIM 무제한',
    category: 'eSIM',
    coverage: '주요 50여 개국',
    data: '무제한',
    voice: '미포함',
    sms: '미포함',
    validity: '30일',
    price: '55,000원',
    features: '데이터 전용, 듀얼심',
  },
];

interface RoamingTableProps {
  selectedRoaming?: string[];
  onSelect?: (roamingId: string) => void;
}

export function RoamingTable({ selectedRoaming = [], onSelect }: RoamingTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedRoaming));
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return ROAMING_PLANS;
    const q = searchQuery.toLowerCase();
    return ROAMING_PLANS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.price.includes(q) ||
        p.data.toLowerCase().includes(q) ||
        p.features.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="로밍 검색 (상품명, 유형, 데이터)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">상품명</TableHead>
            <TableHead className="whitespace-nowrap">유형</TableHead>
            <TableHead className="whitespace-nowrap">커버리지</TableHead>
            <TableHead className="whitespace-nowrap">데이터</TableHead>
            <TableHead className="whitespace-nowrap">음성/SMS</TableHead>
            <TableHead className="whitespace-nowrap">유효기간</TableHead>
            <TableHead className="whitespace-nowrap">요금</TableHead>
            <TableHead className="whitespace-nowrap">특징</TableHead>
            <TableHead className="text-right whitespace-nowrap">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlans.map((plan) => {
            const isSelected = selected.has(plan.id);
            return (
              <TableRow
                key={plan.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium text-xs whitespace-nowrap">{plan.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={plan.category === 'baro' ? 'default' : 'secondary'}
                    className="text-[10px] whitespace-nowrap"
                  >
                    {plan.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {plan.coverage}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">{plan.data}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {plan.voice} / {plan.sms}
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">{plan.validity}</TableCell>
                <TableCell className="font-semibold text-xs whitespace-nowrap">{plan.price}</TableCell>
                <TableCell>
                  <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {plan.features}
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
    </div>
  );
}
