/**
 * PII (Personally Identifiable Information) 마스킹 유틸리티
 */

interface PIIPattern {
  name: string;
  pattern: RegExp;
  mask: (match: string) => string;
}

const piiPatterns: PIIPattern[] = [
  {
    name: 'phone',
    pattern: /01[0-9]-?\d{3,4}-?\d{4}/g,
    mask: (match) => {
      const digits = match.replace(/-/g, '');
      return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
    },
  },
  {
    name: 'cardNumber',
    pattern: /\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/g,
    mask: (match) => {
      const digits = match.replace(/[- ]/g, '');
      return `${digits.slice(0, 4)}-****-****-${digits.slice(-4)}`;
    },
  },
  {
    name: 'residentId',
    pattern: /\d{6}[- ]?\d{7}/g,
    mask: (match) => {
      const digits = match.replace(/-/g, '');
      return `${digits.slice(0, 6)}-*******`;
    },
  },
  {
    name: 'email',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    mask: (match) => {
      const [localPart, domain] = match.split('@');
      const maskedLocal = localPart.length > 2
        ? `${localPart[0]}***${localPart[localPart.length - 1]}`
        : '***';
      return `${maskedLocal}@${domain}`;
    },
  },
  {
    name: 'birthDate',
    pattern: /(?:19|20)\d{2}[년.\-\/]?\s*(?:0?[1-9]|1[0-2])[월.\-\/]?\s*(?:0?[1-9]|[12]\d|3[01])[일]?/g,
    mask: () => '****년 **월 **일',
  },
  {
    name: 'accountNumber',
    pattern: /\d{3,4}-?\d{2,4}-?\d{4,6}/g,
    mask: (match) => {
      const parts = match.split('-');
      if (parts.length >= 2) {
        return `${parts[0]}-****-${parts[parts.length - 1]}`;
      }
      const digits = match.replace(/-/g, '');
      return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
    },
  },
];

export interface MaskingResult {
  original: string;
  masked: string;
  detectedPII: { type: string; count: number }[];
}

/**
 * 텍스트에서 PII를 감지하고 마스킹합니다.
 */
export function maskPII(text: string): MaskingResult {
  let masked = text;
  const detectedPII: { type: string; count: number }[] = [];

  for (const { name, pattern, mask } of piiPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detectedPII.push({ type: name, count: matches.length });
      masked = masked.replace(pattern, mask);
    }
  }

  return {
    original: text,
    masked,
    detectedPII,
  };
}

/**
 * PII 마스킹 상태를 확인합니다.
 */
export function checkPIIMaskingStatus(text: string): {
  hasPII: boolean;
  piiTypes: string[];
} {
  const piiTypes: string[] = [];

  for (const { name, pattern } of piiPatterns) {
    if (pattern.test(text)) {
      piiTypes.push(name);
    }
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
  }

  return {
    hasPII: piiTypes.length > 0,
    piiTypes,
  };
}

/**
 * 마스킹 상태에 따른 보안 배지 정보를 반환합니다.
 */
export type SecurityBadgeStatus = 'complete' | 'processing' | 'error';

export function getSecurityBadgeInfo(status: SecurityBadgeStatus) {
  const badges = {
    complete: {
      icon: '🔒',
      color: 'text-green-600 bg-green-100',
      text: 'PII 마스킹 완료',
    },
    processing: {
      icon: '🔄',
      color: 'text-yellow-600 bg-yellow-100',
      text: 'PII 처리 중...',
    },
    error: {
      icon: '⚠️',
      color: 'text-red-600 bg-red-100',
      text: 'PII 처리 오류',
    },
  };

  return badges[status];
}
