/**
 * 도로명주소 API 응답 타입 정의
 */

export interface AddressResult {
  roadAddr: string;      // 도로명주소
  roadAddrPart1: string; // 도로명주소(참고항목 제외)
  roadAddrPart2: string; // 도로명주소 참고항목
  jibunAddr: string;     // 지번주소
  engAddr: string;       // 도로명주소(영문)
  zipNo: string;         // 우편번호
  admCd: string;         // 행정구역코드
  rnMgtSn: string;       // 도로명코드
  bdMgtSn: string;       // 건물관리번호
  detBdNmList: string;   // 상세건물명
  bdNm: string;          // 건물명
  bdKdcd: string;        // 공동주택여부(1:공동주택, 0:비공동주택)
  siNm: string;          // 시도명
  sggNm: string;         // 시군구명
  emdNm: string;         // 읍면동명
  liNm: string;          // 법정리명
  rn: string;            // 도로명
  udrtYn: string;        // 지하여부(0:지상, 1:지하)
  buldMnnm: number;      // 건물본번
  buldSlno: number;      // 건물부번
  mtYn: string;          // 산여부(0:대지, 1:산)
  lnbrMnnm: number;      // 지번본번(번지)
  lnbrSlno: number;      // 지번부번(호)
  emdNo: string;         // 읍면동일련번호
}

export interface AddressCommon {
  totalCount: string;    // 총 검색 데이터수
  currentPage: string;   // 페이지 번호
  countPerPage: string;  // 페이지당 출력할 결과 Row 수
  errorCode: string;     // 에러 코드
  errorMessage: string;  // 에러 메시지
}

export interface AddressSearchApiResponse {
  results: {
    common: AddressCommon;
    juso: AddressResult[];
  };
}

export interface AddressSearchResponse {
  success: boolean;
  results?: {
    common: AddressCommon;
    juso: AddressResult[];
  };
  error?: string;
}

/**
 * 저장용 주소 정보 타입
 */
export interface SavedAddressInfo {
  roadAddr: string;      // 도로명주소
  jibunAddr: string;     // 지번주소
  zipNo: string;         // 우편번호
  siNm: string;          // 시도명
  sggNm: string;         // 시군구명
  emdNm: string;         // 읍면동명
  bdNm?: string;         // 건물명
  verifiedAt: Date;      // 검증 시간
}

/**
 * 주소 검색 상태 타입
 */
export interface AddressSearchState {
  keyword: string;
  results: AddressResult[];
  loading: boolean;
  error: string | null;
}
