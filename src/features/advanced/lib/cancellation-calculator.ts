import {
  CancellationAnalysis,
  CancellationTarget,
  CascadeEffect,
  ExtendedPlan,
  ExtendedAddonService,
  ExtendedDiscount,
  Recommendation,
  ShortTermAnalysis,
  MediumTermAnalysis,
  LongTermAnalysis,
} from '../types';
import {
  calculatePenalty,
  calculateCumulativeCost,
  calculateBreakEvenMonth,
} from './price-parser';

interface CalculationContext {
  plans: ExtendedPlan[];
  addons: ExtendedAddonService[];
  discounts: ExtendedDiscount[];
  selectedPlanId: string;
  selectedAddonIds: string[];
  selectedDiscountIds: string[];
}

/**
 * 요금제 해지 분석
 */
export function analyzePlanCancellation(
  plan: ExtendedPlan,
  context: CalculationContext
): CancellationAnalysis {
  const target: CancellationTarget = {
    type: 'plan',
    id: plan.id,
    name: plan.name,
    monthlyValue: plan.monthlyPrice,
  };

  // 즉시 비용 계산 (위약금)
  let immediateCost = 0;
  if (plan.penalty && plan.contract) {
    immediateCost = -calculatePenalty(
      plan.penalty.deviceSubsidy,
      plan.contract.type === '24month' ? 24 : 12,
      plan.contract.remainingMonths
    );
  }

  // 월 변화액 계산 (약정 할인 손실)
  let monthlyChange = 0;
  if (plan.contract) {
    monthlyChange = plan.contract.monthlyDiscount; // 할인 손실 = 양수 (비용 증가)
  }

  // 연쇄 효과 분석
  const cascadeEffects = analyzeCascadeEffects('plan', plan.id, context);
  const cascadeMonthlyImpact = cascadeEffects.reduce((sum, effect) => sum + effect.monthlyImpact, 0);
  monthlyChange += cascadeMonthlyImpact;

  // 단기 분석 (3개월)
  const shortTerm: ShortTermAnalysis = {
    immediateCost,
    monthlyChange,
    totalImpact: immediateCost + (monthlyChange * 3),
  };

  // 중기 분석 (12개월)
  const monthlySavings = plan.monthlyPrice; // 요금제 해지로 절약되는 금액
  const netMonthlyChange = monthlyChange - monthlySavings; // 실제 월 변화
  const cumulativeByMonth = calculateCumulativeCost(immediateCost, netMonthlyChange, 12);
  const breakEvenMonth = calculateBreakEvenMonth(immediateCost, -netMonthlyChange);

  const mediumTerm: MediumTermAnalysis = {
    breakEvenMonth,
    totalImpact: cumulativeByMonth[11] || immediateCost + (netMonthlyChange * 12),
    cumulativeByMonth,
  };

  // 장기 분석 (36개월)
  const projectedSavings = monthlySavings * 36;
  const totalPenaltyAndLoss = Math.abs(immediateCost) + (monthlyChange * 36);
  const lostBenefitsValue = calculateLostBenefitsValue(plan, context);

  const longTerm: LongTermAnalysis = {
    totalNetGain: projectedSavings - totalPenaltyAndLoss - lostBenefitsValue,
    lostBenefitsValue,
    projectedSavings,
  };

  // 추천 생성
  const recommendation = generateRecommendation(target, shortTerm, mediumTerm, longTerm, plan.contract);

  return {
    targetName: plan.name,
    targetType: 'plan',
    shortTerm,
    mediumTerm,
    longTerm,
    cascadeEffects,
    recommendation,
  };
}

/**
 * 부가서비스 해지 분석
 */
