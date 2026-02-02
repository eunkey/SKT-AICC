'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Sparkles, TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react';
import { useTranscriptStore } from '@/stores';

// ── 요금제 데이터 ──

interface Plan {
  id: string;
  name: string;
  type: '5G' | 'LTE';
  data: string;
  dataGB: number; // 비교용 GB 수치 (무제한=999)
  voice: string;
  message: string;
  price: number;
  priceLabel: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: '5g-premium',
    name: '5G 프리미엄',
    type: '5G',
    data: '무제한',
    dataGB: 999,
    voice: '무제한',
    message: '무제한',
    price: 89000,
    priceLabel: '89,000원',
    features: ['5G 최고 속도', '데이터 무제한', '영상/음악 무제한'],
  },
  {
    id: '5g-standard',
    name: '5G 스탠다드',
    type: '5G',
    data: '100GB',
    dataGB: 100,
    voice: '무제한',
    message: '무제한',
    price: 69000,
    priceLabel: '69,000원',
    features: ['5G 고속', '데이터 100GB', '영상/음악 제공'],
  },
  {
    id: '5g-slim',
    name: '5G 슬림',
    type: '5G',
    data: '12GB',
    dataGB: 12,
    voice: '무제한',
    message: '무제한',
    price: 49000,
    priceLabel: '49,000원',
    features: ['5G 기본', '데이터 12GB'],
  },
  {
    id: 'lte-premium',
    name: 'LTE 프리미엄',
    type: 'LTE',
    data: '무제한',
    dataGB: 999,
    voice: '무제한',
    message: '무제한',
    price: 69000,
    priceLabel: '69,000원',
    features: ['LTE 최고 속도', '데이터 무제한'],
  },
  {
    id: 'lte-standard',
    name: 'LTE 스탠다드',
    type: 'LTE',
    data: '50GB',
    dataGB: 50,
    voice: '무제한',
    message: '무제한',
    price: 49000,
    priceLabel: '49,000원',
    features: ['LTE 고속', '데이터 50GB'],
  },
  {
    id: 'lte-basic',
    name: 'LTE 베이직',
    type: 'LTE',
    data: '8GB',
    dataGB: 8,
    voice: '무제한',
    message: '무제한',
    price: 35000,
    priceLabel: '35,000원',
    features: ['LTE 기본', '데이터 8GB'],
  },
];

// ── 부가서비스 데이터 ──

interface AddonService {
  id: string;
  name: string;
  category: string;
  price: number;
  priceLabel: string;
  isFree: boolean;
}

const ADDON_SERVICES: AddonService[] = [
  { id: 'addon-caller-id', name: '발신번호 표시', category: '통화', price: 0, priceLabel: '무료', isFree: true },
  { id: 'addon-call-waiting', name: '통화 대기', category: '통화', price: 0, priceLabel: '무료', isFree: true },
  { id: 'addon-voicemail', name: '음성사서함', category: '통화', price: 0, priceLabel: '무료', isFree: true },
  { id: 'addon-spam-block', name: '스팸차단 프리미엄', category: '보안', price: 3300, priceLabel: '3,300원', isFree: false },
  { id: 'addon-data-rollover', name: '데이터 롤오버', category: '데이터', price: 1100, priceLabel: '1,100원', isFree: false },
  { id: 'addon-family-share', name: '가족 데이터 쉐어링', category: '데이터', price: 2200, priceLabel: '2,200원', isFree: false },
  { id: 'addon-tmap', name: 'T map 무료', category: '앱', price: 0, priceLabel: '무료', isFree: true },
  { id: 'addon-music', name: 'FLO 음악', category: '앱', price: 0, priceLabel: '무료', isFree: true },
  { id: 'addon-ott', name: 'OTT 멤버십', category: '앱', price: 5500, priceLabel: '5,500원', isFree: false },
  { id: 'addon-insurance', name: '휴대폰 보험', category: '보험', price: 8800, priceLabel: '8,800원', isFree: false },
];

// ── 할인 데이터 ──

interface Discount {
  id: string;
  name: string;
  type: string;
  discountAmount: number;
  discountLabel: string;
  isPercentage: boolean;
  percentage: number;
}

