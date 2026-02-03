import {
  DemoScenario,
  ExtendedPlan,
  ExtendedAddonService,
  ExtendedDiscount,
} from '../types';

// 시나리오 1: 프리미엄 약정 해지 (손해 케이스)
const scenario1Plans: ExtendedPlan[] = [
  {
    id: '5g-premium',
    name: '5G 프리미엄',
    type: '5G',
    data: '무제한',
    voice: '무제한',
    message: '무제한',
    price: '89,000원',
    monthlyPrice: 89000,
    features: ['5G 최고 속도', '데이터 무제한', '영상/음악 무제한'],
    contract: {
      type: '24month',
      remainingMonths: 14,
      monthlyDiscount: 22250, // 25% 할인
    },
    penalty: {
      deviceSubsidy: 500000, // 공시지원금 50만원
      remainingSubsidy: 291667, // 14개월 남음 기준
    },
  },
  {
    id: '5g-standard',
    name: '5G 스탠다드',
    type: '5G',
    data: '100GB',
    voice: '무제한',
    message: '무제한',
    price: '69,000원',
    monthlyPrice: 69000,
    features: ['5G 고속', '데이터 100GB', '영상/음악 제공'],
    contract: null,
    penalty: null,
  },
];

const scenario1Addons: ExtendedAddonService[] = [
  {
    id: 'addon-music',
    name: 'FLO 무제한',
    category: '앱',
    description: 'FLO 스트리밍 무료 이용',
    benefit: '5천만곡 무제한 스트리밍',
    price: '무료',
    monthlyPrice: 0,
    isFree: true,
    linkedBenefits: ['5g-premium'],
  },
  {
    id: 'addon-wavve',
    name: 'wavve 프리미엄',
    category: '앱',
    description: 'wavve OTT 무료 이용',
    benefit: 'TV/영화 무제한 시청',
    price: '무료',
    monthlyPrice: 0,
    isFree: true,
    linkedBenefits: ['5g-premium'],
  },
];

const scenario1Discounts: ExtendedDiscount[] = [
  {
    id: 'discount-contract-24',
    name: '24개월 약정',
    type: '약정 할인',
    condition: '24개월 약정',
    benefit: '월 요금 25% 할인',
    discountAmount: '22,250원/월',
    monthlyDiscount: 22250,
  },
  {
    id: 'discount-auto-pay',
    name: '자동이체 할인',
    type: '납부 할인',
    condition: '자동이체 등록',
    benefit: '월 1,100원 할인',
    discountAmount: '1,100원/월',
    monthlyDiscount: 1100,
  },
];

// 시나리오 2: OTT 부가서비스 정리 (이득 케이스)
const scenario2Plans: ExtendedPlan[] = [
  {
    id: '5g-slim',
    name: '5G 슬림',
    type: '5G',
    data: '12GB',
    voice: '무제한',
    message: '무제한',
    price: '49,000원',
    monthlyPrice: 49000,
    features: ['5G 기본', '데이터 12GB'],
    contract: null,
    penalty: null,
  },
];

const scenario2Addons: ExtendedAddonService[] = [
  {
    id: 'addon-netflix',
    name: '넷플릭스 제휴',
    category: '앱',
    description: '넷플릭스 스탠다드 요금 할인',
    benefit: '월 4,400원 할인',
    price: '9,500원/월',
    monthlyPrice: 9500,
    isFree: false,
  },
  {
    id: 'addon-disney',
    name: '디즈니+ 제휴',
    category: '앱',
    description: '디즈니+ 요금 할인',
    benefit: '월 3,000원 할인',
    price: '6,900원/월',
    monthlyPrice: 6900,
    isFree: false,
  },
  {
    id: 'addon-youtube',
    name: '유튜브 프리미엄',
    category: '앱',
    description: '유튜브 프리미엄 제휴 할인',
    benefit: '광고 없는 유튜브',
    price: '10,450원/월',
    monthlyPrice: 10450,
    isFree: false,
  },
  {
    id: 'addon-tmap',
    name: 'T map 프리미엄',
    category: '앱',
    description: 'T map 프리미엄 무료 이용',
    benefit: '실시간 교통정보, 주차정보',
    price: '무료',
    monthlyPrice: 0,
    isFree: true,
  },
];

const scenario2Discounts: ExtendedDiscount[] = [
  {
    id: 'discount-auto-pay',
    name: '자동이체 할인',
    type: '납부 할인',
    condition: '자동이체 등록',
    benefit: '월 1,100원 할인',
    discountAmount: '1,100원/월',
    monthlyDiscount: 1100,
  },
  {
    id: 'discount-paperless',
    name: '전자 청구서',
    type: '납부 할인',
    condition: '전자 청구서 신청',
    benefit: '월 550원 할인',
    discountAmount: '550원/월',
    monthlyDiscount: 550,
  },
];