export function analyzeAddonCancellation(
  addon: ExtendedAddonService,
  context: CalculationContext
): CancellationAnalysis {
  const target: CancellationTarget = {
    type: 'addon',
    id: addon.id,
    name: addon.name,
    monthlyValue: addon.monthlyPrice,
  };

  // 부가서비스는 보통 즉시 비용 없음
  const immediateCost = 0;

  // 월 절약액 (무료 서비스면 0)
  const monthlySavings = addon.monthlyPrice;

  // 연쇄 효과 분석
  const cascadeEffects = analyzeCascadeEffects('addon', addon.id, context);
  const cascadeMonthlyImpact = cascadeEffects.reduce((sum, effect) => sum + effect.monthlyImpact, 0);

  const monthlyChange = -monthlySavings + cascadeMonthlyImpact;

  // 단기 분석 (3개월)
  const shortTerm: ShortTermAnalysis = {
    immediateCost,
    monthlyChange,
    totalImpact: immediateCost + (monthlyChange * 3),
  };

  // 중기 분석 (12개월)
  const cumulativeByMonth = calculateCumulativeCost(immediateCost, monthlyChange, 12);
  const breakEvenMonth = monthlyChange < 0 ? 0 : null;

  const mediumTerm: MediumTermAnalysis = {
    breakEvenMonth,
    totalImpact: cumulativeByMonth[11] || monthlyChange * 12,
    cumulativeByMonth,
  };

  // 장기 분석 (36개월)
  const projectedSavings = monthlySavings * 36;
  const lostBenefitsValue = addon.linkedBenefits?.length ? monthlySavings * 6 : 0; // 연계 혜택 가치

  const longTerm: LongTermAnalysis = {
    totalNetGain: projectedSavings - (cascadeMonthlyImpact * 36) - lostBenefitsValue,
    lostBenefitsValue,
    projectedSavings,
  };

  // 추천 생성
  const recommendation = generateAddonRecommendation(target, shortTerm, addon);

  return {
    targetName: addon.name,
    targetType: 'addon',
    shortTerm,
    mediumTerm,
    longTerm,
    cascadeEffects,
    recommendation,
  };
}

/**
 * 할인 해지 분석
 */
export function analyzeDiscountCancellation(
  discount: ExtendedDiscount,
  context: CalculationContext
): CancellationAnalysis {
  const target: CancellationTarget = {
    type: 'discount',
    id: discount.id,
    name: discount.name,
    monthlyValue: discount.monthlyDiscount,
  };

  // 할인 해지 = 할인 혜택 손실 (비용 증가)
  const monthlyChange = discount.monthlyDiscount;

  // 가족 결합의 경우 영향받는 가족 수 고려
  const affectedMembers = discount.affectedMembers || 1;
  const totalMonthlyImpact = monthlyChange * affectedMembers;

  // 연쇄 효과 분석
  const cascadeEffects = analyzeCascadeEffects('discount', discount.id, context);
  const cascadeMonthlyImpact = cascadeEffects.reduce((sum, effect) => sum + effect.monthlyImpact, 0);

  const totalMonthlyChange = totalMonthlyImpact + cascadeMonthlyImpact;

  // 단기 분석 (3개월)
  const shortTerm: ShortTermAnalysis = {
    immediateCost: 0,
    monthlyChange: totalMonthlyChange,
    totalImpact: totalMonthlyChange * 3,
  };

  // 중기 분석 (12개월)
  const cumulativeByMonth = calculateCumulativeCost(0, totalMonthlyChange, 12);

  const mediumTerm: MediumTermAnalysis = {
    breakEvenMonth: null, // 할인 해지는 보통 손익분기점 없음
    totalImpact: totalMonthlyChange * 12,
    cumulativeByMonth,
  };

  // 장기 분석 (36개월)
  const lostBenefitsValue = calculateDiscountLostBenefits(discount, context);

  const longTerm: LongTermAnalysis = {
    totalNetGain: -(totalMonthlyChange * 36) - lostBenefitsValue,
    lostBenefitsValue,
    projectedSavings: 0,
  };

  // 추천 생성
  const recommendation = generateDiscountRecommendation(discount, cascadeEffects);

  return {
    targetName: discount.name,
    targetType: 'discount',
    shortTerm,
    mediumTerm,
    longTerm,
    cascadeEffects,
    recommendation,
  };
}

/**
 * 연쇄 효과 분석
 */
