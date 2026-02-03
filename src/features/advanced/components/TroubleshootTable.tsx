'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Search, ChevronDown, ChevronUp, Send, CheckCircle2, Copy, ClipboardCheck, Loader2 } from 'lucide-react';
import { useTranscriptStore } from '@/stores';

// ── 타입 정의 ──

type GuideCategory = '네트워크' | '요금/청구' | '단말기' | '서비스' | '분실/보험';
type Severity = 'urgent' | 'normal' | 'info';

interface TroubleshootGuide {
  id: string;
  category: GuideCategory;
  title: string;
  severity: Severity;
  symptoms: string[];
  phase1: string[];
  phase2: string[];
  escalation: string;
  escalationDept: string;
  script: string;
  resolution: string;
}

// ── 정적 데이터 ──

const GUIDES: TroubleshootGuide[] = [
  // ── 네트워크 ──
  {
    id: 'net-1',
    category: '네트워크',
    title: '통화 끊김 / 음성 안 들림',
    severity: 'urgent',
    symptoms: ['통화 끊김', '목소리 안 들림', '상대방 안 들림', '통화 중 끊어짐'],
    phase1: [
      '단말 재부팅',
      '비행기모드 On/Off (10초 대기)',
      '네트워크 재검색 (설정 > 셀룰러 > 네트워크 선택 > 자동)',
      'USIM 분리 후 재장착',
      'VoLTE 설정 확인 (끄기 → 재부팅 → 다시 켜기)',
    ],
    phase2: [
      '기지국 장애/정비/점검 여부 확인',
      '해당 셀(Cell) 과부하 여부 확인',
      '고객 회선 정지/체납/차단 여부 확인',
      '최근 개통/USIM 변경/번호이동 이력 확인',
      'SINR, RSRP 품질이력 로그 확인',
    ],
    escalation: '1차 조치 후에도 3회 이상 반복 발생 시 품질민원으로 네트워크팀 이관',
    escalationDept: '네트워크 품질팀',
    script: '고객님, 통화 중 끊김 현상이 발생하고 계시군요. 불편을 드려 죄송합니다. 먼저 비행기 모드를 껐다가 10초 후 다시 켜보시겠어요? 그래도 동일하시면 추가 조치 안내드리겠습니다.',
    resolution: '기지국 장애 시 복구 후 SMS 안내, 개인 회선 문제 시 원인/해결 내용 안내, 반복 장애 시 요금 감면 안내',
  },
  {
    id: 'net-2',
    category: '네트워크',
    title: '통화 잡음 / 울림 현상',
    severity: 'normal',
    symptoms: ['잡음', '울림', '에코', '지지직', '소리 깨짐'],
    phase1: [
      '스피커/마이크 이물질 제거',
      '케이스 제거 후 테스트',
      '블루투스 연결 해제 후 테스트',
      'Wi-Fi 통화 비활성화',
      '통화 음질 조정 (Galaxy: 설정 > 소리 > 음질 및 효과)',
    ],
    phase2: [
      'VoLTE 설정 상태 확인',
      'Wi-Fi Calling 상태 확인',
      '네트워크 모드(LTE/5G) 변경 테스트',
      '인근 기지국 핸드오버 장애 여부 확인',
    ],
    escalation: '단말 교체 후에도 증상 지속 시 네트워크팀 이관',
    escalationDept: '네트워크 품질팀',
    script: '고객님, 통화 중 잡음이 들리시는군요. 혹시 블루투스 이어폰이나 케이스를 사용 중이신가요? 먼저 블루투스 연결을 해제하고, 케이스를 분리한 상태에서 테스트해보시겠어요?',
    resolution: '단말기 문제 확인 시 서비스센터 안내, 네트워크 문제 시 복구 후 재연락',
  },
  {
    id: 'net-3',
    category: '네트워크',
    title: '데이터 느림 / 안 됨',
    severity: 'urgent',
    symptoms: ['데이터 안 됨', '인터넷 안 됨', '속도 느림', '데이터 끊김', 'LTE 느림', '5G 안 됨'],
    phase1: [
      '모바일 데이터 켜져 있는지 확인',
      '비행기 모드 Off 확인',
      '데이터 잔여량 확인 (T월드 앱)',
      'APN 설정 초기화',
      '네트워크 모드 LTE/5G 변경 테스트',
      '단말 재부팅',
    ],
    phase2: [
      '기지국 트래픽 급증 여부 확인',
      '데이터 차단/제한 설정 여부 확인',
      '요금제 데이터 소진 여부 확인',
      '5G DSS / NSA/SA 모드 이상 여부 확인',
      'Speedtest 요청 (다운/업로드/핑 측정)',
    ],
    escalation: '지역 전체 속도 저하 확인 시 네트워크본부 리포트, 개인 반복 시 품질민원 이관',
    escalationDept: '네트워크 운영센터',
    script: '고객님, 데이터가 잘 안 되시는 상황이군요. 먼저 T월드 앱에서 데이터 잔여량을 확인해주시겠어요? 잔여량이 있으시면 비행기 모드를 껐다 켜보시고 다시 한번 확인 부탁드립니다.',
    resolution: '기지국 장애 시 예상 복구시간 안내, 데이터 소진 시 충전/요금제 변경 안내',
  },
  {
    id: 'net-4',
    category: '네트워크',
    title: '발신 / 수신 불가',
    severity: 'urgent',
    symptoms: ['전화 안 됨', '전화 못 걸음', '전화 안 옴', '발신 불가', '수신 불가'],
    phase1: [
      '이용정지 상태 확인 (T월드 앱)',
      '미납 요금 확인 및 납부',
      '착신전환 해제 (##002# 발신)',
      '차단 목록 확인',
      'USIM 분리 후 재장착',
      '단말 재부팅',
    ],
    phase2: [
      '고객 회선 정지/체납/차단 상태 확인',
      '망 차단 여부 확인',
      'VoLTE 설정 여부 확인',
      'NR/LTE 단말 호환성 확인',
      '최근 번호이동/개통 이력 확인',
    ],
    escalation: '회선 정상인데 발수신 불가 시 즉시 네트워크팀 이관',
    escalationDept: '네트워크 장애대응팀',
    script: '고객님, 전화가 안 되시는 상황이군요. 먼저 T월드 앱에서 이용정지 여부와 미납 요금이 있는지 확인해주시겠어요?',
    resolution: '미납 시 납부 안내, 회선 문제 시 즉시 복구 후 안내',
  },
  {
    id: 'net-5',
    category: '네트워크',
    title: 'VoLTE / 5G 전환 문제',
    severity: 'normal',
    symptoms: ['VoLTE 안 됨', '5G 안 잡힘', 'LTE로 떨어짐', '5G 전환 안 됨'],
    phase1: [
      'VoLTE 끄기 → 재부팅 → 다시 켜기',
      '네트워크 모드 LTE/5G 자동으로 변경',
      '네트워크 설정 초기화',
      'USIM 분리 후 재장착',
    ],
    phase2: [
      '5G 커버리지 확인 (해당 위치)',
      'NSA/SA 모드 상태 확인',
      '단말 5G 지원 여부 확인',
      'USIM 5G 호환 여부 확인',
    ],
    escalation: '5G 커버리지 내에서 지속 LTE 전환 시 네트워크팀 이관',
    escalationDept: '네트워크 품질팀',
    script: '고객님, 5G 연결이 안 되시는 상황이시군요. 현재 계신 위치가 5G 커버리지 지역인지 먼저 확인해보겠습니다. VoLTE 설정을 한번 껐다가 다시 켜보시겠어요?',
    resolution: '커버리지 밖이면 안내, 커버리지 내 문제면 네트워크팀 정밀분석 후 안내',
  },

  // ── 요금/청구 ──
  {
    id: 'bill-1',
    category: '요금/청구',
    title: '요금 이의제기 (일반)',
    severity: 'normal',
    symptoms: ['요금 오류', '과금 이상', '청구 금액 틀림', '요금 많이 나옴'],
    phase1: [
      'T월드 앱 > 요금 > 상세 내역 확인 안내',
      '문제 항목 특정 (어떤 요금이 이상한지)',
      '최근 요금제/부가서비스 변경 이력 확인',
    ],
    phase2: [
      '청구 내역 상세 분석',
      '가입 서비스 목록 vs 청구 항목 대조',
      '이의제기 접수 (접수 번호 발급)',
      '담당 부서 조사 배정 (3~7일)',
    ],
    escalation: '조사 결과에 불복 시 재심 요청 (14일 이내), 외부 기관: 방통위(1335), 소비자원(1372)',
    escalationDept: '요금정산팀',
    script: '고객님, 요금에 이상이 있으신 거군요. T월드 앱에서 이번 달 상세 내역을 확인해주시겠어요? 어떤 항목이 이상하신지 말씀해주시면 바로 확인 도와드리겠습니다.',
    resolution: '오류 확인 시 환불 처리 (차감/계좌환불/포인트), 정상 시 상세 안내',
  },
  {
    id: 'bill-2',
    category: '요금/청구',
    title: '소액결제 분쟁',
    severity: 'normal',
    symptoms: ['소액결제', '모르는 결제', '결제 취소', '인앱결제'],
    phase1: [
      '결제 내역 확인 (T월드 앱 > 소액결제)',
      'CP사(콘텐츠 제공사) 확인',
      '결제 일시/금액/서비스명 특정',
    ],
    phase2: [
      '결제 내역 시스템 조회',
      'CP사 연락처 안내 및 환불 협의',
      '본인 결제 아닌 경우 소액결제 차단 설정',
      '사기 의심 시 경찰 신고 안내',
    ],
    escalation: 'CP사와 환불 협의 불가 시 방통위 분쟁 조정',
    escalationDept: '결제서비스팀',
    script: '고객님, 모르는 결제 내역이 있으신 거군요. 소액결제 내역을 확인해보겠습니다. 혹시 최근에 앱 설치나 광고 클릭을 하신 적이 있으실까요?',
    resolution: '환불 시 CP사 통해 처리 (7~14일), 재발 방지용 소액결제 차단/한도 조정 안내',
  },
  {
    id: 'bill-3',
    category: '요금/청구',
    title: '부가서비스 오청구',
    severity: 'normal',
    symptoms: ['신청 안 한 서비스', '부가서비스 요금', '모르는 서비스 청구'],
    phase1: [
      '현재 가입된 부가서비스 목록 안내',
      '문제 서비스 특정',
    ],
    phase2: [
      '가입 경위 조사 (본인 동의 여부)',
      '본인 동의 없으면 전액 환불 처리',
      '해당 서비스 즉시 해지',
    ],
    escalation: '반복 발생 시 상위 부서 검토',
    escalationDept: '요금정산팀',
    script: '고객님, 신청하지 않은 서비스가 청구되고 계신 거군요. 가입 내역을 확인해보겠습니다. 어떤 서비스인지 말씀해주시겠어요?',
    resolution: '본인 비동의 시 전액 환불 + 해지, 동의 있었으면 해지만 가능',
  },
  {
    id: 'bill-4',
    category: '요금/청구',
    title: '로밍 고액 요금',
    severity: 'urgent',
    symptoms: ['로밍 요금', '해외 요금', '로밍비 폭탄', '로밍 비싸'],
    phase1: [
      '로밍 사용 내역 확인',
      '로밍 요금제 가입 여부 확인',
      '로밍 안내 SMS 수신 여부 확인',
    ],
    phase2: [
      '데이터로밍 사용 패턴 분석',
      '의도치 않은 사용 여부 확인',
      '감면 대상 여부 검토',
    ],
    escalation: '감면 불가 판단 시 재심 또는 방통위 분쟁 조정',
    escalationDept: '로밍서비스팀',
    script: '고객님, 로밍 요금이 예상보다 높으셨군요. 해외 체류 기간과 로밍 요금제 가입 여부를 확인해보겠습니다.',
    resolution: '의도치 않은 사용 입증 시 감면 협의, 로밍 요금제 미가입 시 향후 가입 안내',
  },
  {
    id: 'bill-5',
    category: '요금/청구',
    title: '데이터 이상 사용량',
    severity: 'normal',
    symptoms: ['데이터 많이 나감', '데이터 금방 다 씀', '데이터 사용량 이상'],
    phase1: [
      '단말기 데이터 사용량 확인 (설정 > 데이터)',
      '앱별 사용량 확인',
      '백그라운드 데이터 사용 앱 확인',
    ],
    phase2: [
      '시스템 사용 패턴 분석',
      '비정상 사용 패턴 확인',
      '시스템 오류 확인 시 감면',
    ],
    escalation: '시스템 오류 의심 시 기술팀 정밀 분석',
    escalationDept: '기술지원팀',
    script: '고객님, 데이터가 평소보다 많이 사용되신 거군요. 설정에서 앱별 데이터 사용량을 한번 확인해주시겠어요? 특정 앱이 백그라운드에서 많이 사용하고 있을 수 있습니다.',
    resolution: '시스템 오류 시 감면, 정상 사용 시 데이터 절약 방법 안내',
  },

  // ── 단말기 ──
  {
    id: 'dev-1',
    category: '단말기',
    title: '화면 깨짐 / 터치 불량',
    severity: 'normal',
    symptoms: ['화면 깨짐', '터치 안 됨', '화면 먹통', '디스플레이 불량'],
    phase1: [
      '보호필름 제거 후 터치 테스트',
      '단말 재부팅',
      '안전모드 부팅 후 테스트 (앱 충돌 여부)',
    ],
    phase2: [
      '보험 가입 여부 확인 (T 올케어/분실파손)',
      '보증 기간 확인',
      '서비스센터 예약 안내',
    ],
    escalation: '보험 미가입 + 보증 만료 시 유상 수리 안내',
    escalationDept: '단말 A/S팀',
    script: '고객님, 화면에 문제가 생기셨군요. 혹시 보호필름을 사용 중이시면 제거 후 터치가 되는지 확인해주시겠어요? 안 되시면 가까운 서비스센터 예약을 도와드리겠습니다.',
    resolution: '보험 가입 시 보험 청구 안내, 미가입 시 서비스센터 안내',
  },
  {
    id: 'dev-2',
    category: '단말기',
    title: '배터리 이상 소모',
    severity: 'info',
    symptoms: ['배터리 빨리 닳음', '배터리 이상', '충전 빨리 줄어듬'],
    phase1: [
      '배터리 사용량 앱별 확인 (설정 > 배터리)',
      '화면 밝기/자동 밝기 설정 확인',
      '백그라운드 앱 정리',
      '절전 모드 활성화 안내',
      '최근 OS 업데이트 여부 확인',
    ],
    phase2: [
      '배터리 건강 상태 확인 (iPhone: 설정 > 배터리 > 배터리 성능 상태)',
      '보증 기간 확인',
    ],
    escalation: '배터리 성능 80% 미만 시 서비스센터 교체 안내',
    escalationDept: '단말 A/S팀',
    script: '고객님, 배터리가 빨리 닳으시는군요. 설정에서 배터리 사용량을 확인해보시면 어떤 앱이 많이 사용하는지 볼 수 있습니다. 한번 확인해주시겠어요?',
    resolution: '소프트웨어 문제 시 초기화/업데이트 안내, 하드웨어 문제 시 서비스센터 안내',
  },
  {
    id: 'dev-3',
    category: '단말기',
    title: '충전 불량',
    severity: 'normal',
    symptoms: ['충전 안 됨', '충전 느림', '충전기 인식 안 됨'],
    phase1: [
      '다른 충전기/케이블로 테스트',
      '충전 포트 이물질 제거 (에어더스터)',
      '무선충전 테스트 (지원 단말)',
      '단말 재부팅 후 재시도',
    ],
    phase2: [
      '보험/보증 상태 확인',
      '서비스센터 예약 안내',
    ],
    escalation: '충전 포트 하드웨어 문제 시 서비스센터 이관',
    escalationDept: '단말 A/S팀',
    script: '고객님, 충전이 안 되시는 상황이군요. 혹시 다른 충전기나 케이블로 시도해보셨나요? 충전 포트에 먼지가 끼어있을 수도 있어서 확인해주시면 좋겠습니다.',
    resolution: '충전기 문제 시 교체 안내, 포트 문제 시 서비스센터 안내',
  },
  {
    id: 'dev-4',
    category: '단말기',
    title: 'USIM 인식 불가',
    severity: 'urgent',
    symptoms: ['USIM 인식 안 됨', '유심 오류', '유심 없음 표시', 'SIM 카드 없음'],
    phase1: [
      'USIM 분리 → 접점 부분 닦기 → 재장착',
      '다른 단말에 USIM 장착 테스트',
      '다른 USIM으로 해당 단말 테스트',
      '단말 재부팅',
    ],
    phase2: [
      'USIM 상태 조회 (활성화 여부)',
      'USIM 교체 필요 시 매장/택배 안내',
      '단말 USIM 슬롯 불량 시 서비스센터 안내',
    ],
    escalation: 'USIM/단말 모두 정상인데 인식 불가 시 기술팀 이관',
    escalationDept: '기술지원팀',
    script: '고객님, USIM이 인식이 안 되시는 거군요. 먼저 USIM을 빼셔서 금색 접점 부분을 부드러운 천으로 닦아주시고 다시 넣어보시겠어요?',
    resolution: 'USIM 불량 시 무료 교체 (매장 방문), 슬롯 문제 시 서비스센터',
  },

  // ── 서비스 ──
  {
    id: 'svc-1',
    category: '서비스',
    title: 'T월드 앱 로그인 불가',
    severity: 'info',
    symptoms: ['T월드 로그인', '앱 로그인 안 됨', 'T월드 접속 불가'],
    phase1: [
      '앱 강제 종료 후 재실행',
      '앱 캐시 삭제',
      '앱 업데이트 확인',
      'Wi-Fi 끄고 모바일 데이터로 시도 (자동 인증)',
    ],
    phase2: [
      '계정 상태 확인 (잠김/비활성)',
      '비밀번호 초기화 안내',
      '본인인증 수단 확인',
    ],
    escalation: '시스템 장애 의심 시 IT 운영팀 확인',
    escalationDept: 'IT 운영팀',
    script: '고객님, T월드 앱 로그인이 안 되시는 거군요. Wi-Fi를 끄시고 모바일 데이터 상태에서 접속해보시겠어요? 자동 본인인증이 될 수 있습니다.',
    resolution: '계정 잠김 시 해제, 비밀번호 초기화 안내',
  },
  {
    id: 'svc-2',
    category: '서비스',
    title: '본인인증 실패',
    severity: 'normal',
    symptoms: ['본인인증 안 됨', '인증번호 안 옴', '인증 실패', '본인확인 불가'],
    phase1: [
      'SMS 수신 가능 상태 확인',
      '스팸 차단 앱 확인 (인증 SMS 차단 여부)',
      '다른 인증 수단 시도 (공동인증서, 패스 앱 등)',
    ],
    phase2: [
      '회선 상태 확인 (정지/차단)',
      '명의 불일치 여부 확인',
      'NICE/KCB 인증 시스템 상태 확인',
    ],
    escalation: '명의 도용 의심 시 즉시 보안팀 이관',
    escalationDept: '보안팀',
    script: '고객님, 본인인증이 안 되시는 거군요. 혹시 스팸 차단 앱을 사용 중이신가요? 인증 문자가 차단될 수 있어서 확인 부탁드립니다.',
    resolution: '인증 수단 변경 안내, 명의 불일치 시 매장 방문 안내',
  },
  {
    id: 'svc-3',
    category: '서비스',
    title: '번호이동 지연 / 실패',
    severity: 'normal',
    symptoms: ['번호이동 안 됨', '번호이동 지연', '개통 지연', '번호이동 실패'],
    phase1: [
      '번호이동 신청 상태 확인',
      '이전 통신사 해지 완료 여부 확인',
      '미납 요금 여부 확인',
    ],
    phase2: [
      '번호이동 시스템 접수 상태 조회',
      '이전 통신사 동의 처리 상태 확인',
      '개통 예정 일시 안내',
    ],
    escalation: '48시간 이상 지연 시 번호이동 전담팀 이관',
    escalationDept: '번호이동 전담팀',
    script: '고객님, 번호이동이 지연되고 계시군요. 신청 상태를 확인해보겠습니다. 이전 통신사에서 미납 요금이 있으시면 처리가 지연될 수 있습니다.',
    resolution: '미납 해결 후 재신청 안내, 시스템 지연 시 예상 완료 시각 안내',
  },

  // ── 분실/보험 ──
  {
    id: 'lost-1',
    category: '분실/보험',
    title: '분실 신고 및 이용정지',
    severity: 'urgent',
    symptoms: ['폰 잃어버림', '핸드폰 분실', '분실 신고', '이용정지'],
    phase1: [
      '즉시 이용정지 처리 (114 또는 T월드)',
      '분실 위치 추적 안내 (삼성 Find My / Apple 나의 찾기)',
      '소액결제 차단 처리',
    ],
    phase2: [
      '이용정지 처리 완료 확인',
      '보험 가입 여부 확인',
      '보험 청구 절차 안내',
      '임대폰 필요 시 안내',
    ],
    escalation: '분실 단말 부정 사용 발견 시 보안팀 이관',
    escalationDept: '보안팀',
    script: '고객님, 핸드폰을 분실하셨군요. 바로 이용정지 처리 도와드리겠습니다. 소액결제도 함께 차단해드릴까요? 보험 가입 여부도 확인해보겠습니다.',
    resolution: '이용정지 + 소액결제 차단 처리, 보험 청구 안내, 임대폰 안내',
  },
  {
    id: 'lost-2',
    category: '분실/보험',
    title: '보험금 청구 (파손/분실)',
    severity: 'normal',
    symptoms: ['보험 청구', '파손 보상', '보험금', '수리비 청구'],
    phase1: [
      '보험 가입 상품 확인 (T 올케어/분실파손6 등)',
      '보상 가능 범위 안내 (분실/파손/침수)',
      '자기부담금 안내',
    ],
    phase2: [
      '보험 청구 접수 (앱/매장)',
      '필요 서류 안내 (분실: 경찰 신고 확인서)',
      '보상 처리 기간 안내 (3~5영업일)',
    ],
    escalation: '보상 거절 시 재심 요청 안내',
    escalationDept: '보험서비스팀',
    script: '고객님, 보험금 청구를 도와드리겠습니다. 가입하신 보험 상품을 확인해보니 [상품명]이시네요. 자기부담금은 약 [금액]입니다. 청구 절차 안내드릴까요?',
    resolution: '보험 접수 후 3~5영업일 내 보상, 미가입 시 유상 수리 안내',
  },
  {
    id: 'lost-3',
    category: '분실/보험',
    title: '임대폰 신청',
    severity: 'info',
    symptoms: ['임대폰', '대여폰', '임시 폰', '폰 빌리기'],
    phase1: [
      '임대폰 서비스 안내 (분실/수리 중 사용)',
      '이용 요금 안내 (일 550원)',
      '신청 방법 안내 (114 또는 매장)',
    ],
    phase2: [
      '재고 확인',
      '배송 또는 매장 수령 안내',
      '반납 기한 안내 (14일)',
    ],
    escalation: '해당 없음',
    escalationDept: '고객서비스팀',
    script: '고객님, 임대폰 서비스를 안내드리겠습니다. 수리나 분실 기간 동안 사용하실 수 있고, 하루 550원입니다. 매장 수령 또는 택배 수령이 가능합니다.',
    resolution: '임대폰 발송 또는 매장 수령 처리',
  },
];