const DISCOUNTS: Discount[] = [
  { id: 'discount-contract-24', name: '24개월 약정', type: '약정', discountAmount: 0, discountLabel: '25%', isPercentage: true, percentage: 25 },
  { id: 'discount-contract-12', name: '12개월 약정', type: '약정', discountAmount: 0, discountLabel: '12%', isPercentage: true, percentage: 12 },
  { id: 'discount-family-2', name: '가족결합 2인', type: '결합', discountAmount: 5500, discountLabel: '5,500원', isPercentage: false, percentage: 0 },
  { id: 'discount-family-3', name: '가족결합 3인', type: '결합', discountAmount: 8800, discountLabel: '8,800원', isPercentage: false, percentage: 0 },
  { id: 'discount-internet', name: '인터넷 결합', type: '결합', discountAmount: 11000, discountLabel: '11,000원', isPercentage: false, percentage: 0 },
  { id: 'discount-tv', name: 'TV 결합', type: '결합', discountAmount: 7700, discountLabel: '7,700원', isPercentage: false, percentage: 0 },
  { id: 'discount-auto-pay', name: '자동이체', type: '납부', discountAmount: 1100, discountLabel: '1,100원', isPercentage: false, percentage: 0 },
  { id: 'discount-paperless', name: '전자 청구서', type: '납부', discountAmount: 550, discountLabel: '550원', isPercentage: false, percentage: 0 },
];

const ADDON_CATEGORIES = ['통화', '보안', '데이터', '앱', '보험'] as const;
const DISCOUNT_TYPES = ['약정', '결합', '납부'] as const;

// ── 현재 고객 요금제 (하드코딩) ──

const CURRENT_PLAN_ID = '5g-premium';
const CURRENT_PLAN = PLANS.find((p) => p.id === CURRENT_PLAN_ID)!;

// ── 고객 사용 이력 데이터 ──

interface UsageMonth {
  month: string;
  dataUsedGB: number;
  callMinutes: number;
  messageSent: number;
}

interface PlanHistory {
  planName: string;
  period: string;
  durationMonths: number;
}

interface CustomerUsage {
  planHistory: PlanHistory[];
  recentUsage: UsageMonth[];
  avgDataGB: number;
  avgCallMinutes: number;
  maxDataGB: number;
  memberSince: string;
}

const CUSTOMER_USAGE: CustomerUsage = {
  memberSince: '2019년 3월',
  planHistory: [
    { planName: 'LTE 스탠다드', period: '2019.03 ~ 2021.05', durationMonths: 26 },
    { planName: 'LTE 프리미엄', period: '2021.06 ~ 2023.02', durationMonths: 21 },
    { planName: '5G 프리미엄', period: '2023.03 ~ 현재', durationMonths: 35 },
  ],
  recentUsage: [
    { month: '2025.07', dataUsedGB: 23.4, callMinutes: 187, messageSent: 42 },
    { month: '2025.08', dataUsedGB: 28.1, callMinutes: 203, messageSent: 38 },
    { month: '2025.09', dataUsedGB: 19.7, callMinutes: 156, messageSent: 51 },
    { month: '2025.10', dataUsedGB: 31.2, callMinutes: 178, messageSent: 45 },
    { month: '2025.11', dataUsedGB: 25.8, callMinutes: 192, messageSent: 37 },
    { month: '2025.12', dataUsedGB: 27.3, callMinutes: 165, messageSent: 44 },
  ],
  avgDataGB: 25.9,
  avgCallMinutes: 180,
  maxDataGB: 31.2,
};

// ── AI 추천 키워드 매칭 ──

interface AIRecommendationResult {
  plans: Plan[];
  reason: string;
}