function analyzeCascadeEffects(
  targetType: 'plan' | 'addon' | 'discount',
  targetId: string,
  context: CalculationContext
): CascadeEffect[] {
  const effects: CascadeEffect[] = [];

  // 요금제 해지 시 연쇄 효과
  if (targetType === 'plan') {
    // 결합 할인 손실
    context.discounts
      .filter(d => context.selectedDiscountIds.includes(d.id))
      .forEach(discount => {
        if (discount.type === '결합 할인') {
          effects.push({
            affectedService: discount.name,
            effectType: 'discount_loss',
            description: `${discount.name} 할인 혜택 종료`,
            monthlyImpact: discount.monthlyDiscount,
            affectedMembers: discount.affectedMembers,
          });
        }
      });

    // 무료 부가서비스 종료
    context.addons
      .filter(a => context.selectedAddonIds.includes(a.id) && a.isFree)
      .forEach(addon => {
        if (addon.linkedBenefits?.includes(targetId)) {
          effects.push({
            affectedService: addon.name,
            effectType: 'benefit_loss',
            description: `${addon.name} 무료 혜택 종료`,
            monthlyImpact: 0, // 무료였으므로 직접 비용 없음
          });
        }
      });
  }

  // 가족 결합 할인 해지 시 연쇄 효과
  if (targetType === 'discount') {
    const discount = context.discounts.find(d => d.id === targetId);
    if (discount?.type === '결합 할인' && discount.id.includes('family')) {
      // 가족 결합 해지 시 다른 가족 회선에도 영향
      const affectedMembers = discount.affectedMembers || 1;
      if (affectedMembers > 1) {
        effects.push({
          affectedService: '가족 회선',
          effectType: 'discount_loss',
          description: `가족 ${affectedMembers - 1}명의 할인 혜택도 함께 종료`,
          monthlyImpact: discount.monthlyDiscount * (affectedMembers - 1),
          affectedMembers: affectedMembers - 1,
        });
      }
    }

    // 트리플 결합 해지 시 인터넷/TV 요금 영향
    if (discount?.id === 'discount-triple') {
      effects.push({
        affectedService: '인터넷 요금',
        effectType: 'price_increase',
        description: '인터넷 결합 할인 종료',
        monthlyImpact: 11000,
      });
      effects.push({
        affectedService: 'TV 요금',
        effectType: 'price_increase',
        description: 'TV 결합 할인 종료',
        monthlyImpact: 7700,
      });
    }
  }

  return effects;
}

/**
 * 잃는 혜택 가치 계산
 */
function calculateLostBenefitsValue(
  plan: ExtendedPlan,
  context: CalculationContext
): number {
  let value = 0;

  // 무료 부가서비스 가치
  context.addons
    .filter(a => context.selectedAddonIds.includes(a.id) && a.isFree)
    .forEach(addon => {
      // 무료 서비스의 시장 가치 추정
      if (addon.id.includes('music') || addon.id.includes('flo')) {
        value += 10900 * 12; // FLO 연간 가치
      }
      if (addon.id.includes('wavve')) {
        value += 13900 * 12; // wavve 연간 가치
      }
    });

  return value;
}

/**
 * 할인 잃는 혜택 가치 계산
 */
function calculateDiscountLostBenefits(
  discount: ExtendedDiscount,
  context: CalculationContext
): number {
  // 결합 할인의 경우 연계 서비스 가치 추가
  if (discount.linkedServices?.length) {
    return discount.linkedServices.length * 5000 * 12; // 연계 서비스당 연 60,000원 가치
  }
  return 0;
}

/**
 * 요금제 해지 추천 생성
 */
