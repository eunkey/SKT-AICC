/**
 * 가격 문자열을 숫자로 변환
 * "89,000원" -> 89000
 * "무료" -> 0
 * "2,200원/월" -> 2200
 * "최대 22,250원/월" -> 22250
 */
export function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;

  const lowerStr = priceStr.toLowerCase();
  if (lowerStr === '무료' || lowerStr === 'free') return 0;
  if (lowerStr === '종량제') return 0;

  // 숫자와 쉼표만 추출
  const numericMatch = priceStr.match(/[\d,]+/);
  if (!numericMatch) return 0;

  // 쉼표 제거 후 숫자로 변환
  return parseInt(numericMatch[0].replace(/,/g, ''), 10) || 0;
}

/**
 * 숫자를 한국 원화 형식으로 포맷
 * 89000 -> "89,000원"
 * -89000 -> "-89,000원"
 */
export function formatPrice(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('ko-KR');
  const prefix = amount < 0 ? '-' : '';
  return `${prefix}${formatted}원`;
}

/**
 * 숫자를 부호 포함 한국 원화 형식으로 포맷
 * 89000 -> "+89,000원"
 * -89000 -> "-89,000원"
 */
export function formatPriceWithSign(amount: number): string {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('ko-KR');
  if (amount > 0) return `+${formatted}원`;
  if (amount < 0) return `-${formatted}원`;
  return '0원';
}

/**
 * 할인 금액 문자열에서 월 할인액 추출
 * "최대 22,250원/월" -> 22250
 * "5,500원/월" -> 5500
 * "최대 500,000원" -> 500000 (일회성)
 */
export function parseDiscountAmount(discountStr: string): number {
  return parsePrice(discountStr);
}

/**
 * 위약금 계산
 * @param totalSubsidy 총 공시지원금
 * @param totalMonths 전체 약정 개월수
 * @param remainingMonths 남은 개월수
 */
export function calculatePenalty(
  totalSubsidy: number,
  totalMonths: number,
  remainingMonths: number
): number {
  if (totalMonths <= 0) return 0;
  // 남은 기간에 비례하여 위약금 계산
  return Math.round((totalSubsidy * remainingMonths) / totalMonths);
}

/**
 * 월별 누적 비용 계산
 * @param initialCost 초기 비용 (위약금 등)
 * @param monthlyChange 월 변화액
 * @param months 계산할 개월 수
 */
export function calculateCumulativeCost(
  initialCost: number,
  monthlyChange: number,
  months: number
): number[] {
  const cumulative: number[] = [];
  let total = initialCost;

  for (let i = 1; i <= months; i++) {
    total += monthlyChange;
    cumulative.push(total);
  }

  return cumulative;
}

/**
 * 손익분기점 계산
 * @param initialCost 초기 비용 (음수 = 손해)
 * @param monthlyGain 월 이익 (양수 = 이익)
 * @returns 손익분기점 월 (없으면 null)
 */
export function calculateBreakEvenMonth(
  initialCost: number,
  monthlyGain: number
): number | null {
  // 초기 비용이 0이거나 양수면 즉시 이익
  if (initialCost >= 0) return 0;

  // 월 이익이 0이거나 음수면 손익분기점 없음
  if (monthlyGain <= 0) return null;

  // 손익분기점 = 초기 손해 / 월 이익
  const breakEven = Math.ceil(Math.abs(initialCost) / monthlyGain);

  // 36개월(3년) 내에 손익분기점 없으면 null
  return breakEven <= 36 ? breakEven : null;
}
