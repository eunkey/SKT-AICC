'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Web Speech API 타입 선언
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useAIConversation() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isListeningRef = useRef(false);

  const { addTranscript, updateInterim, setStreaming } = useTranscriptStore();

  // 오디오 재생용 AudioContext
  const getPlaybackAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (!playbackAudioContextRef.current || playbackAudioContextRef.current.state === 'closed') {
      playbackAudioContextRef.current = new AudioContext();
    }
    if (playbackAudioContextRef.current.state === 'suspended') {
      await playbackAudioContextRef.current.resume();
    }
    return playbackAudioContextRef.current;
  }, []);

  // TTS 오디오 재생
  const playTTSAudio = useCallback(async (text: string): Promise<void> => {
    setIsSpeaking(true);
    try {
      console.log('[AI대화] TTS API 호출 중...');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const arrayBuffer = await response.arrayBuffer();
      const audioContext = await getPlaybackAudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      return new Promise((resolve) => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        currentSourceRef.current = source;

        source.onended = () => {
          setIsSpeaking(false);
          currentSourceRef.current = null;
          console.log('[AI대화] TTS 재생 완료');
          resolve();
        };
        source.start(0);
      });
    } catch (err) {
      console.error('[AI대화] TTS 재생 오류:', err);
      setIsSpeaking(false);
    }
  }, [getPlaybackAudioContext]);

  // AI 응답 생성 및 재생
  const generateAndPlayResponse = useCallback(async (customerMessage: string) => {
    setIsProcessing(true);
    console.log('[AI대화] AI 응답 생성 시작');

    try {
      conversationHistoryRef.current.push({ role: 'user', content: customerMessage });

      console.log('[AI대화] Chat API 호출 중...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customerMessage,
          conversationHistory: conversationHistoryRef.current.slice(-10),
        }),
      });

      if (!chatResponse.ok) {
        const errorData = await chatResponse.json();
        throw new Error(errorData.error || 'Chat failed');
      }

      const { text: aiResponse } = await chatResponse.json();
      console.log('[AI대화] AI 응답:', aiResponse);

      conversationHistoryRef.current.push({ role: 'assistant', content: aiResponse });

      const counselorEntry: TranscriptEntry = {
        id: `transcript-ai-${Date.now()}`,
        speaker: 'counselor',
        text: aiResponse,
        isFinal: true,
        timestamp: new Date(),
      };
      addTranscript(counselorEntry);

      setIsProcessing(false);

      console.log('[AI대화] TTS 재생 시작');
      await playTTSAudio(aiResponse);

    } catch (err) {
      console.error('[AI대화] AI 응답 오류:', err);
      setError(err instanceof Error ? err.message : 'AI response failed');
      setIsProcessing(false);
    }
  }, [addTranscript, playTTSAudio]);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    try {
      setError(null);
      console.log('[AI대화] 음성 인식 시작 요청');

      // Web Speech API 지원 확인
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        throw new Error('이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.');
      }

      // 마이크 권한 명시적 요청
      console.log('[AI대화] 마이크 권한 요청 중...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('[AI대화] 마이크 권한 획득 완료');
      } catch (micErr) {
        console.error('[AI대화] 마이크 권한 거부:', micErr);
        throw new Error('마이크 권한이 필요합니다.');
      }

      // 오디오 재생 컨텍스트 초기화
      const audioContext = await getPlaybackAudioContext();
      console.log('[AI대화] AudioContext 상태:', audioContext.state);

      const silentBuffer = audioContext.createBuffer(1, 1, 22050);
      const silentSource = audioContext.createBufferSource();
      silentSource.buffer = silentBuffer;
      silentSource.connect(audioContext.destination);
      silentSource.start();

      // 음성 인식 설정
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognitionRef.current = recognition;
      isListeningRef.current = true;

      recognition.onstart = () => {
        console.log('[AI대화] 음성 인식 시작됨');
        setIsRecording(true);
        setStreaming(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            console.log('[AI대화] 최종 인식:', transcript);

            // interim 초기화
            updateInterim(null);

            // 최종 결과 추가
            const customerEntry: TranscriptEntry = {
              id: `transcript-customer-${Date.now()}`,
              speaker: 'customer',
              text: transcript.trim(),
              isFinal: true,
              timestamp: new Date(),
            };
            addTranscript(customerEntry);

            // AI 응답 생성
            recognition.stop();
            generateAndPlayResponse(transcript.trim()).then(() => {
              if (isListeningRef.current) {
                console.log('[AI대화] 음성 인식 재시작');
                setTimeout(() => {
                  if (isListeningRef.current) {
                    try {
                      recognition.start();
                    } catch (e) {
                      console.log('[AI대화] 재시작 중 오류:', e);
                    }
                  }
                }, 100);
              }
            });
          } else {
            interimTranscript += transcript;
            console.log('[AI대화] 중간 인식:', interimTranscript);

            // 실시간 중간 결과 표시
            const interimEntry: TranscriptEntry = {
              id: 'interim-customer',
              speaker: 'customer',
              text: interimTranscript,
              isFinal: false,
              timestamp: new Date(),
            };
            updateInterim(interimEntry);
          }
        }
      };

      recognition.onerror = (event: Event & { error: string }) => {
        console.error('[AI대화] 음성 인식 오류:', event.error);

        if (event.error === 'no-speech') {
          console.log('[AI대화] 음성 없음, 계속 대기...');
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'network') {
          setError('네트워크 오류: 인터넷 연결을 확인하세요 (내부망에서는 작동하지 않을 수 있습니다)');
          return;
        }

        setError(`음성 인식 오류: ${event.error}`);
      };

      recognition.onend = () => {
        console.log('[AI대화] 음성 인식 종료됨');

        if (isListeningRef.current) {
          console.log('[AI대화] 자동 재시작');
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.log('[AI대화] 재시작 실패:', e);
                setIsRecording(false);
                setStreaming(false);
              }
            }
          }, 100);
        }
      };

      recognition.start();
      console.log('[AI대화] Web Speech API 시작됨');

    } catch (err) {
      console.error('[AI대화] 음성 인식 시작 실패:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      isListeningRef.current = false;
    }
  }, [getPlaybackAudioContext, setStreaming, addTranscript, updateInterim, generateAndPlayResponse]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    console.log('[AI대화] 음성 인식 중지 요청');
    isListeningRef.current = false;

    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch { /* ignore */ }
      currentSourceRef.current = null;
    }

    updateInterim(null);
    setIsRecording(false);
    setIsSpeaking(false);
    setStreaming(false);
  }, [setStreaming, updateInterim]);

  // 대화 히스토리 초기화
  const resetConversation = useCallback(() => {
    conversationHistoryRef.current = [];
    stopListening();
  }, [stopListening]);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    error,
    startListening,
    stopListening,
    resetConversation,
  };
}