function generateRecommendation(
  target: CancellationTarget,
  shortTerm: ShortTermAnalysis,
  mediumTerm: MediumTermAnalysis,
  longTerm: LongTermAnalysis,
  contract: ExtendedPlan['contract']
): Recommendation {
  // 약정이 있고 위약금이 큰 경우
  if (shortTerm.immediateCost < -100000) {
    if (contract && contract.remainingMonths <= 6) {
      return {
        type: 'wait',
        reason: '위약금이 크지만 약정 만료가 가까워 대기 권장',
        suggestedAction: '약정 만료 후 해지 진행',
        waitMonths: contract.remainingMonths,
      };
    }
    return {
      type: 'wait',
      reason: '위약금 부담이 커서 해지 비추천',
      suggestedAction: '약정 만료까지 대기 권장',
      waitMonths: contract?.remainingMonths,
    };
  }

  // 손익분기점이 12개월 이내인 경우
  if (mediumTerm.breakEvenMonth && mediumTerm.breakEvenMonth <= 12) {
    return {
      type: 'proceed',
      reason: `${mediumTerm.breakEvenMonth}개월 후 손익분기점 도달 가능`,
      suggestedAction: '해지 진행 권장',
    };
  }

  // 장기적으로 이득인 경우
  if (longTerm.totalNetGain > 0) {
    return {
      type: 'proceed',
      reason: '장기적으로 비용 절감 효과',
      suggestedAction: '해지 진행 권장',
    };
  }

  // 대안 제시
  return {
    type: 'alternative',
    reason: '현재 해지 시 손해가 예상됨',
    suggestedAction: '요금제 다운그레이드 검토 권장',
  };
}

/**
 * 부가서비스 해지 추천 생성
 */
function generateAddonRecommendation(
  target: CancellationTarget,
  shortTerm: ShortTermAnalysis,
  addon: ExtendedAddonService
): Recommendation {
  // 무료 서비스는 해지 불필요
  if (addon.isFree) {
    return {
      type: 'wait',
      reason: '무료 서비스로 해지 시 혜택만 손실',
      suggestedAction: '유지 권장',
    };
  }

  // 유료 서비스는 사용 빈도에 따라 결정
  if (shortTerm.totalImpact < 0) {
    return {
      type: 'proceed',
      reason: '즉시 비용 절감 가능',
      suggestedAction: '사용하지 않는다면 해지 권장',
    };
  }

  return {
    type: 'alternative',
    reason: '유사 서비스로 대체 가능',
    suggestedAction: '더 저렴한 대안 검토',
  };
}

/**
 * 할인 해지 추천 생성
 */
function generateDiscountRecommendation(
  discount: ExtendedDiscount,
  cascadeEffects: CascadeEffect[]
): Recommendation {
  const totalCascadeImpact = cascadeEffects.reduce((sum, e) => sum + e.monthlyImpact, 0);
  const totalMonthlyImpact = discount.monthlyDiscount + totalCascadeImpact;

  // 연쇄 효과가 큰 경우
  if (totalCascadeImpact > discount.monthlyDiscount) {
    return {
      type: 'wait',
      reason: '연쇄 효과로 인한 추가 손실이 큼',
      suggestedAction: '가족/결합 서비스 유지 권장',
    };
  }

  // 월 영향이 큰 경우
  if (totalMonthlyImpact > 30000) {
    return {
      type: 'alternative',
      reason: '월 비용 증가폭이 큼',
      suggestedAction: '다른 할인 프로그램 검토',
    };
  }

  return {
    type: 'proceed',
    reason: '해지 시 특별한 손실 없음',
    suggestedAction: '필요에 따라 해지 가능',
  };
}

/**
 * 통합 분석 함수
 */
export function analyzeCancel(
  targetType: 'plan' | 'addon' | 'discount',
  targetId: string,
  context: CalculationContext
): CancellationAnalysis | null {
  switch (targetType) {
    case 'plan': {
      const plan = context.plans.find(p => p.id === targetId);
      if (!plan) return null;
      return analyzePlanCancellation(plan, context);
    }
    case 'addon': {
      const addon = context.addons.find(a => a.id === targetId);
      if (!addon) return null;
      return analyzeAddonCancellation(addon, context);
    }
    case 'discount': {
      const discount = context.discounts.find(d => d.id === targetId);
      if (!discount) return null;
      return analyzeDiscountCancellation(discount, context);
    }
    default:
      return null;
  }
}