// 시나리오 3: 가족 결합 해지 (복잡한 연쇄 효과)
const scenario3Plans: ExtendedPlan[] = [
  {
    id: '5g-standard-plus',
    name: '5G 스탠다드 플러스',
    type: '5G',
    data: '150GB',
    voice: '무제한',
    message: '무제한',
    price: '79,000원',
    monthlyPrice: 79000,
    features: ['5G 고속', '데이터 150GB', 'FLO/wavve 무료'],
    contract: {
      type: '24month',
      remainingMonths: 8,
      monthlyDiscount: 19750, // 25% 할인
    },
    penalty: null,
  },
];

const scenario3Addons: ExtendedAddonService[] = [
  {
    id: 'addon-music',
    name: 'FLO 무제한',
    category: '앱',
    description: 'FLO 스트리밍 무료 이용',
    benefit: '5천만곡 무제한 스트리밍',
    price: '무료',
    monthlyPrice: 0,
    isFree: true,
    linkedBenefits: ['5g-standard-plus'],
  },
  {
    id: 'addon-family-share',
    name: '가족 데이터 쉐어링',
    category: '데이터',
    description: '가족 간 데이터 공유',
    benefit: '가족 데이터 효율 사용',
    price: '2,200원/월',
    monthlyPrice: 2200,
    isFree: false,
  },
];

const scenario3Discounts: ExtendedDiscount[] = [
  {
    id: 'discount-family-4',
    name: '가족 결합 4인',
    type: '결합 할인',
    condition: '가족 4인 이상',
    benefit: '1인당 11,000원 할인',
    discountAmount: '11,000원/월',
    monthlyDiscount: 11000,
    affectedMembers: 4,
    linkedServices: ['family-line-1', 'family-line-2', 'family-line-3'],
  },
  {
    id: 'discount-triple',
    name: '트리플 결합',
    type: '결합 할인',
    condition: '인터넷 + TV + 모바일',
    benefit: '최대 25% 추가 할인',
    discountAmount: '25,000원/월',
    monthlyDiscount: 25000,
    linkedServices: ['internet', 'tv'],
  },
  {
    id: 'discount-internet',
    name: '인터넷 결합',
    type: '결합 할인',
    condition: 'SK브로드밴드 인터넷 결합',
    benefit: '월 11,000원 할인',
    discountAmount: '11,000원/월',
    monthlyDiscount: 11000,
  },
  {
    id: 'discount-tv',
    name: 'TV 결합',
    type: '결합 할인',
    condition: 'B tv 결합',
    benefit: '월 7,700원 할인',
    discountAmount: '7,700원/월',
    monthlyDiscount: 7700,
  },
  {
    id: 'discount-contract-24',
    name: '24개월 약정',
    type: '약정 할인',
    condition: '24개월 약정',
    benefit: '월 요금 25% 할인',
    discountAmount: '19,750원/월',
    monthlyDiscount: 19750,
  },
];

// 시나리오 4: 주소 검증 및 변경 (도로명주소 자동 검증)
const scenario4Plans: ExtendedPlan[] = [
  {
    id: '5gx-standard',
    name: '5GX 스탠다드',
    type: '5G',
    data: '150GB',
    voice: '무제한',
    message: '무제한',
    price: '89,000원',
    monthlyPrice: 89000,
    features: ['5G 고속', '데이터 150GB', 'T멤버십 플래티넘'],
    contract: null,
    penalty: null,
  },
];

const scenario4Addons: ExtendedAddonService[] = [
  {
    id: 'addon-auto-pay',
    name: '자동이체 할인',
    category: '할인',
    description: '신용카드/은행 자동이체',
    benefit: '월 1,100원 할인',
    price: '무료',
    monthlyPrice: 0,
    isFree: true,
  },
];

const scenario4Discounts: ExtendedDiscount[] = [
  {
    id: 'discount-auto-pay',
    name: '자동이체 할인',
    type: '납부 할인',
    condition: '자동이체 등록',
    benefit: '월 1,100원 할인',
    discountAmount: '1,100원/월',
    monthlyDiscount: 1100,
  },
];

// 시나리오 5: 복합 상담 (요금제 변경 + 로밍 + 부가서비스)
const scenario5Plans: ExtendedPlan[] = [
  {
    id: '0-youth-59',
    name: '0 청년 59',
    type: '5G',
    data: '무제한 (일 2GB 후 3Mbps)',
    voice: '무제한',
    message: '무제한',
    price: '59,000원',
    monthlyPrice: 59000,
    features: ['5G 기본', '데이터 무제한', '만 34세 이하 전용'],
    contract: null,
    penalty: null,
  },
  {
    id: '5g-premium-current',
    name: '5G 프라임',
    type: '5G',
    data: '무제한',
    voice: '무제한',
    message: '무제한',
    price: '89,000원',
    monthlyPrice: 89000,
    features: ['5G 최고 속도', '데이터 완전 무제한', 'FLO/wavve 무료'],
    contract: null,
    penalty: null,
  },
];

