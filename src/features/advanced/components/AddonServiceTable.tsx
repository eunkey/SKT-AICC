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
import { Calculator, Search } from 'lucide-react';
import { ExtendedAddonService } from '../types';

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
  // ── 통화 & 메시지 ──
  {
    id: 'addon-smart-callkeeper',
    name: '스마트 콜키퍼',
    category: '통화',
    description: 'AI 기반 통화 연결 강화',
    benefit: '부재중 알림, 통화가능통보',
    price: '990원/월',
    isFree: false,
  },
  {
    id: 'addon-callkeeper',
    name: '콜키퍼',
    category: '통화',
    description: '부재중 전화 자동 문자 알림',
    benefit: '놓친 전화 확인',
    price: '550원/월',
    isFree: false,
  },
  {
    id: 'addon-call-forward',
    name: '착신전환',
    category: '통화',
    description: '통화를 다른 번호로 자동 연결',
    benefit: '업무/개인 번호 분리',
    price: '990원/월',
    isFree: false,
  },
  {
    id: 'addon-perfect-call',
    name: '퍼펙트콜',
    category: '통화',
    description: '통화가능통보 + 콜키퍼 통합',
    benefit: '통화 편의 올인원',
    price: '990원/월',
    isFree: false,
  },
  {
    id: 'addon-v-coloring',
    name: 'V 컬러링',
    category: '통화',
    description: '통화 연결 시 영상 노출',
    benefit: '영상 컬러링',
    price: '3,300원/월',
    isFree: false,
  },
  // ── 콘텐츠 & 미디어 ──
  {
    id: 'addon-flo-data',
    name: 'FLO 앤 데이터',
    category: '콘텐츠',
    description: 'FLO 음악 스트리밍 + 데이터',
    benefit: '5천만곡 무제한 스트리밍',
    price: '7,900원/월',
    isFree: false,
  },
  {
    id: 'addon-wavve-data',
    name: 'Wavve 앤 데이터',
    category: '콘텐츠',
    description: 'wavve 영상 스트리밍 + 데이터',
    benefit: 'TV/영화 무제한 시청',
    price: '9,900원/월',
    isFree: false,
  },
  {
    id: 'addon-onestory-data',
    name: '원스토리 앤 데이터',
    category: '콘텐츠',
    description: '전자책/웹툰/웹소설 + 데이터',
    benefit: '콘텐츠 무제한 이용',
    price: '6,500원/월',
    isFree: false,
  },
  // ── 데이터 관리 ──
  {
    id: 'addon-lte-safety',
    name: 'LTE 안심옵션',
    category: '데이터',
    description: '데이터 소진 후 저속 지속 이용',
    benefit: '데이터 차단 방지',
    price: '5,500원/월',
    isFree: false,
  },
  {
    id: 'addon-data-charge-4gb',
    name: '데이터 충전 4GB',
    category: '데이터',
    description: '추가 데이터 충전 (1회/월)',
    benefit: '4GB 추가',
    price: '3,000원/월',
    isFree: false,
  },
  {
    id: 'addon-safe-data-100',
    name: '안심데이터 100',
    category: '데이터',
    description: '추가 데이터 소진 시 차단',
    benefit: '요금 폭탄 방지',
    price: '11,000원/월',
    isFree: false,
  },
  {
    id: 'addon-safe-data-150',
    name: '안심데이터 150',
    category: '데이터',
    description: '추가 데이터 소진 시 차단',
    benefit: '요금 폭탄 방지',
    price: '16,500원/월',
    isFree: false,
  },
  // ── 인증 & 보안 ──
  {
    id: 'addon-smart-safe-pay',
    name: '스마트안전결제',
    category: '보안',
    description: '악성코드/사기성 실행 탐지 알림',
    benefit: '결제 사기 방지',
    price: '990원/월',
    isFree: false,
  },
  {
    id: 'addon-phone-lost',
    name: '휴대폰 분실보호',
    category: '보안',
    description: '분실 시 원격 제어·복구 지원',
    benefit: '원격 잠금, 위치 추적',
    price: '2,200원/월',
    isFree: false,
  },
  {
    id: 'addon-motion-key',
    name: '모션키',
    category: '보안',
    description: '모션 기반 간편 인증',
    benefit: '비밀번호 없이 인증',
    price: '1,100원/월',
    isFree: false,
  },
  {
    id: 'addon-pay-password',
    name: '휴대폰결제 비밀번호',
    category: '보안',
    description: '결제 안정성 기능',
    benefit: '결제 시 비밀번호 확인',
    price: '무료',
    isFree: true,
  },
  // ── 단말기 보험 ──
  {
    id: 'addon-t-allcare-6',
    name: 'T 올케어+6',
    category: '보험',
    description: '고급 단말기 종합 보험',
    benefit: '분실/파손 보상, 프리미엄 서비스',
    price: '8,500원/월',
    isFree: false,
  },
  {
    id: 'addon-insurance-iphone',
    name: '분실파손6 i일반',
    category: '보험',
    description: '아이폰 분실/파손 보험',
    benefit: '분실·파손 보상',
    price: '5,400원/월',
    isFree: false,
  },
  {
    id: 'addon-insurance-damage',
    name: '파손6 i파손',
    category: '보험',
    description: '아이폰 파손 전용 보험',
    benefit: '파손 보상',
    price: '4,100원/월',
    isFree: false,
  },
  {
    id: 'addon-insurance-fold',
    name: '분실파손6 폴드',
    category: '보험',
    description: '갤럭시 Z 폴드용 보험',
    benefit: '분실·파손 보상',
    price: '11,900원/월',
    isFree: false,
  },
  {
    id: 'addon-insurance-flip',
    name: '분실파손6 플립',
    category: '보험',
    description: '갤럭시 Z 플립용 보험',
    benefit: '분실·파손 보상',
    price: '8,900원/월',
    isFree: false,
  },
];