// ── 헬퍼 ──

const SEVERITY_CONFIG: Record<Severity, { label: string; className: string }> = {
  urgent: { label: '긴급', className: 'bg-red-500 hover:bg-red-600 text-white' },
  normal: { label: '일반', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  info: { label: '정보', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
};

const CATEGORY_VARIANT: Record<GuideCategory, 'default' | 'secondary' | 'outline'> = {
  '네트워크': 'default',
  '요금/청구': 'secondary',
  '단말기': 'outline',
  '서비스': 'secondary',
  '분실/보험': 'default',
};

// ── 에스컬레이션 확인 모달 ──

function EscalationModal({
  open,
  guide,
  onClose,
  onConfirm,
}: {
  open: boolean;
  guide: TroubleshootGuide | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [summaryMessage, setSummaryMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const getFullText = useTranscriptStore((s) => s.getFullText);

  const generateSummary = useCallback(async () => {
    if (!guide) return;
    setIsGenerating(true);
    setSummaryMessage('');
    try {
      const transcript = getFullText();
      const res = await fetch('/api/escalation-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          guideTitle: guide.title,
          guideCategory: guide.category,
          symptoms: guide.symptoms,
          escalationDept: guide.escalationDept,
        }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setSummaryMessage(data.message);
    } catch {
      // fallback: 대화 내용 없거나 API 실패 시 기본 메시지
      const transcript = getFullText();
      const lines = [
        `■ 이관 대상: ${guide.escalationDept}`,
        `■ 장애 유형: [${guide.category}] ${guide.title}`,
        `■ 관련 증상: ${guide.symptoms.join(', ')}`,
        '',
        '■ 고객 상황 요약',
        transcript
          ? transcript.split('\n').slice(-6).join('\n')
          : '(상담 대화 내용을 기반으로 작성해주세요)',
        '',
        `■ 이관 사유`,
        guide.escalation,
        '',
        '■ 요청 사항',
        '확인 후 고객에게 회신 부탁드립니다.',
      ];
      setSummaryMessage(lines.join('\n'));
    } finally {
      setIsGenerating(false);
    }
  }, [guide, getFullText]);

  // 모달 열릴 때 자동 생성
  useEffect(() => {
    if (open && guide) {
      generateSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSend = async () => {
    setIsSending(true);
    // 실제로는 이관 시스템 API 호출
    await new Promise((r) => setTimeout(r, 800));
    setIsSending(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onConfirm();
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setSummaryMessage('');
    setSent(false);
    onClose();
  };

  if (!guide) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            {guide.escalationDept}에 이관
          </DialogTitle>
          <DialogDescription className="text-xs">
            상담 내용을 AI가 요약했습니다. 수정 후 전송하세요.
          </DialogDescription>
        </DialogHeader>

        {/* 이관 정보 요약 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={CATEGORY_VARIANT[guide.category]} className="text-[10px]">
            {guide.category}
          </Badge>
          <span className="text-xs font-medium">{guide.title}</span>
          <Badge className={`text-[10px] ${SEVERITY_CONFIG[guide.severity].className}`}>
            {SEVERITY_CONFIG[guide.severity].label}
          </Badge>
        </div>

        {/* AI 생성 메시지 (편집 가능) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">이관 메시지</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-[10px] gap-1"
              onClick={generateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {isGenerating ? '생성 중...' : '다시 생성'}
            </Button>
          </div>
          {isGenerating ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">대화 내용을 분석하여 이관 메시지를 작성하고 있습니다...</span>
            </div>
          ) : (
            <Textarea
              value={summaryMessage}
              onChange={(e) => setSummaryMessage(e.target.value)}
              className="text-xs min-h-[200px] leading-relaxed"
              placeholder="이관 메시지가 여기에 표시됩니다..."
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isSending}>
            취소
          </Button>
          <Button
            size="sm"
            className={`gap-2 ${sent ? 'bg-green-600 hover:bg-green-600' : 'bg-orange-600 hover:bg-orange-700'}`}
            onClick={handleSend}
            disabled={isGenerating || isSending || sent || !summaryMessage.trim()}
          >
            {sent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                이관 완료
              </>
            ) : isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {guide.escalationDept}에 전송
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── 인라인 상세 패널 ──

function GuideDetailPanel({
  guide,
  onEscalate,
  escalated,
  scriptCopied,
  onCopyScript,
}: {
  guide: TroubleshootGuide;
  onEscalate: () => void;
  escalated: boolean;
  scriptCopied: boolean;
  onCopyScript: () => void;
}) {
  return (
    <TableRow className="bg-muted/20 hover:bg-muted/20">
      <TableCell colSpan={5} className="p-0">
        <div className="px-4 py-3 space-y-3 border-l-4 border-l-primary">
          {/* 1차 진단: 즉시 해결 시도 */}
          <div className="rounded-md bg-background border p-3">
            <div className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold">1</span>
              즉시 조치 안내 (고객에게 안내)
            </div>
            <ol className="space-y-1.5 ml-1">
              {guide.phase1.map((step, i) => (
                <li key={i} className="text-xs text-foreground flex gap-2">
                  <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* 추천 멘트 + 복사 */}
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">추천 응대 멘트</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] gap-1 text-blue-600"
                onClick={(e) => { e.stopPropagation(); onCopyScript(); }}
              >
                {scriptCopied ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {scriptCopied ? '복사됨' : '복사'}
              </Button>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              &ldquo;{guide.script}&rdquo;
            </p>
          </div>

          {/* 해결 안 됨 → 에스컬레이션 영역 */}
          <div className="rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3">
            <div className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold">2</span>
              1차 조치로 해결 안 될 경우
            </div>

            {/* 2차 진단 항목 */}
            <ol className="space-y-1 ml-1 mb-3">
              {guide.phase2.map((step, i) => (
                <li key={i} className="text-xs text-foreground flex gap-2">
                  <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="text-[11px] text-orange-600 dark:text-orange-400 mb-3">
              이관 기준: {guide.escalation}
            </div>

            {/* 이관 버튼 */}
            {escalated ? (
              <div className="flex items-center gap-2 rounded-md bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-700 px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-green-700 dark:text-green-300">{guide.escalationDept}</span>
                  <span className="text-green-600 dark:text-green-400">에 이관 완료</span>
                  <span className="text-muted-foreground ml-1.5">
                    — [{guide.category}] {guide.title} / 증상: {guide.symptoms.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                className="w-full gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={(e) => { e.stopPropagation(); onEscalate(); }}
              >
                <Send className="w-3.5 h-3.5" />
                {guide.escalationDept}에 이관하기
              </Button>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── 메인 컴포넌트 ──

export function TroubleshootTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [escalatedIds, setEscalatedIds] = useState<Set<string>>(new Set());
  const [scriptCopiedId, setScriptCopiedId] = useState<string | null>(null);

  // 에스컬레이션 모달
  const [escalationModalGuide, setEscalationModalGuide] = useState<TroubleshootGuide | null>(null);

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return GUIDES;
    const q = searchQuery.toLowerCase();
    return GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.symptoms.some((s) => s.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleEscalateRequest = (guide: TroubleshootGuide) => {
    setEscalationModalGuide(guide);
  };

  const handleEscalateConfirm = () => {
    if (escalationModalGuide) {
      setEscalatedIds((prev) => new Set(prev).add(escalationModalGuide.id));
    }
  };

  const handleCopyScript = (guide: TroubleshootGuide) => {
    navigator.clipboard.writeText(guide.script).then(() => {
      setScriptCopiedId(guide.id);
      setTimeout(() => setScriptCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="증상/키워드 검색 (통화 끊김, 요금, 분실...)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">카테고리</TableHead>
              <TableHead className="whitespace-nowrap">제목</TableHead>
              <TableHead className="whitespace-nowrap">긴급도</TableHead>
              <TableHead className="whitespace-nowrap">주요 증상</TableHead>
              <TableHead className="text-right whitespace-nowrap">상세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuides.map((guide) => {
              const isSelected = selectedId === guide.id;
              const sev = SEVERITY_CONFIG[guide.severity];
              return (
                <GuideRow
                  key={guide.id}
                  guide={guide}
                  isSelected={isSelected}
                  sevConfig={sev}
                  escalated={escalatedIds.has(guide.id)}
                  scriptCopied={scriptCopiedId === guide.id}
                  onToggle={() => setSelectedId(isSelected ? null : guide.id)}
                  onEscalate={() => handleEscalateRequest(guide)}
                  onCopyScript={() => handleCopyScript(guide)}
                />
              );
            })}
            {filteredGuides.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-xs">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 에스컬레이션 확인 모달 */}
      <EscalationModal
        open={escalationModalGuide !== null}
        guide={escalationModalGuide}
        onClose={() => setEscalationModalGuide(null)}
        onConfirm={handleEscalateConfirm}
      />
    </div>
  );
}

// ── 행 컴포넌트 (요약 + 인라인 상세) ──

function GuideRow({
  guide,
  isSelected,
  sevConfig,
  escalated,
  scriptCopied,
  onToggle,
  onEscalate,
  onCopyScript,
}: {
  guide: TroubleshootGuide;
  isSelected: boolean;
  sevConfig: { label: string; className: string };
  escalated: boolean;
  scriptCopied: boolean;
  onToggle: () => void;
  onEscalate: () => void;
  onCopyScript: () => void;
}) {
  return (
    <>
      <TableRow
        className={`cursor-pointer ${isSelected ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
        onClick={onToggle}
      >
        <TableCell>
          <Badge variant={CATEGORY_VARIANT[guide.category]} className="text-[10px] whitespace-nowrap">
            {guide.category}
          </Badge>
        </TableCell>
        <TableCell className="font-medium text-xs whitespace-nowrap">{guide.title}</TableCell>
        <TableCell>
          <Badge className={`text-[10px] ${sevConfig.className}`}>
            {sevConfig.label}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          <span className="line-clamp-1">{guide.symptoms.join(', ')}</span>
        </TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </TableCell>
      </TableRow>
      {isSelected && (
        <GuideDetailPanel
          guide={guide}
          onEscalate={onEscalate}
          escalated={escalated}
          scriptCopied={scriptCopied}
          onCopyScript={onCopyScript}
        />
      )}
    </>
  );
}
