export type TopicType =
  | 'plan_change'    // 요금제 변경
  | 'plan_inquiry'   // 요금제 문의/추천
  | 'roaming'        // 로밍 안내
  | 'addon_service'  // 부가서비스
  | 'billing'        // 청구/요금
  | 'membership'     // 멤버십/혜택
  | 'device'         // 단말기
  | 'general';       // 일반 안내

export interface ExtractedTopic {
  id: string;
  type: TopicType;
  title: string;           // "요금제 변경 안내"
  summary: string;         // 한 줄 요약
  keyInfo: Record<string, string>;  // 핵심 정보
  smsContent: string;      // 해당 토픽의 SMS 내용
}

export const TOPIC_LABELS: Record<TopicType, string> = {
  plan_change: '요금제 변경',
  plan_inquiry: '요금제 문의',
  roaming: '로밍',
  addon_service: '부가서비스',
  billing: '청구/요금',
  membership: '멤버십/혜택',
  device: '단말기',
  general: '일반 안내',
};
