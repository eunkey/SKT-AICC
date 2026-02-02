// 확장된 요금제 타입
export interface ExtendedPlan {
  id: string;
  name: string;
  type: '5G' | 'LTE';
  data: string;
  voice: string;
  message: string;
  price: string;
  monthlyPrice: number;
  features: string[];
  contract: {
    type: '12month' | '24month' | 'none';
    remainingMonths: number;
    monthlyDiscount: number;
  } | null;
  penalty: {
    deviceSubsidy: number;
    remainingSubsidy: number;
  } | null;
}

// 확장된 부가서비스 타입
export interface ExtendedAddonService {
  id: string;
  name: string;
  category: string;
  description: string;
  benefit: string;
  price: string;
  monthlyPrice: number;
  isFree: boolean;
  linkedBenefits?: string[];
}

// 확장된 할인 타입
export interface ExtendedDiscount {
  id: string;
  name: string;
  type: string;
  condition: string;
  benefit: string;
  discountAmount: string;
  monthlyDiscount: number;
  affectedMembers?: number;
  linkedServices?: string[];
}

// 해지 대상 타입
export type CancellationTargetType = 'plan' | 'addon' | 'discount';

export interface CancellationTarget {
  type: CancellationTargetType;
  id: string;
  name: string;
  monthlyValue: number;
}

// 연쇄 효과 타입
export interface CascadeEffect {
  affectedService: string;
  effectType: 'discount_loss' | 'service_termination' | 'price_increase' | 'benefit_loss';
  description: string;
  monthlyImpact: number;
  affectedMembers?: number;
}

// 기간별 분석 결과 타입
export interface ShortTermAnalysis {
  immediateCost: number;
  monthlyChange: number;
  totalImpact: number;
}

export interface MediumTermAnalysis {
  breakEvenMonth: number | null;
  totalImpact: number;
  cumulativeByMonth: number[];
}

export interface LongTermAnalysis {
  totalNetGain: number;
  lostBenefitsValue: number;
  projectedSavings: number;
}

// 추천 결과 타입
export type RecommendationType = 'proceed' | 'wait' | 'alternative';

export interface Recommendation {
  type: RecommendationType;
  reason: string;
  suggestedAction?: string;
  waitMonths?: number;
}

// 전체 분석 결과 타입
export interface CancellationAnalysis {
  targetName: string;
  targetType: CancellationTargetType;
  shortTerm: ShortTermAnalysis;
  mediumTerm: MediumTermAnalysis;
  longTerm: LongTermAnalysis;
  cascadeEffects: CascadeEffect[];
  recommendation: Recommendation;
}

// 데모 고객 정보 타입
export interface DemoCustomerInfo {
  name: string;
  phone: string;
  gender: '남' | '여';
  age: number;
  location: string;
}

// 데모 시나리오 타입
export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  customerName: string;
  customerInfo: DemoCustomerInfo;
  plans: ExtendedPlan[];
  addons: ExtendedAddonService[];
  discounts: ExtendedDiscount[];
  selectedPlanId: string;
  selectedAddonIds: string[];
  selectedDiscountIds: string[];
}