function getAIRecommendations(transcript: string): AIRecommendationResult {
  const text = transcript.toLowerCase();
  const { avgDataGB, maxDataGB, avgCallMinutes } = CUSTOMER_USAGE;

  // 실 사용량 기반 적정 데이터 산정 (최대 사용량 + 20% 여유)
  const recommendedDataGB = Math.ceil(maxDataGB * 1.2);

  // 대화에서 키워드 감지
  const needsMoreData = ['데이터 부족', '데이터가 부족', '데이터 많이', '데이터가 모자', '데이터 다 써', '데이터 더'].some((kw) => text.includes(kw));
  const wantsCheaper = ['비싸', '저렴', '싸게', '할인', '절약', '요금이 높', '요금 낮', '부담'].some((kw) => text.includes(kw));
  const wants5G = ['5g', '5지', '속도 빠른', '속도가 빠', '빠른 속도'].some((kw) => text.includes(kw));
  const wantsLTE = ['lte', 'LTE', '엘티이'].some((kw) => text.includes(kw));

  // 1) 요금이 비싸다 → 사용량 기준으로 데이터 충분한 요금제 중 저렴한 것
  if (wantsCheaper) {
    const suitable = PLANS
      .filter((p) => p.dataGB >= recommendedDataGB && p.price < CURRENT_PLAN.price)
      .sort((a, b) => a.price - b.price);
    if (suitable.length > 0) {
      return {
        plans: suitable.slice(0, 3),
        reason: `월 평균 ${avgDataGB}GB 사용 (최대 ${maxDataGB}GB) 기준, 데이터 충분하면서 더 저렴한 요금제`,
      };
    }
    return {
      plans: PLANS.filter((p) => p.price < CURRENT_PLAN.price).sort((a, b) => a.price - b.price).slice(0, 3),
      reason: `요금 절감 요청 — 현재 요금(${CURRENT_PLAN.priceLabel})보다 저렴한 요금제`,
    };
  }

  // 2) 데이터 부족 → 현재보다 데이터 많은 요금제
  if (needsMoreData) {
    const morePlans = PLANS
      .filter((p) => p.dataGB > (CURRENT_PLAN.dataGB === 999 ? avgDataGB : CURRENT_PLAN.dataGB))
      .sort((a, b) => a.dataGB - b.dataGB);
    return {
      plans: morePlans.slice(0, 3),
      reason: `월 평균 ${avgDataGB}GB 사용 중 — 데이터 여유 있는 요금제`,
    };
  }

  // 3) 5G/LTE 선호
  if (wants5G) {
    const plans = PLANS.filter((p) => p.type === '5G' && p.dataGB >= recommendedDataGB).slice(0, 3);
    return {
      plans: plans.length > 0 ? plans : PLANS.filter((p) => p.type === '5G').slice(0, 3),
      reason: `5G 요금제 중 월 사용량(${avgDataGB}GB) 커버 가능한 요금제`,
    };
  }
  if (wantsLTE) {
    const plans = PLANS.filter((p) => p.type === 'LTE' && p.dataGB >= recommendedDataGB).slice(0, 3);
    return {
      plans: plans.length > 0 ? plans : PLANS.filter((p) => p.type === 'LTE').slice(0, 3),
      reason: `LTE 요금제 중 월 사용량(${avgDataGB}GB) 커버 가능한 요금제`,
    };
  }

  // 4) 키워드 없음 → 사용 패턴 기반 최적 요금제 추천
  //    실 사용량 대비 과금 요금제인지 분석
  const optimal = PLANS
    .filter((p) => p.dataGB >= recommendedDataGB)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  if (optimal.length > 0 && optimal[0].price < CURRENT_PLAN.price) {
    return {
      plans: optimal,
      reason: `6개월 평균 ${avgDataGB}GB 사용 (최대 ${maxDataGB}GB) — 현재 요금제(${CURRENT_PLAN.name}) 대비 데이터 충분하면서 절약 가능한 요금제`,
    };
  }

  return {
    plans: PLANS.filter((p) => p.id !== CURRENT_PLAN_ID).slice(0, 3),
    reason: `월 평균 ${avgDataGB}GB / 통화 ${avgCallMinutes}분 사용 패턴 기반 대안 요금제`,
  };
}

// ── 금액 포맷 ──

function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

// ── 컴포넌트 ──

