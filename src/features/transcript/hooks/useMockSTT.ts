'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface MockConversationItem {
  speaker: 'customer' | 'counselor';
  text: string;
  delay: number;
}

// SK텔레콤 요금제 변경 문의 시나리오
const mockConversation: MockConversationItem[] = [
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
  { speaker: 'customer', text: '네, 감사합니다. 혹시 T멤버십 포인트 사용하려면 어떻게 해야 하나요?', delay: 39000 },
  { speaker: 'counselor', text: 'T멤버십 포인트는 T월드 앱이나 제휴 매장에서 바로 사용 가능하세요. 현재 고객님 포인트가 3,500점 적립되어 있습니다.', delay: 43000 },
  { speaker: 'customer', text: '아, 그렇구나. 알겠습니다. 감사합니다.', delay: 48000 },
  { speaker: 'counselor', text: '네, 김민수 고객님. 더 필요하신 사항 있으시면 언제든 문의해 주세요. SK텔레콤을 이용해 주셔서 감사합니다. 좋은 하루 되세요.', delay: 51000 },
];

export function useMockSTT() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const { addTranscript, clearTranscripts, setStreaming } = useTranscriptStore();

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
  }, [addTranscript, clearTranscripts, setStreaming]);

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
    startConversation,
    stopConversation,
    resetConversation,
  };
}
