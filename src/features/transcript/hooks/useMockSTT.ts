'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface MockConversationItem {
  speaker: 'customer' | 'counselor';
  text: string;
  delay: number;
}

export interface DemoScenarioConfig {
  id: string;
  name: string;
  description: string;
  conversation: MockConversationItem[];
}

// 시나리오 1: 요금제 변경 문의
const planChangeConversation: MockConversationItem[] = [
  { speaker: 'customer', text: '여보세요, 요금제 변경하려고 전화했는데요', delay: 0 },
  { speaker: 'counselor', text: '네, SK텔레콤 고객센터입니다. 요금제 변경 문의시군요. 본인 확인을 위해 성함과 생년월일 말씀해 주시겠어요?', delay: 3000 },
  { speaker: 'customer', text: '네, 김민수고요. 1985년 7월 20일입니다.', delay: 6500 },
  { speaker: 'counselor', text: '김민수 고객님, 본인 확인되었습니다. 현재 5G 프라임 요금제 사용 중이신데요, 어떤 요금제로 변경 원하시나요?', delay: 10000 },
  { speaker: 'customer', text: '데이터를 많이 안 써서 좀 저렴한 걸로 바꾸고 싶어요. 어떤 게 있나요?', delay: 14000 },
  { speaker: 'counselor', text: '네, 데이터 사용량이 적으시다면 5G 슬림 요금제 추천드립니다. 월 5만 9천원에 데이터 8GB 제공되고, T멤버십 실버 등급 유지됩니다.', delay: 18000 },
  { speaker: 'customer', text: '음, 8기가면 충분할 것 같은데... 다음 달부터 적용되나요?', delay: 23000 },
  { speaker: 'counselor', text: '네, 고객님. 요금제 변경은 다음 달 1일부터 적용됩니다. 이번 달은 기존 요금제로 이용하시게 됩니다.', delay: 27000 },
  { speaker: 'customer', text: '알겠어요. 그럼 5G 슬림으로 변경해 주세요.', delay: 31000 },
  { speaker: 'counselor', text: '네, 5G 슬림 요금제로 변경 처리 도와드리겠습니다. 변경 완료되었고요, 다음 달 1일부터 적용됩니다. 변경 내역은 문자로 발송해 드릴게요.', delay: 34000 },
  { speaker: 'customer', text: '네, 감사합니다.', delay: 39000 },
  { speaker: 'counselor', text: '네, 김민수 고객님. 더 필요하신 사항 있으시면 언제든 문의해 주세요. SK텔레콤을 이용해 주셔서 감사합니다.', delay: 42000 },
];

// 시나리오 2: 프리미엄 약정 해지 문의
const premiumCancelConversation: MockConversationItem[] = [
  { speaker: 'customer', text: '안녕하세요, 요금제 해지하고 싶은데요', delay: 0 },
  { speaker: 'counselor', text: '네, SK텔레콤 고객센터입니다. 해지 문의시군요. 본인 확인을 위해 성함과 생년월일 말씀해 주시겠어요?', delay: 3000 },
  { speaker: 'customer', text: '김민수, 1990년 3월 15일이요.', delay: 6500 },
  { speaker: 'counselor', text: '김민수 고객님, 본인 확인되었습니다. 현재 5G 프리미엄 89,000원 요금제에 24개월 약정 중이시네요. 어떤 이유로 해지를 원하시나요?', delay: 10000 },
  { speaker: 'customer', text: '요금이 너무 비싸서요. 다른 통신사로 갈아타려고요.', delay: 15000 },
  { speaker: 'counselor', text: '아, 그러시군요. 고객님, 현재 약정이 14개월 남아있고 공시지원금 50만원을 받으셨어요. 지금 해지하시면 위약금이 약 29만원 정도 발생합니다.', delay: 19000 },
  { speaker: 'customer', text: '네? 위약금이 그렇게 많이 나와요?', delay: 25000 },
  { speaker: 'counselor', text: '네, 그리고 현재 받고 계신 월 22,250원 약정 할인도 함께 종료됩니다. FLO, wavve 무료 혜택도 사라지고요.', delay: 28000 },
  { speaker: 'customer', text: '음... 그러면 손해가 크네요. 다른 방법이 있을까요?', delay: 34000 },
  { speaker: 'counselor', text: '네, 요금 부담을 줄이고 싶으시다면 5G 스탠다드로 다운그레이드하시는 방법도 있어요. 월 69,000원으로 2만원 절약되고, 약정 할인은 유지됩니다.', delay: 38000 },
  { speaker: 'customer', text: '아, 요금제 변경은 위약금 없이 가능한 거예요?', delay: 44000 },
  { speaker: 'counselor', text: '네, 맞습니다. 같은 SK텔레콤 내에서 요금제 변경은 위약금이 없어요. 약정 기간도 그대로 유지됩니다.', delay: 47000 },
  { speaker: 'customer', text: '그럼 일단 요금제 변경으로 해볼게요. 약정 끝나면 다시 생각해볼게요.', delay: 52000 },
  { speaker: 'counselor', text: '네, 현명한 선택이세요. 5G 스탠다드로 변경 도와드릴까요?', delay: 56000 },
  { speaker: 'customer', text: '네, 그렇게 해주세요.', delay: 60000 },
  { speaker: 'counselor', text: '변경 완료되었습니다. 8개월 후 약정 만료되면 다시 연락주세요. 감사합니다.', delay: 63000 },
];

