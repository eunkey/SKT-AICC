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
import { Calculator } from 'lucide-react';
import { ExtendedPlan } from '../types';

interface Plan {
  id: string;
  name: string;
  type: '5GX' | '0청년' | '베이직' | '시니어' | '청소년' | '어린이';
  data: string;
  voice: string;
  message: string;
  price: string;
  features: string[];
}

const PLANS: Plan[] = [
  // ── 5GX 플랜 ──
  {
    id: '5gx-platinum',
    name: '5GX 플래티넘',
    type: '5GX',
    data: '무제한 (테더링 120GB)',
    voice: '무제한',
    message: '무제한',
    price: '125,000원',
    features: ['최고급 콘텐츠', '멤버십 혜택', '테더링 120GB'],
  },
  {
    id: '5gx-premium',
    name: '5GX 프리미엄',
    type: '5GX',
    data: '무제한 (100GB)',
    voice: '무제한',
    message: '무제한',
    price: '109,000원',
    features: ['넷플릭스/콘텐츠 옵션', '데이터 무제한'],
  },
  {
    id: '5gx-prime-plus',
    name: '5GX 프라임플러스',
    type: '5GX',
    data: '무제한 (80GB)',
    voice: '무제한',
    message: '무제한',
    price: '99,000원',
    features: ['콘텐츠 선택형', '데이터 무제한'],
  },
  {
    id: '5gx-prime',
    name: '5GX 프라임',
    type: '5GX',
    data: '무제한 (60GB)',
    voice: '무제한',
    message: '무제한',
    price: '89,000원',
    features: ['기본 5G 혜택', '데이터 무제한'],
  },
  // ── 0 청년 (만 34세 이하) ──
  {
    id: 'young-109',
    name: '0 청년 109',
    type: '0청년',
    data: '120GB',
    voice: '무제한',
    message: '무제한',
    price: '109,000원',
    features: ['만 34세 이하', '청년 전용 콘텐츠 혜택'],
  },
  {
    id: 'young-89',
    name: '0 청년 89',
    type: '0청년',
    data: '80GB',
    voice: '무제한',
    message: '무제한',
    price: '89,000원',
    features: ['만 34세 이하', '데이터 중심'],
  },
  {
    id: 'young-79',
    name: '0 청년 79',
    type: '0청년',
    data: '300GB + 5Mbps',
    voice: '무제한',
    message: '무제한',
    price: '79,000원',
    features: ['만 34세 이하', '데이터 중심', '소진 후 5Mbps'],
  },
  {
    id: 'young-69',
    name: '0 청년 69',
    type: '0청년',
    data: '160GB + 5Mbps',
    voice: '무제한',
    message: '무제한',
    price: '69,000원',
    features: ['만 34세 이하', '소진 후 5Mbps'],
  },
  {
    id: 'young-59',
    name: '0 청년 59',
    type: '0청년',
    data: '36GB + 1Mbps',
    voice: '무제한',
    message: '무제한',
    price: '59,000원',
    features: ['만 34세 이하', '라이트 사용자'],
  },
  {
    id: 'young-49',
    name: '0 청년 49',
    type: '0청년',
    data: '15GB',
    voice: '무제한',
    message: '무제한',
    price: '49,000원',
    features: ['만 34세 이하', '기본형'],
  },
  {
    id: 'young-43',
    name: '0 청년 43',
    type: '0청년',
    data: '8GB',
    voice: '무제한',
    message: '무제한',
    price: '43,000원',
    features: ['만 34세 이하'],
  },
  {
    id: 'young-37',
    name: '0 청년 37',
    type: '0청년',
    data: '6GB',
    voice: '무제한',
    message: '무제한',
    price: '37,000원',
    features: ['만 34세 이하'],
  },
  // ── 베이직 / 컴팩트 ──
  {
    id: 'basic-plus-75',
    name: '베이직플러스 75GB업',
    type: '베이직',
    data: '99GB + 1Mbps',
    voice: '무제한',
    message: '무제한',
    price: '68,000원',
    features: ['데이터 확장', '소진 후 1Mbps'],
  },
  {
    id: 'basic-plus',
    name: '베이직플러스',
    type: '베이직',
    data: '24GB + 1Mbps',
    voice: '무제한',
    message: '무제한',
    price: '59,000원',
    features: ['기본형', '소진 후 1Mbps'],
  },
  {
    id: 'slim',
    name: '슬림',
    type: '베이직',
    data: '15GB + 1Mbps',
    voice: '무제한',
    message: '무제한',
    price: '55,000원',
    features: ['소진 후 1Mbps'],
  },
  {
    id: 'basic',
    name: '베이직',
    type: '베이직',
    data: '11GB',
    voice: '무제한',
    message: '무제한',
    price: '49,000원',
    features: ['부담 낮은 기본형'],
  },
  {
    id: 'compact-plus',
    name: '컴팩트플러스',
    type: '베이직',
    data: '8GB + 400Kbps',
    voice: '무제한',
    message: '무제한',
    price: '45,000원',
    features: ['저용량형', '소진 후 400Kbps'],
  },
  {
    id: 'compact',
    name: '컴팩트',
    type: '베이직',
    data: '6GB + 400Kbps',
    voice: '무제한',
    message: '무제한',
    price: '39,000원',
    features: ['저용량형', '소진 후 400Kbps'],
  },
  // ── 시니어 (65세 이상) ──
  {
    id: 'senior-a',
    name: '시니어 A',
    type: '시니어',
    data: '10GB',
    voice: '무제한',
    message: '무제한',
    price: '45,000원',
    features: ['65세 이상', '안심케어'],
  },
  {
    id: 'senior-b',
    name: '시니어 B',
    type: '시니어',
    data: '9GB',
    voice: '무제한',
    message: '무제한',
    price: '44,000원',
    features: ['65세 이상'],
  },
  {
    id: 'senior-c',
    name: '시니어 C',
    type: '시니어',
    data: '8GB',
    voice: '무제한',
    message: '무제한',
    price: '42,000원',
    features: ['65세 이상', '경제형'],
  },
  // ── 청소년 ──
  {
    id: 'teen-5g',
    name: '0틴 5G',
    type: '청소년',
    data: '9GB',
    voice: '무제한',
    message: '무제한',
    price: '45,000원',
    features: ['청소년 전용', '유해차단'],
  },
  // ── 어린이 (ZEM) ──
  {
    id: 'zem-best',
    name: '5G ZEM 플랜 베스트',
    type: '어린이',
    data: '3GB',
    voice: '무제한',
    message: '무제한',
    price: '26,000원',
    features: ['어린이 전용', '위치확인'],
  },
  {
    id: 'zem-perfect',
    name: '5G ZEM 플랜 퍼펙트',
    type: '어린이',
    data: '6GB',
    voice: '무제한',
    message: '무제한',
    price: '36,000원',
    features: ['어린이 전용', '위치확인', '학습앱'],
  },
];

