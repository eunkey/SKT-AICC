import { NextRequest, NextResponse } from 'next/server';
import type { AddressSearchApiResponse, AddressSearchResponse } from '@/types/address';
import { sanitizeAddressKeyword, validateAddressKeyword } from '@/features/address/utils/address-utils';

/**
 * 도로명주소 API URL
 */
const JUSO_API_URL = 'https://business.juso.go.kr/addrlink/addrLinkApi.do';

/**
 * 주소 검색 API 엔드포인트
 * GET /api/address/search?keyword={검색어}&currentPage={페이지}&countPerPage={페이지당개수}
 */
export async function GET(request: NextRequest) {
  try {
    // API 키 확인
    const apiKey = process.env.DORO_API_KEY;
    if (!apiKey) {
      console.error('[Address API] DORO_API_KEY not found in environment variables');
      return NextResponse.json(
        { success: false, error: 'API 설정이 올바르지 않습니다' } as AddressSearchResponse,
        { status: 500 }
      );
    }

    // 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const currentPage = searchParams.get('currentPage') || '1';
    const countPerPage = searchParams.get('countPerPage') || '10';

    // 검색어 검증
    if (!keyword) {
      return NextResponse.json(
        { success: false, error: '검색어를 입력해주세요' } as AddressSearchResponse,
        { status: 400 }
      );
    }

    // 보안 필터링
    const sanitizedKeyword = sanitizeAddressKeyword(keyword);
    const validation = validateAddressKeyword(sanitizedKeyword);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error } as AddressSearchResponse,
        { status: 400 }
      );
    }

    console.log('[Address API] Searching:', sanitizedKeyword);

    // 도로명주소 API 호출
    const apiUrl = new URL(JUSO_API_URL);
    apiUrl.searchParams.set('confmKey', apiKey);
    apiUrl.searchParams.set('keyword', sanitizedKeyword);
    apiUrl.searchParams.set('currentPage', currentPage);
    apiUrl.searchParams.set('countPerPage', countPerPage);
    apiUrl.searchParams.set('resultType', 'json');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!response.ok) {
      console.error('[Address API] HTTP error:', response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AddressSearchApiResponse = await response.json();

    // API 에러 확인
    if (data.results.common.errorCode !== '0') {
      console.error('[Address API] API error:', data.results.common.errorMessage);
      return NextResponse.json(
        {
          success: false,
          error: data.results.common.errorMessage || '주소 검색에 실패했습니다',
        } as AddressSearchResponse,
        { status: 500 }
      );
    }

    console.log('[Address API] Found', data.results.common.totalCount, 'results');

    // 성공 응답
    return NextResponse.json({
      success: true,
      results: data.results,
    } as AddressSearchResponse);

  } catch (error) {
    console.error('[Address API] Unexpected error:', error);

    // 타임아웃 에러
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, error: '응답 시간이 초과되었습니다' } as AddressSearchResponse,
        { status: 504 }
      );
    }

    // 기타 에러
    return NextResponse.json(
      { success: false, error: '주소 검색 중 오류가 발생했습니다' } as AddressSearchResponse,
      { status: 500 }
    );
  }
}
