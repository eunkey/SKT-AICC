'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAIConversation() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingAudioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isListeningRef = useRef(false);

  const { addTranscript, setStreaming } = useTranscriptStore();

  // 오디오 재생용 AudioContext 가져오기 또는 생성
  const getPlaybackAudioContext = useCallback(async (): Promise<AudioContext> => {
    if (!playbackAudioContextRef.current || playbackAudioContextRef.current.state === 'closed') {
      playbackAudioContextRef.current = new AudioContext();
    }

    if (playbackAudioContextRef.current.state === 'suspended') {
      await playbackAudioContextRef.current.resume();
    }

    return playbackAudioContextRef.current;
  }, []);

  // 오디오 레벨 체크 (무음 감지용)
  const checkAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    return dataArray.reduce((a, b) => a + b) / dataArray.length;
  }, []);

  // Web Audio API를 사용하여 TTS 오디오 재생
  const playTTSAudio = useCallback(async (text: string): Promise<void> => {
    setIsSpeaking(true);

    try {
      // TTS API 호출
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      // ArrayBuffer로 가져오기
      const arrayBuffer = await response.arrayBuffer();

      // AudioContext 가져오기
      const audioContext = await getPlaybackAudioContext();

      // 오디오 디코딩
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // 재생
      return new Promise((resolve) => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        currentSourceRef.current = source;

        source.onended = () => {
          setIsSpeaking(false);
          currentSourceRef.current = null;
          resolve();
        };

        source.start(0);
      });
    } catch (err) {
      console.error('TTS playback error:', err);
      setIsSpeaking(false);
      // TTS 실패해도 대화는 계속 진행
    }
  }, [getPlaybackAudioContext]);

  // AI 응답 생성 및 재생
  const generateAndPlayResponse = useCallback(async (customerMessage: string) => {
    setIsProcessing(true);

    try {
      // 1. 대화 히스토리에 고객 메시지 추가
      conversationHistoryRef.current.push({
        role: 'user',
        content: customerMessage,
      });

      // 2. AI 응답 생성
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

      // 3. 대화 히스토리에 AI 응답 추가
      conversationHistoryRef.current.push({
        role: 'assistant',
        content: aiResponse,
      });

      // 4. 상담사(AI) 응답을 트랜스크립트에 추가
      const counselorEntry: TranscriptEntry = {
        id: `transcript-ai-${Date.now()}`,
        speaker: 'counselor',
        text: aiResponse,
        isFinal: true,
        timestamp: new Date(),
      };
      addTranscript(counselorEntry);

      setIsProcessing(false);

      // 5. TTS로 음성 재생
      await playTTSAudio(aiResponse);

    } catch (err) {
      console.error('AI response error:', err);
      setError(err instanceof Error ? err.message : 'AI response failed');
      setIsProcessing(false);
    }
  }, [addTranscript, playTTSAudio]);

  // 고객 음성을 텍스트로 변환
  const transcribeCustomerAudio = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) {
      console.log('Audio too short, skipping');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('speaker', 'customer');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const { text } = await response.json();

      if (text && text.trim()) {
        // 고객 발화 트랜스크립트에 추가
        const customerEntry: TranscriptEntry = {
          id: `transcript-customer-${Date.now()}`,
          speaker: 'customer',
          text: text.trim(),
          isFinal: true,
          timestamp: new Date(),
        };
        addTranscript(customerEntry);

        // AI 응답 생성 및 재생
        await generateAndPlayResponse(text.trim());
      } else {
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
      setIsProcessing(false);
    }
  }, [addTranscript, generateAndPlayResponse]);

  // 새 녹음 시작 (기존 스트림 사용)
  const startNewRecording = useCallback(() => {
    if (!streamRef.current || !isListeningRef.current) return;

    try {
      const newRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = newRecorder;
      audioChunksRef.current = [];

      newRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      newRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (isListeningRef.current) {
          await transcribeCustomerAudio(audioBlob);

          // 처리 완료 후 새 녹음 시작
          if (isListeningRef.current && streamRef.current) {
            setTimeout(() => {
              if (isListeningRef.current) {
                startNewRecording();
              }
            }, 300);
          }
        }
      };

      newRecorder.start(100);

      // 무음 감지 루프
      const detectSilence = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording' || !isListeningRef.current) {
          return;
        }

        const level = checkAudioLevel();

        if (level < 10) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (mediaRecorderRef.current?.state === 'recording' && audioChunksRef.current.length > 0) {
                mediaRecorderRef.current.stop();
              }
              silenceTimerRef.current = null;
            }, 1500);
          }
        } else {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }

        if (isListeningRef.current) {
          requestAnimationFrame(detectSilence);
        }
      };

      detectSilence();
    } catch (err) {
      console.error('Failed to start new recording:', err);
    }
  }, [checkAudioLevel, transcribeCustomerAudio]);

  // 녹음 시작
  const startListening = useCallback(async () => {
    try {
      setError(null);

      // 오디오 재생 컨텍스트 미리 초기화 및 활성화 (사용자 상호작용)
      const audioContext = await getPlaybackAudioContext();

      // 무음 재생으로 오디오 컨텍스트 완전히 활성화
      const silentBuffer = audioContext.createBuffer(1, 1, 22050);
      const silentSource = audioContext.createBufferSource();
      silentSource.buffer = silentBuffer;
      silentSource.connect(audioContext.destination);
      silentSource.start();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;
      isListeningRef.current = true;

      // 오디오 분석 설정
      recordingAudioContextRef.current = new AudioContext();
      const source = recordingAudioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = recordingAudioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      setIsRecording(true);
      setStreaming(true);

      // 첫 녹음 시작
      startNewRecording();

    } catch (err) {
      console.error('Failed to start listening:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
      isListeningRef.current = false;
    }
  }, [getPlaybackAudioContext, setStreaming, startNewRecording]);

  // 녹음 중지
  const stopListening = useCallback(() => {
    isListeningRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (recordingAudioContextRef.current) {
      recordingAudioContextRef.current.close();
      recordingAudioContextRef.current = null;
    }

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // ignore
      }
      currentSourceRef.current = null;
    }

    setIsRecording(false);
    setIsSpeaking(false);
    setStreaming(false);
  }, [setStreaming]);

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