interface AddonServiceTableProps {
  selectedServices?: string[];
  onSelect?: (serviceId: string) => void;
  extendedAddons?: ExtendedAddonService[];
  onAnalyze?: (addon: ExtendedAddonService) => void;
}

export function AddonServiceTable({
  selectedServices = [],
  onSelect,
  extendedAddons,
  onAnalyze,
}: AddonServiceTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedServices));
  const [searchQuery, setSearchQuery] = useState('');

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

  // 확장된 부가서비스 데이터가 있으면 사용
  const baseAddons = extendedAddons || ADDON_SERVICES;
  const addonsToShow = useMemo(() => {
    if (!searchQuery.trim()) return baseAddons;
    const q = searchQuery.toLowerCase();
    return baseAddons.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.benefit.toLowerCase().includes(q) ||
        a.price.toLowerCase().includes(q)
    );
  }, [baseAddons, searchQuery]);

  const handleAnalyze = (addonId: string) => {
    if (extendedAddons && onAnalyze) {
      const addon = extendedAddons.find(a => a.id === addonId);
      if (addon) {
        onAnalyze(addon);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="부가서비스 검색 (이름, 카테고리, 혜택)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
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
          {addonsToShow.map((service) => {
            const isSelected = selected.has(service.id);
            return (
              <TableRow
                key={service.id}
                className={isSelected ? 'bg-muted/50' : ''}
              >
                <TableCell className="font-medium text-xs whitespace-nowrap">{service.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] whitespace-nowrap">{service.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {service.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {service.benefit}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-xs whitespace-nowrap">
                  {service.isFree ? (
                    <Badge variant="default" className="bg-green-500">
                      {service.price}
                    </Badge>
                  ) : (
                    service.price
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isSelected && extendedAddons && onAnalyze && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(service.id)}
                        className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <Calculator className="w-3 h-3" />
                        해지 분석
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isSelected ? 'secondary' : 'default'}
                      onClick={() => handleSelect(service.id)}
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
    </div>
  );
}
