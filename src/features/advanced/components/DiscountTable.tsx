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

interface Discount {
  id: string;
  name: string;
  type: string;
  condition: string;
  benefit: string;
  discountAmount: string;
}

const DISCOUNTS: Discount[] = [
  {
    id: 'discount-contract-24',
    name: '24개월 약정',
    type: '약정 할인',
    condition: '24개월 약정',
    benefit: '월 요금 25% 할인',
    discountAmount: '최대 22,250원/월',
  },
  {
    id: 'discount-contract-12',
    name: '12개월 약정',
    type: '약정 할인',
    condition: '12개월 약정',
    benefit: '월 요금 12% 할인',
    discountAmount: '최대 10,680원/월',
  },
  {
    id: 'discount-family-2',
    name: '가족 결합 2인',
    type: '결합 할인',
    condition: '가족 2인 이상',
    benefit: '1인당 5,500원 할인',
    discountAmount: '5,500원/월',
  },
  {
    id: 'discount-family-3',
    name: '가족 결합 3인',
    type: '결합 할인',
    condition: '가족 3인 이상',
    benefit: '1인당 8,800원 할인',
    discountAmount: '8,800원/월',
  },
  {
    id: 'discount-internet',
    name: '인터넷 결합',
    type: '결합 할인',
    condition: 'T 인터넷 결합',
    benefit: '월 11,000원 할인',
    discountAmount: '11,000원/월',
  },
  {
    id: 'discount-tv',
    name: 'TV 결합',
    type: '결합 할인',
    condition: 'B tv 결합',
    benefit: '월 7,700원 할인',
    discountAmount: '7,700원/월',
  },
  {
    id: 'discount-auto-pay',
    name: '자동이체 할인',
    type: '납부 할인',
    condition: '자동이체 등록',
    benefit: '월 1,100원 할인',
    discountAmount: '1,100원/월',
  },
  {
    id: 'discount-paperless',
    name: '전자 청구서',
    type: '납부 할인',
    condition: '전자 청구서 신청',
    benefit: '월 550원 할인',
    discountAmount: '550원/월',
  },
];

interface DiscountTableProps {
  selectedDiscounts?: string[];
  onSelect?: (discountId: string) => void;
}

export function DiscountTable({
  selectedDiscounts = [],
  onSelect,
}: DiscountTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedDiscounts));

  const handleSelect = (discountId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(discountId)) {
      newSelected.delete(discountId);
    } else {
      newSelected.add(discountId);
    }
    setSelected(newSelected);
    onSelect?.(discountId);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>할인명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>조건</TableHead>
            <TableHead>혜택</TableHead>
            <TableHead>할인 금액</TableHead>
            <TableHead className="text-right">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DISCOUNTS.map((discount) => {
            const isSelected = selected.has(discount.id);
            return (
              <TableRow
                key={discount.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium">{discount.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{discount.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {discount.condition}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {discount.benefit}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-green-600">
                  -{discount.discountAmount}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={isSelected ? 'secondary' : 'default'}
                    onClick={() => handleSelect(discount.id)}
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
