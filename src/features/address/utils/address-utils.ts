import type { AddressResult } from '@/types/address';

/**
 * 주소 패턴 감지 정규식
 * - greedy 매칭으로 최대한 긴 주소 추출
 * - 번지/호수까지 포함
 */
const ADDRESS_PATTERNS = [
  // 시/도명 포함 전체 주소 패턴 (번지까지)
  /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:특별시|광역시|특별자치시|도|특별자치도)?[\s]*[가-힣]+(?:시|군|구)[\s]*[가-힣]+(?:읍|면|동|구|로|길)[\s]*[가-힣0-9\-\s]*(?:\d+(?:-\d+)?)?/,

  // 시/군/구로 시작하는 주소 (번지까지)
  /[가-힣]+(?:시|군)[\s]+[가-힣]+(?:구|읍|면|동)[\s]*[가-힣0-9\-\s]*(?:로|길|동)?[\s]*\d*(?:-\d+)?/,

  // 도로명 주소 (도로명 + 번지)
  /[가-힣]+(?:로|길)[\s]*\d+(?:-\d+)?/,
];

/**
 * SQL 예약어 목록
 */
const SQL_KEYWORDS = [
  'OR', 'SELECT', 'INSERT', 'DELETE', 'UPDATE', 'CREATE', 'DROP',
  'EXEC', 'UNION', 'FETCH', 'DECLARE', 'TRUNCATE', 'ALTER', 'WHERE',
];

/**
 * 위험한 특수문자 패턴
 */
const DANGEROUS_CHARS = /[%=><]/g;

/**
 * 메시지에서 주소 패턴을 감지합니다.
 * @param text 검사할 텍스트
 * @returns 감지된 주소 문자열 또는 null
 */
export function detectAddressPattern(text: string): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  let bestMatch: string | null = null;
  let maxLength = 0;

  // 모든 패턴을 시도하고 가장 긴 매칭 선택
  for (const pattern of ADDRESS_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[0].length > maxLength) {
      maxLength = match[0].length;
      bestMatch = match[0];
    }
  }

  if (bestMatch) {
    // 공백 정리 및 트림
    const cleaned = bestMatch.replace(/\s+/g, ' ').trim();
    console.log('[Address Detection] Found address pattern:', cleaned, '(length:', cleaned.length, ')');
    return cleaned;
  }

  return null;
}

/**
 * 주소 검색어에서 위험한 문자를 제거합니다.
 * @param keyword 원본 검색어
 * @returns 정제된 검색어
 */
export function sanitizeAddressKeyword(keyword: string): string {
  if (!keyword || typeof keyword !== 'string') {
    return '';
  }

  let sanitized = keyword;

  // 특수문자 제거
  sanitized = sanitized.replace(DANGEROUS_CHARS, '');

  // SQL 예약어 제거 (대소문자 구분 없이)
  for (const sqlKeyword of SQL_KEYWORDS) {
    const regex = new RegExp(`\\b${sqlKeyword}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '');
  }

  // 공백 정리
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * 주소 검색어의 유효성을 검증합니다.
 * @param keyword 검색어
 * @returns 검증 결과 { valid: boolean, error?: string }
 */
export function validateAddressKeyword(keyword: string): {
  valid: boolean;
  error?: string;
} {
  if (!keyword || typeof keyword !== 'string') {
    return { valid: false, error: '검색어를 입력해주세요' };
  }

  const trimmed = keyword.trim();

  // 최소 길이: 1자 (이전 2자에서 변경)
  if (trimmed.length < 1) {
    return { valid: false, error: '검색어는 최소 1자 이상이어야 합니다' };
  }

  // 최대 길이: 200자 (충분히 긴 주소도 검색 가능하도록)
  if (trimmed.length > 200) {
    return { valid: false, error: '검색어는 200자를 초과할 수 없습니다' };
  }

  // 한글, 영문, 숫자, 공백, 하이픈만 허용
  const validChars = /^[가-힣a-zA-Z0-9\s\-]+$/;
  if (!validChars.test(trimmed)) {
    return { valid: false, error: '유효하지 않은 문자가 포함되어 있습니다' };
  }

  return { valid: true };
}

/**
 * 도로명주소를 포맷팅합니다.
 * @param result 주소 검색 결과
 * @returns 포맷된 도로명주소 문자열
 */
export function formatRoadAddress(result: AddressResult): string {
  return result.roadAddr;
}

/**
 * 지번주소를 포맷팅합니다.
 * @param result 주소 검색 결과
 * @returns 포맷된 지번주소 문자열 (우편번호 포함)
 */
export function formatJibunAddress(result: AddressResult): string {
  const parts = [];

  if (result.jibunAddr) {
    parts.push(`(지번) ${result.jibunAddr}`);
  }

  if (result.zipNo) {
    parts.push(`[${result.zipNo}]`);
  }

  return parts.join(' ');
}

/**
 * 건물명을 포맷팅합니다.
 * @param result 주소 검색 결과
 * @returns 포맷된 건물명 또는 빈 문자열
 */
export function formatBuildingName(result: AddressResult): string {
  return result.bdNm || '';
}