// 시나리오 3: OTT 부가서비스 정리 문의
const ottCancelConversation: MockConversationItem[] = [
  { speaker: 'customer', text: '여보세요, 부가서비스 좀 정리하려고요', delay: 0 },
  { speaker: 'counselor', text: '네, SK텔레콤입니다. 부가서비스 정리 도와드리겠습니다. 본인 확인 부탁드려요.', delay: 3000 },
  { speaker: 'customer', text: '이영희, 1988년 11월 5일이요.', delay: 6500 },
  { speaker: 'counselor', text: '이영희 고객님, 확인되었습니다. 현재 넷플릭스, 디즈니+, 유튜브 프리미엄 이용 중이시네요. 어떤 서비스를 해지하실 건가요?', delay: 10000 },
  { speaker: 'customer', text: '다 쓰고는 있는데 너무 비싸서요. 월 얼마나 나가는 거예요?', delay: 15000 },
  { speaker: 'counselor', text: '네, 현재 세 개 합쳐서 월 26,850원 나가고 계세요. 넷플릭스 9,500원, 디즈니+ 6,900원, 유튜브 프리미엄 10,450원입니다.', delay: 19000 },
  { speaker: 'customer', text: '와, 거의 3만원이네요. 생각보다 많이 나가네.', delay: 25000 },
  { speaker: 'counselor', text: '네, 맞습니다. 무약정 상태라 바로 해지 가능하시고, 해지하시면 다음 달부터 즉시 요금이 줄어듭니다.', delay: 28000 },
  { speaker: 'customer', text: '유튜브는 많이 보니까 남기고, 넷플릭스랑 디즈니는 해지할게요.', delay: 34000 },
  { speaker: 'counselor', text: '네, 알겠습니다. 넷플릭스와 디즈니+ 해지하시면 월 16,400원 절약되세요. 진행할까요?', delay: 38000 },
  { speaker: 'customer', text: '네, 해지해주세요.', delay: 43000 },
  { speaker: 'counselor', text: '넷플릭스, 디즈니+ 해지 완료되었습니다. 다음 달부터 유튜브 프리미엄 10,450원만 청구됩니다.', delay: 46000 },
  { speaker: 'customer', text: '감사합니다!', delay: 51000 },
  { speaker: 'counselor', text: '네, 이영희 고객님. 다른 문의사항 있으시면 언제든 연락주세요. 감사합니다.', delay: 54000 },
];