export function PlanCalculator() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [selectedDiscounts, setSelectedDiscounts] = useState<Set<string>>(new Set());
  const [aiResult, setAiResult] = useState<AIRecommendationResult | null>(null);

  const { getFullText } = useTranscriptStore();

  // 검색 필터링
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return PLANS;
    const q = searchQuery.toLowerCase();
    return PLANS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.priceLabel.includes(q) ||
        p.data.includes(q)
    );
  }, [searchQuery]);

  // 표시할 요금제 목록 (AI 추천 또는 검색 결과)
  const displayPlans = aiResult?.plans || filteredPlans;

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);

  // AI 추천 실행
  const handleAIRecommend = () => {
    const transcript = getFullText();
    const result = getAIRecommendations(transcript);
    setAiResult(result);
    setSearchQuery('');
  };

  // 검색 입력 시 AI 추천 초기화
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (aiResult) setAiResult(null);
  };

  // 부가서비스 토글
  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 할인 토글 (약정은 하나만 선택 가능)
  const toggleDiscount = (id: string) => {
    setSelectedDiscounts((prev) => {
      const next = new Set(prev);
      const discount = DISCOUNTS.find((d) => d.id === id)!;

      if (next.has(id)) {
        next.delete(id);
      } else {
        // 약정 할인은 하나만 선택 가능
        if (discount.type === '약정') {
          DISCOUNTS.filter((d) => d.type === '약정').forEach((d) => next.delete(d.id));
        }
        // 가족결합도 하나만 선택 가능
        if (discount.type === '결합' && (id === 'discount-family-2' || id === 'discount-family-3')) {
          next.delete('discount-family-2');
          next.delete('discount-family-3');
        }
        next.add(id);
      }
      return next;
    });
  };

  // ── 요금 계산 ──

  const calculation = useMemo(() => {
    const basePlanPrice = selectedPlan?.price ?? 0;

    const addonTotal = ADDON_SERVICES
      .filter((a) => selectedAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);

    let discountTotal = 0;
    selectedDiscounts.forEach((discountId) => {
      const d = DISCOUNTS.find((dd) => dd.id === discountId);
      if (!d) return;
      if (d.isPercentage) {
        discountTotal += Math.floor(basePlanPrice * (d.percentage / 100));
      } else {
        discountTotal += d.discountAmount;
      }
    });

    const estimatedTotal = Math.max(0, basePlanPrice + addonTotal - discountTotal);
    const currentTotal = CURRENT_PLAN.price;
    const difference = estimatedTotal - currentTotal;

    return {
      basePlanPrice,
      addonTotal,
      discountTotal,
      estimatedTotal,
      currentTotal,
      difference,
    };
  }, [selectedPlan, selectedAddons, selectedDiscounts]);

  return (
    <div className="space-y-5">
      {/* ⓪ 고객 사용 이력 요약 */}
      <section className="rounded-lg border bg-muted/10 p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4" />
          고객 사용 이력
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="text-center p-2 rounded-md bg-background border">
            <div className="text-xs text-muted-foreground">가입 이후</div>
            <div className="text-sm font-bold mt-0.5">{CUSTOMER_USAGE.memberSince}~</div>
          </div>
          <div className="text-center p-2 rounded-md bg-background border">
            <div className="text-xs text-muted-foreground">월평균 데이터</div>
            <div className="text-sm font-bold mt-0.5">{CUSTOMER_USAGE.avgDataGB}GB</div>
          </div>
          <div className="text-center p-2 rounded-md bg-background border">
            <div className="text-xs text-muted-foreground">최대 데이터</div>
            <div className="text-sm font-bold mt-0.5">{CUSTOMER_USAGE.maxDataGB}GB</div>
          </div>
          <div className="text-center p-2 rounded-md bg-background border">
            <div className="text-xs text-muted-foreground">월평균 통화</div>
            <div className="text-sm font-bold mt-0.5">{CUSTOMER_USAGE.avgCallMinutes}분</div>
          </div>
        </div>

        {/* 최근 6개월 사용량 바 */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">최근 6개월 데이터 사용량</div>
          <div className="flex items-end gap-1.5 h-16">
            {CUSTOMER_USAGE.recentUsage.map((u) => {
              const heightPercent = Math.max(8, (u.dataUsedGB / CUSTOMER_USAGE.maxDataGB) * 100);
              return (
                <div key={u.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-muted-foreground">{u.dataUsedGB}GB</span>
                  <div
                    className="w-full rounded-sm bg-primary/70"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{u.month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 요금제 변경 이력 */}
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-muted-foreground mb-1.5">요금제 변경 이력</div>
          <div className="flex flex-wrap gap-1.5">
            {CUSTOMER_USAGE.planHistory.map((h, i) => (
              <Badge
                key={i}
                variant={i === CUSTOMER_USAGE.planHistory.length - 1 ? 'default' : 'outline'}
                className="text-[11px]"
              >
                {h.planName} ({h.period}) · {h.durationMonths}개월
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ① 요금제 선택 영역 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">요금제 선택</h3>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="요금제 검색 (이름, 유형, 가격)..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 shrink-0"
            onClick={handleAIRecommend}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 추천
          </Button>
        </div>

        {aiResult && (
          <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                AI 추천 결과
              </Badge>
              <button
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => setAiResult(null)}
              >
                전체 보기
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{aiResult.reason}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {displayPlans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isCurrent = plan.id === CURRENT_PLAN_ID;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(isSelected ? null : plan.id)}
                className={`
                  relative text-left rounded-lg border p-3 transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }
                `}
              >
                {isCurrent && (
                  <Badge variant="outline" className="absolute top-2 right-2 text-[10px]">
                    현재
                  </Badge>
                )}
                <div className="flex items-center gap-1.5 mb-1">
                  <Badge variant={plan.type === '5G' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                    {plan.type}
                  </Badge>
                  <span className="text-sm font-semibold">{plan.name}</span>
                </div>
                <div className="text-lg font-bold text-primary">{plan.priceLabel}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  데이터 {plan.data} / 음성 {plan.voice}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {plan.features.join(' · ')}
                </div>
              </button>
            );
          })}
        </div>

        {displayPlans.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        )}
      </section>

      {/* ② 부가서비스 & 할인 선택 */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 부가서비스 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">부가서비스</h3>
            <div className="rounded-lg border p-3 space-y-3">
              {ADDON_CATEGORIES.map((category) => {
                const services = ADDON_SERVICES.filter((a) => a.category === category);
                return (
                  <div key={category}>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">{category}</div>
                    <div className="space-y-1.5">
                      {services.map((service) => (
                        <label
                          key={service.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded px-1.5 py-1 -mx-1.5"
                        >
                          <Checkbox
                            checked={selectedAddons.has(service.id)}
                            onCheckedChange={() => toggleAddon(service.id)}
                          />
                          <span className="text-sm flex-1">{service.name}</span>
                          <span className={`text-xs font-medium ${service.isFree ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {service.priceLabel}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 할인 혜택 */}
          <div>
            <h3 className="text-sm font-semibold mb-3">할인 혜택</h3>
            <div className="rounded-lg border p-3 space-y-3">
              {DISCOUNT_TYPES.map((type) => {
                const discounts = DISCOUNTS.filter((d) => d.type === type);
                return (
                  <div key={type}>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">{type}</div>
                    <div className="space-y-1.5">
                      {discounts.map((discount) => (
                        <label
                          key={discount.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 rounded px-1.5 py-1 -mx-1.5"
                        >
                          <Checkbox
                            checked={selectedDiscounts.has(discount.id)}
                            onCheckedChange={() => toggleDiscount(discount.id)}
                          />
                          <span className="text-sm flex-1">{discount.name}</span>
                          <span className="text-xs font-medium text-green-600">
                            -{discount.discountLabel}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ③ 계산 결과 패널 */}
      <section className="rounded-lg border bg-muted/20 p-4">
        <h3 className="text-sm font-semibold mb-3">예상 요금 계산</h3>

        {!selectedPlan ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            위에서 요금제를 선택하면 예상 요금이 계산됩니다.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>기본 요금 ({selectedPlan.name})</span>
              <span className="font-medium">{formatCurrency(calculation.basePlanPrice)}</span>
            </div>

            {calculation.addonTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span>부가서비스</span>
                <span className="font-medium">+{formatCurrency(calculation.addonTotal)}</span>
              </div>
            )}

            {calculation.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>할인 합계</span>
                <span className="font-medium">-{formatCurrency(calculation.discountTotal)}</span>
              </div>
            )}

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">예상 월 요금</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(calculation.estimatedTotal)}
                </span>
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  현재 요금({CURRENT_PLAN.name}) 대비
                </span>
                <span className={`font-semibold flex items-center gap-1 ${
                  calculation.difference < 0
                    ? 'text-green-600'
                    : calculation.difference > 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                }`}>
                  {calculation.difference < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      {formatCurrency(Math.abs(calculation.difference))} 절약
                    </>
                  ) : calculation.difference > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      {formatCurrency(calculation.difference)} 추가
                    </>
                  ) : (
                    <>
                      <Minus className="w-4 h-4" />
                      동일
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