const scenario5Addons: ExtendedAddonService[] = [
  {
    id: 'addon-baro-roaming',
    name: 'baro 로밍 6GB',
    category: '로밍',
    description: '일본 7일 로밍 데이터',
    benefit: '6GB 데이터 + 긴급통화',
    price: '33,000원',
    monthlyPrice: 0,
    isFree: false,
  },
  {
    id: 'addon-colorring',
    name: '컬러링',
    category: '엔터테인먼트',
    description: '통화 연결음 설정',
    benefit: '내가 선택한 음악으로 연결음',
    price: '2,200원/월',
    monthlyPrice: 2200,
    isFree: false,
  },
  {
    id: 'addon-data-coupon',
    name: '데이터 쿠폰 1GB',
    category: '데이터',
    description: '추가 데이터 쿠폰',
    benefit: '1GB 추가 데이터',
    price: '1,100원',
    monthlyPrice: 0,
    isFree: false,
  },
];

const scenario5Discounts: ExtendedDiscount[] = [
  {
    id: 'discount-auto-pay',
    name: '자동이체 할인',
    type: '납부 할인',
    condition: '자동이체 등록',
    benefit: '월 1,100원 할인',
    discountAmount: '1,100원/월',
    monthlyDiscount: 1100,
  },
  {
    id: 'discount-paperless',
    name: '전자 청구서',
    type: '납부 할인',
    condition: '전자 청구서 신청',
    benefit: '월 550원 할인',
    discountAmount: '550원/월',
    monthlyDiscount: 550,
  },
];

// 전체 시나리오 목록
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'premium-cancel',
    name: '프리미엄 약정 해지',
    description: '5G 프리미엄 89,000원 + 24개월 약정 (14개월 남음) + 공시지원금 50만원',
    customerName: '김민수',
    customerInfo: {
      name: '김민수',
      phone: '010-9876-5432',
      gender: '남',
      age: 34,
      location: '서울특별시 강남구',
    },
    plans: scenario1Plans,
    addons: scenario1Addons,
    discounts: scenario1Discounts,
    selectedPlanId: '5g-premium',
    selectedAddonIds: ['addon-music', 'addon-wavve'],
    selectedDiscountIds: ['discount-contract-24', 'discount-auto-pay'],
  },
  {
    id: 'ott-cancel',
    name: 'OTT 부가서비스 정리',
    description: '넷플릭스 + 디즈니+ + 유튜브 = 월 26,850원 (무약정)',
    customerName: '이영희',
    customerInfo: {
      name: '이영희',
      phone: '010-5555-1234',
      gender: '여',
      age: 28,
      location: '경기도 성남시 분당구',
    },
    plans: scenario2Plans,
    addons: scenario2Addons,
    discounts: scenario2Discounts,
    selectedPlanId: '5g-slim',
    selectedAddonIds: ['addon-netflix', 'addon-disney', 'addon-youtube', 'addon-tmap'],
    selectedDiscountIds: ['discount-auto-pay', 'discount-paperless'],
  },
  {
    id: 'family-cancel',
    name: '가족 결합 해지',
    description: '4인 가족 결합 + 인터넷 + TV 트리플 (연쇄 효과 발생)',
    customerName: '박철수',
    customerInfo: {
      name: '박철수',
      phone: '010-7777-8888',
      gender: '남',
      age: 49,
      location: '서울특별시 서초구',
    },
    plans: scenario3Plans,
    addons: scenario3Addons,
    discounts: scenario3Discounts,
    selectedPlanId: '5g-standard-plus',
    selectedAddonIds: ['addon-music', 'addon-family-share'],
    selectedDiscountIds: ['discount-family-4', 'discount-triple', 'discount-internet', 'discount-tv', 'discount-contract-24'],
  },
  {
    id: 'address-verification',
    name: '주소 검증 및 변경',
    description: '이사 후 청구지 주소 변경 + 도로명주소 자동 검증 (서울시 강남구 테헤란로)',
    customerName: '박서준',
    customerInfo: {
      name: '박서준',
      phone: '010-3333-9999',
      gender: '남',
      age: 32,
      location: '서울특별시 마포구',
    },
    plans: scenario4Plans,
    addons: scenario4Addons,
    discounts: scenario4Discounts,
    selectedPlanId: '5gx-standard',
    selectedAddonIds: ['addon-auto-pay'],
    selectedDiscountIds: ['discount-auto-pay'],
  },
  {
    id: 'multi-topic',
    name: '복합 상담 (다중 토픽)',
    description: '요금제 변경 + 일본 로밍 + 부가서비스 해지 (SMS 토픽 선택 테스트용)',
    customerName: '정하늘',
    customerInfo: {
      name: '정하늘',
      phone: '010-1234-5678',
      gender: '여',
      age: 29,
      location: '서울특별시 송파구',
    },
    plans: scenario5Plans,
    addons: scenario5Addons,
    discounts: scenario5Discounts,
    selectedPlanId: '5g-premium-current',
    selectedAddonIds: ['addon-colorring'],
    selectedDiscountIds: ['discount-auto-pay', 'discount-paperless'],
  },
];

export function getScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find(s => s.id === id);
}