// 시나리오 4: 가족 결합 해지 문의
const familyCancelConversation: MockConversationItem[] = [
  { speaker: 'customer', text: '안녕하세요, 가족 결합 해지 문의드립니다', delay: 0 },
  { speaker: 'counselor', text: '네, SK텔레콤 고객센터입니다. 가족 결합 해지 문의시군요. 본인 확인 부탁드립니다.', delay: 3000 },
  { speaker: 'customer', text: '박철수, 1975년 6월 10일입니다.', delay: 6500 },
  { speaker: 'counselor', text: '박철수 고객님, 확인되었습니다. 현재 4인 가족 결합 + 인터넷 + TV 트리플 결합 이용 중이시네요. 어떤 부분을 해지하실 건가요?', delay: 10000 },
  { speaker: 'customer', text: '제가 다른 통신사로 이동하려고 하는데, 가족 결합만 빠지면 되나요?', delay: 16000 },
  { speaker: 'counselor', text: '아, 고객님. 가족 결합에서 한 분이 빠지시면 연쇄 효과가 있어서 미리 안내드릴게요.', delay: 20000 },
  { speaker: 'customer', text: '연쇄 효과요? 무슨 말씀이세요?', delay: 25000 },
  { speaker: 'counselor', text: '네, 현재 4인 결합으로 1인당 11,000원 할인 받고 계세요. 3인으로 줄면 할인이 8,800원으로 줄어서, 나머지 가족분들도 매달 2,200원씩 더 내시게 됩니다.', delay: 28000 },
  { speaker: 'customer', text: '아... 가족들한테도 영향이 가는군요.', delay: 35000 },
  { speaker: 'counselor', text: '네, 그리고 트리플 결합도 해제되어서 인터넷 할인 11,000원, TV 할인 7,700원도 없어져요. 합치면 가족 전체로 월 7만원 이상 추가 부담이 생깁니다.', delay: 38000 },
  { speaker: 'customer', text: '7만원이요? 그렇게 많이요?', delay: 45000 },
  { speaker: 'counselor', text: '네, 가족 결합 할인 손실이 커서요. 혹시 다른 통신사 조건이 어떻게 되세요? 비교해드릴 수 있어요.', delay: 48000 },
  { speaker: 'customer', text: '그쪽에서 월 2만원 정도 싸다고 하던데...', delay: 54000 },
  { speaker: 'counselor', text: '고객님만 2만원 절약되셔도, 가족 전체로 보면 5만원 이상 손해예요. 가족분들과 상의해보시는 게 좋을 것 같습니다.', delay: 57000 },
  { speaker: 'customer', text: '그렇네요... 가족들이랑 얘기해보고 다시 연락드릴게요.', delay: 63000 },
  { speaker: 'counselor', text: '네, 박철수 고객님. 결정하시면 언제든 연락주세요. 상담 감사합니다.', delay: 66000 },
];

// 전체 데모 시나리오 목록
export const DEMO_SCENARIOS: DemoScenarioConfig[] = [
  {
    id: 'plan-change',
    name: '요금제 변경',
    description: '5G 프라임 → 5G 슬림 다운그레이드',
    conversation: planChangeConversation,
  },
  {
    id: 'premium-cancel',
    name: '프리미엄 약정 해지',
    description: '5G 프리미엄 + 24개월 약정 해지 문의 (위약금 발생)',
    conversation: premiumCancelConversation,
  },
  {
    id: 'ott-cancel',
    name: 'OTT 서비스 정리',
    description: '넷플릭스 + 디즈니+ + 유튜브 정리 (즉시 절감)',
    conversation: ottCancelConversation,
  },
  {
    id: 'family-cancel',
    name: '가족 결합 해지',
    description: '4인 가족 결합 + 트리플 결합 해지 (연쇄 효과)',
    conversation: familyCancelConversation,
  },
];

export function useMockSTT(scenarioId: string = 'plan-change') {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const { addTranscript, clearTranscripts, setStreaming } = useTranscriptStore();

  // 현재 선택된 시나리오
  const currentScenario = DEMO_SCENARIOS.find(s => s.id === scenarioId) || DEMO_SCENARIOS[0];
  const mockConversation = currentScenario.conversation;

  const startConversation = useCallback(() => {
    clearTranscripts();
    setIsPlaying(true);
    setStreaming(true);
    setCurrentIndex(0);

    // 타이머로 순차 재생
    mockConversation.forEach((item, index) => {
      const timeout = setTimeout(() => {
        const entry: TranscriptEntry = {
          id: `transcript-${Date.now()}-${index}`,
          speaker: item.speaker,
          text: item.text,
          isFinal: true,
          timestamp: new Date(),
        };
        addTranscript(entry);
        setCurrentIndex(index + 1);

        // 마지막 항목이면 종료
        if (index === mockConversation.length - 1) {
          setIsPlaying(false);
          setStreaming(false);
        }
      }, item.delay);

      timeoutsRef.current.push(timeout);
    });
  }, [addTranscript, clearTranscripts, setStreaming, mockConversation]);

  const stopConversation = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsPlaying(false);
    setStreaming(false);
  }, [setStreaming]);

  const resetConversation = useCallback(() => {
    stopConversation();
    clearTranscripts();
    setCurrentIndex(0);
  }, [stopConversation, clearTranscripts]);

  return {
    isPlaying,
    currentIndex,
    totalCount: mockConversation.length,
    currentScenario,
    startConversation,
    stopConversation,
    resetConversation,
  };
}
