'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface UseRealtimeSTTOptions {
  speaker: 'customer' | 'counselor';
}

export function useRealtimeSTT(options: UseRealtimeSTTOptions) {
  const { speaker } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const { addTranscript, updateInterim, finalizeInterim, setStreaming } = useTranscriptStore();

  // 이벤트 핸들러
  const handleServerEvent = useCallback((event: MessageEvent) => {
    try {
      const serverEvent = JSON.parse(event.data);
      console.log('Server event:', serverEvent);

      // 음성 전사 완료 이벤트
      if (serverEvent.type === 'conversation.item.input_audio_transcription.completed') {
        const transcription = serverEvent.transcript;
        if (transcription && transcription.trim()) {
          const entry: TranscriptEntry = {
            id: `transcript-${Date.now()}`,
            speaker,
            text: transcription.trim(),
            isFinal: true,
            timestamp: new Date(),
          };
          addTranscript(entry);
        }
      }

      // 실시간 전사 진행 중 (델타)
      if (serverEvent.type === 'conversation.item.input_audio_transcription.delta') {
        const delta = serverEvent.delta;
        if (delta) {
          const entry: TranscriptEntry = {
            id: `interim-${Date.now()}`,
            speaker,
            text: delta,
            isFinal: false,
            timestamp: new Date(),
          };
          updateInterim(entry);
        }
      }

      // 음성 입력 중지 감지
      if (serverEvent.type === 'input_audio_buffer.speech_stopped') {
        console.log('Speech stopped');
      }

      // 음성 입력 시작 감지
      if (serverEvent.type === 'input_audio_buffer.speech_started') {
        console.log('Speech started');
      }

      // 대화 아이템 생성됨
      if (serverEvent.type === 'conversation.item.created') {
        console.log('Conversation item created:', serverEvent.item);

        // 사용자 메시지의 전사본 확인
        if (serverEvent.item?.type === 'message' &&
            serverEvent.item?.role === 'user' &&
            serverEvent.item?.content) {
          serverEvent.item.content.forEach((content: any) => {
            if (content.type === 'input_audio' && content.transcript) {
              const entry: TranscriptEntry = {
                id: `transcript-${Date.now()}`,
                speaker,
                text: content.transcript.trim(),
                isFinal: true,
                timestamp: new Date(),
              };
              addTranscript(entry);
            }
          });
        }
      }

      // 세션 생성됨
      if (serverEvent.type === 'session.created') {
        console.log('Session created:', serverEvent.session);
      }

      // 세션 업데이트됨
      if (serverEvent.type === 'session.updated') {
        console.log('Session updated:', serverEvent.session);
      }

      // 에러 처리
      if (serverEvent.type === 'error') {
        console.error('Realtime API error:', serverEvent.error);
        setError(serverEvent.error?.message || 'Unknown error');
      }

    } catch (err) {
      console.error('Failed to parse server event:', err);
    }
  }, [speaker, addTranscript, updateInterim, finalizeInterim]);

  // WebRTC 연결 시작
  const startConnection = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);

      // 1. Ephemeral token 가져오기
      const tokenResponse = await fetch('/api/realtime/session', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get session token');
      }

      const tokenData = await tokenResponse.json();
      const ephemeralKey = tokenData.value;

      if (!ephemeralKey) {
        throw new Error('No ephemeral key received');
      }

      // 2. RTCPeerConnection 생성
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // 3. 오디오 재생 설정 (모델의 응답 재생)
      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElementRef.current = audioElement;

      pc.ontrack = (e) => {
        console.log('Received remote track:', e.streams[0]);
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // 4. 마이크 입력 추가
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // 5. Data channel 설정 (이벤트 송수신)
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log('Data channel opened');
        setIsConnected(true);
        setIsConnecting(false);
        setStreaming(true);

        // 세션 업데이트: 음성 전사 활성화 및 한국어 설정
        const updateEvent = {
          type: 'session.update',
          session: {
            instructions:
              'You are a transcription assistant for a Korean call center. Accurately transcribe Korean speech in real-time. Do not respond - only transcribe.',
            audio: {
              input: {
                transcription: {
                  model: 'whisper-1',
                },
              },
            },
          },
        };
        dc.send(JSON.stringify(updateEvent));
        console.log('Session update sent:', updateEvent);
      };

      dc.onclose = () => {
        console.log('Data channel closed');
        setIsConnected(false);
        setStreaming(false);
      };

      dc.onerror = (e) => {
        console.error('Data channel error:', e);
        setError('Data channel error');
      };

      dc.onmessage = handleServerEvent;

      // 6. SDP 교환
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to establish WebRTC connection');
      }

      const answerSdp = await sdpResponse.text();
      const answer: RTCSessionDescriptionInit = {
        type: 'answer',
        sdp: answerSdp,
      };

      await pc.setRemoteDescription(answer);

      console.log('WebRTC connection established');

    } catch (err) {
      console.error('Failed to start connection:', err);
      setError(err instanceof Error ? err.message : 'Failed to start connection');
      setIsConnecting(false);
      setIsConnected(false);

      // 정리
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    }
  }, [speaker, handleServerEvent, setStreaming]);

  // 연결 종료
  const stopConnection = useCallback(() => {
    // Data channel 닫기
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Peer connection 닫기
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Audio element 정리
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setStreaming(false);
  }, [setStreaming]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopConnection();
    };
  }, [stopConnection]);

  return {
    isConnected,
    isConnecting,
    error,
    startConnection,
    stopConnection,
  };
}
