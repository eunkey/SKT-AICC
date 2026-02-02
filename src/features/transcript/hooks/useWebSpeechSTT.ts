'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface UseWebSpeechSTTOptions {
  speaker: 'customer' | 'counselor';
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export function useWebSpeechSTT(options: UseWebSpeechSTTOptions) {
  const {
    speaker,
    language = 'ko-KR',
    continuous = true,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef<string>('');
  const finalTranscriptRef = useRef<string>('');

  const { addTranscript, updateInterim, setStreaming } = useTranscriptStore();

  // 브라우저 지원 확인 및 초기화
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.');
      return;
    }

    console.log('🎤 Initializing Web Speech API for:', speaker);

    // Speech Recognition 초기화
    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    console.log('📋 Speech Recognition config:', {
      lang: language,
      continuous,
      interimResults,
      speaker,
    });

    // 결과 이벤트
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      console.log('Speech recognition result:', event.results);

      // 모든 결과 처리
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // 실시간 자막 (중간 결과) - 매번 새로운 객체 생성
      if (interimTranscript) {
        console.log(`[${speaker}] Interim:`, interimTranscript);
        interimTranscriptRef.current = interimTranscript;
        const entry: TranscriptEntry = {
          id: `interim-${speaker}-${Date.now()}`, // 매번 새로운 ID
          speaker,
          text: interimTranscript,
          isFinal: false,
          timestamp: new Date(),
        };
        updateInterim(entry);
      }

      // 최종 자막
      if (finalTranscript) {
        console.log(`[${speaker}] Final:`, finalTranscript);
        finalTranscriptRef.current += finalTranscript;
        const entry: TranscriptEntry = {
          id: `transcript-${Date.now()}`,
          speaker,
          text: finalTranscript.trim(),
          isFinal: true,
          timestamp: new Date(),
        };
        addTranscript(entry);

        // 중간 결과 초기화
        interimTranscriptRef.current = '';
      }
    };

    // 음성 입력 시작
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setStreaming(true);
      setError(null);
    };

    // 음성 입력 종료
    recognition.onend = () => {
      console.log('Speech recognition ended');

      // continuous 모드이고 여전히 listening 상태면 자동 재시작
      if (continuous && isListening) {
        try {
          recognition.start();
        } catch (err) {
          console.log('Recognition already started or ended');
        }
      } else {
        setIsListening(false);
        setStreaming(false);
      }
    };

    // 에러 처리
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);

      // 일부 에러는 무시 (no-speech는 정상)
      if (event.error === 'no-speech') {
        return;
      }

      if (event.error === 'aborted') {
        return;
      }

      setError(`음성 인식 오류: ${event.error}`);

      // 권한 거부 등의 치명적 에러는 중지
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        setStreaming(false);
      }
    };

    // 음성 입력 시작 감지
    recognition.onspeechstart = () => {
      console.log('Speech started');
    };

    // 음성 입력 종료 감지
    recognition.onspeechend = () => {
      console.log('Speech ended');
    };

    // 오디오 캡처 시작
    recognition.onaudiostart = () => {
      console.log('Audio capturing started');
    };

    // 오디오 캡처 종료
    recognition.onaudioend = () => {
      console.log('Audio capturing ended');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.log('Recognition cleanup error (safe to ignore):', err);
        }
      }
    };
  }, [language, continuous, interimResults, speaker, addTranscript, updateInterim, setStreaming]);

  // 음성 인식 시작
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('음성 인식이 지원되지 않습니다.');
      return;
    }

    if (!recognitionRef.current) {
      setError('음성 인식이 초기화되지 않았습니다.');
      return;
    }

    try {
      interimTranscriptRef.current = '';
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      // 이미 시작된 경우 무시
      if (err instanceof Error && err.message.includes('already started')) {
        setIsListening(true);
        setStreaming(true);
      } else {
        setError('음성 인식을 시작할 수 없습니다.');
      }
    }
  }, [isSupported, setStreaming]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        setStreaming(false);
      } catch (err) {
        console.error('Failed to stop recognition:', err);
      }
    }
  }, [setStreaming]);

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
