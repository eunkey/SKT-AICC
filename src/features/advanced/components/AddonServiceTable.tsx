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
  // 통화 서비스
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
    id: 'addon-t-phone',
    name: 'T전화',
    category: '통화',
    description: 'AI 통화비서, 스팸차단, 녹음',
    benefit: '통화 편의 기능 올인원',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-call-record',
    name: '통화녹음 프리미엄',
    category: '통화',
    description: '모든 통화 자동 녹음 및 클라우드 저장',
    benefit: '무제한 녹음, 텍스트 변환',
    price: '2,200원/월',
    isFree: false,
  },
  {
    id: 'addon-coloring',
    name: '컬러링',
    category: '통화',
    description: '통화 연결음을 원하는 음악으로',
    benefit: '최신 음악 설정 가능',
    price: '2,200원/월',
    isFree: false,
  },
  // 보안 서비스
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
    id: 'addon-safe-message',
    name: '안심문자',
    category: '보안',
    description: '스미싱/피싱 문자 차단',
    benefit: '악성 URL 자동 차단',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-mcafe',
    name: '모바일 백신',
    category: '보안',
    description: '스마트폰 악성코드 실시간 검사',
    benefit: '바이러스/악성앱 차단',
    price: '1,100원/월',
    isFree: false,
  },
  // 데이터 서비스
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
    id: 'addon-data-gift',
    name: '데이터 선물하기',
    category: '데이터',
    description: '내 데이터를 다른 사람에게 선물',
    benefit: '월 최대 5GB 선물 가능',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-speed-on',
    name: '속도 ON',
    category: '데이터',
    description: '데이터 소진 후 추가 속도 제공',
    benefit: '1GB당 1,100원 충전',
    price: '종량제',
    isFree: false,
  },
  // 앱/콘텐츠 서비스
  {
    id: 'addon-tmap',
    name: 'T map 프리미엄',
    category: '앱',
    description: 'T map 프리미엄 무료 이용',
    benefit: '실시간 교통정보, 주차정보',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-music',
    name: 'FLO 무제한',
    category: '앱',
    description: 'FLO 스트리밍 무료 이용',
    benefit: '5천만곡 무제한 스트리밍',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-wavve',
    name: 'wavve 프리미엄',
    category: '앱',
    description: 'wavve OTT 무료 이용',
    benefit: 'TV/영화 무제한 시청',
    price: '무료',
    isFree: true,
  },
  {
    id: 'addon-netflix',
    name: '넷플릭스 제휴',
    category: '앱',
    description: '넷플릭스 스탠다드 요금 할인',
    benefit: '월 4,400원 할인',
    price: '9,500원/월',
    isFree: false,
  },
  {
    id: 'addon-disney',
    name: '디즈니+ 제휴',
    category: '앱',
    description: '디즈니+ 요금 할인',
    benefit: '월 3,000원 할인',
    price: '6,900원/월',
    isFree: false,
  },
  {
    id: 'addon-youtube',
    name: '유튜브 프리미엄',
    category: '앱',
    description: '유튜브 프리미엄 제휴 할인',
    benefit: '광고 없는 유튜브',
    price: '10,450원/월',
    isFree: false,
  },
  // 보험/케어 서비스
  {
    id: 'addon-insurance',
    name: '휴대폰 보험',
    category: '보험',
    description: '분실/파손 보상',
    benefit: '최대 100만원 보상',
    price: '8,800원/월',
    isFree: false,
  },
  {
    id: 'addon-insurance-basic',
    name: '휴대폰 보험 베이직',
    category: '보험',
    description: '파손만 보상',
    benefit: '최대 50만원 보상',
    price: '4,400원/월',
    isFree: false,
  },
  {
    id: 'addon-care-plus',
    name: '케어플러스',
    category: '보험',
    description: '휴대폰 점검 및 수리 할인',
    benefit: '연 2회 무상 점검, 수리비 50% 할인',
    price: '5,500원/월',
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