interface PlanTableProps {
  currentPlanId?: string;
  onSelect?: (planId: string) => void;
  extendedPlans?: ExtendedPlan[];
  onAnalyze?: (plan: ExtendedPlan) => void;
}

export function PlanTable({ currentPlanId, onSelect, extendedPlans, onAnalyze }: PlanTableProps) {
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

  // 확장된 요금제 데이터가 있으면 사용, 없으면 기본 데이터 사용
  const plansToShow = extendedPlans || PLANS;

  const handleAnalyze = (planId: string) => {
    if (extendedPlans && onAnalyze) {
      const plan = extendedPlans.find(p => p.id === planId);
      if (plan) {
        onAnalyze(plan);
      }
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">요금제명</TableHead>
            <TableHead className="whitespace-nowrap">유형</TableHead>
            <TableHead className="whitespace-nowrap">데이터</TableHead>
            <TableHead className="whitespace-nowrap">음성/문자</TableHead>
            <TableHead className="whitespace-nowrap">월 요금</TableHead>
            <TableHead className="whitespace-nowrap">특징</TableHead>
            <TableHead className="text-right whitespace-nowrap">선택</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plansToShow.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TableRow
                key={plan.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium text-xs whitespace-nowrap">{plan.name}</TableCell>
                <TableCell>
                  <Badge variant={plan.type === '5GX' ? 'default' : 'secondary'} className="text-[10px] whitespace-nowrap">
                    {plan.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap">{plan.data}</TableCell>
                <TableCell className="text-xs whitespace-nowrap">
                  {plan.voice} / {plan.message}
                </TableCell>
                <TableCell className="font-semibold text-xs whitespace-nowrap">{plan.price}</TableCell>
                <TableCell>
                  <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {plan.features.join(', ')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isSelected && extendedPlans && onAnalyze && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(plan.id)}
                        className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <Calculator className="w-3 h-3" />
                        해지 분석
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isSelected ? 'secondary' : 'default'}
                      onClick={() => handleSelect(plan.id)}
                      className={isSelected ? 'bg-gray-400 hover:bg-gray-500' : ''}
                    >
                      {isSelected ? '사용 중' : '선택'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
