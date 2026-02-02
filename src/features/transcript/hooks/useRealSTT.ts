'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface UseRealSTTOptions {
  speaker: 'customer' | 'counselor';
  silenceTimeout?: number; // 무음 감지 후 전송까지의 시간 (ms)
  maxRecordingTime?: number; // 최대 녹음 시간 (ms)
}

export function useRealSTT(options: UseRealSTTOptions) {
  const { speaker, silenceTimeout = 1500, maxRecordingTime = 30000 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { addTranscript, setStreaming } = useTranscriptStore();

  // 오디오 레벨 체크 (무음 감지용)
  const checkAudioLevel = useCallback(() => {
    if (!analyserRef.current) return 0;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return average;
  }, []);

  // 오디오를 서버로 전송하여 텍스트 변환
  const sendAudioForTranscription = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) {
      console.log('Audio too short, skipping');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('speaker', speaker);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        const entry: TranscriptEntry = {
          id: `transcript-${Date.now()}`,
          speaker,
          text: data.text.trim(),
          isFinal: true,
          timestamp: new Date(data.timestamp),
        };
        addTranscript(entry);
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsProcessing(false);
    }
  }, [speaker, addTranscript]);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      setError(null);

      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;

      // 오디오 분석을 위한 설정
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // MediaRecorder 설정
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        await sendAudioForTranscription(audioBlob);
      };

      // 녹음 시작
      mediaRecorder.start(100); // 100ms 간격으로 데이터 수집
      setIsRecording(true);
      setStreaming(true);

      // 무음 감지 루프
      const detectSilence = () => {
        if (!isRecording || !mediaRecorderRef.current) return;

        const level = checkAudioLevel();

        if (level < 10) { // 무음 감지 임계값
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              // 무음이 지속되면 현재 녹음 종료 후 새로 시작
              if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();

                // 새 녹음 시작
                setTimeout(() => {
                  if (streamRef.current && isRecording) {
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
                      await sendAudioForTranscription(audioBlob);
                    };

                    newRecorder.start(100);
                  }
                }, 100);
              }
              silenceTimerRef.current = null;
            }, silenceTimeout);
          }
        } else {
          // 소리가 감지되면 타이머 리셋
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }

        requestAnimationFrame(detectSilence);
      };

      detectSilence();

      // 최대 녹음 시간 타이머
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxRecordingTime);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setIsRecording(false);
    }
  }, [checkAudioLevel, sendAudioForTranscription, silenceTimeout, maxRecordingTime, setStreaming, isRecording]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    // 타이머 정리
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // MediaRecorder 중지
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // AudioContext 정리
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setStreaming(false);
  }, [setStreaming]);

  return {
    isRecording,
    isProcessing,
    error,
    startRecording,
    stopRecording,
  };
}
