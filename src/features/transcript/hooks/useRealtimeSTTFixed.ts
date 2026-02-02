'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { useTranscriptStore, TranscriptEntry } from '@/stores';

interface UseRealtimeSTTFixedOptions {
  speaker: 'customer' | 'counselor';
}

export function useRealtimeSTTFixed(options: UseRealtimeSTTFixedOptions) {
  const { speaker } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const currentSegmentIdRef = useRef<string>('');

  const { addTranscript, updateInterim, setStreaming } = useTranscriptStore();

  // 이벤트 핸들러
  const handleServerEvent = useCallback((event: MessageEvent) => {
    try {
      const serverEvent = JSON.parse(event.data);
      console.log(`[${speaker}] 📨 Server event:`, serverEvent.type, serverEvent);

      // 세션 생성
      if (serverEvent.type === 'session.created') {
        console.log(`[${speaker}] ✅ Session created`);
      }

      // 세션 업데이트 완료
      if (serverEvent.type === 'session.updated') {
        console.log(`[${speaker}] ✅ Session updated - transcription enabled`);
      }

      // 음성 입력 시작
      if (serverEvent.type === 'input_audio_buffer.speech_started') {
        console.log(`[${speaker}] 🗣️ Speech started`);
        // 새로운 세그먼트 시작
        currentSegmentIdRef.current = `${speaker}-${Date.now()}`;
      }

      // 음성 입력 중지
      if (serverEvent.type === 'input_audio_buffer.speech_stopped') {
        console.log(`[${speaker}] 🤐 Speech stopped`);
      }

      // 🔥 핵심: 전사 진행 중 (실시간 partial)
      if (serverEvent.type === 'conversation.item.input_audio_transcription.delta') {
        const delta = serverEvent.delta;
        if (delta) {
          console.log(`[${speaker}] ⏳ INTERIM delta:`, delta);

          // 임시 자막 업데이트
          const entry: TranscriptEntry = {
            id: currentSegmentIdRef.current,
            speaker,
            text: delta,
            isFinal: false,
            timestamp: new Date(),
          };
          updateInterim(entry);
        }
      }

      // 🔥 핵심: 전사 완료 (최종 확정)
      if (serverEvent.type === 'conversation.item.input_audio_transcription.completed') {
        const transcript = serverEvent.transcript;
        if (transcript && transcript.trim()) {
          console.log(`[${speaker}] ✅ FINAL transcript:`, transcript);

          // 최종 자막 저장
          const entry: TranscriptEntry = {
            id: `transcript-${Date.now()}`,
            speaker,
            text: transcript.trim(),
            isFinal: true,
            timestamp: new Date(),
          };
          addTranscript(entry);
        }
      }

      // 대화 아이템 생성 (백업)
      if (serverEvent.type === 'conversation.item.created') {
        const item = serverEvent.item;
        if (item?.type === 'message' && item?.role === 'user') {
          console.log(`[${speaker}] 💬 Conversation item:`, item);

          // content 배열에서 전사본 추출
          item.content?.forEach((content: any) => {
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

      // 에러 처리
      if (serverEvent.type === 'error') {
        console.error(`[${speaker}] ❌ API Error:`, serverEvent.error);
        setError(serverEvent.error?.message || 'Unknown error');
      }

    } catch (err) {
      console.error(`[${speaker}] Failed to parse event:`, err);
    }
  }, [speaker, addTranscript, updateInterim]);

  // WebRTC 연결 시작
  const startConnection = useCallback(async () => {
    try {
      setError(null);
      setIsConnecting(true);
      console.log(`[${speaker}] 🚀 Starting Realtime connection...`);

      // 1. Ephemeral token 가져오기
      console.log(`[${speaker}] 🔑 Fetching ephemeral token...`);
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

      console.log(`[${speaker}] ✅ Got ephemeral token`);

      // 2. RTCPeerConnection 생성
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // 3. 오디오 재생 설정
      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElementRef.current = audioElement;

      pc.ontrack = (e) => {
        console.log(`[${speaker}] 🎵 Received remote track`);
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // 4. 마이크 입력 추가
      console.log(`[${speaker}] 🎤 Requesting microphone access...`);
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

      console.log(`[${speaker}] ✅ Microphone added to peer connection`);

      // 5. Data channel 설정
      const dc = pc.createDataChannel('oai-events');
      dataChannelRef.current = dc;

      dc.onopen = () => {
        console.log(`[${speaker}] 📡 Data channel opened`);
        setIsConnected(true);
        setIsConnecting(false);
        setStreaming(true);

        // 🔥 세션 업데이트: 실시간 전사 활성화
        const updateEvent = {
          type: 'session.update',
          session: {
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            input_audio_transcription: {
              model: 'whisper-1',
            },
          },
        };

        console.log(`[${speaker}] 📤 Sending session.update:`, updateEvent);
        dc.send(JSON.stringify(updateEvent));
      };

      dc.onclose = () => {
        console.log(`[${speaker}] 📡 Data channel closed`);
        setIsConnected(false);
        setStreaming(false);
      };

      dc.onerror = (e) => {
        console.error(`[${speaker}] ❌ Data channel error:`, e);
        setError('Data channel error');
      };

      dc.onmessage = handleServerEvent;

      // 6. SDP 교환
      console.log(`[${speaker}] 🤝 Creating offer...`);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log(`[${speaker}] 📤 Sending SDP to OpenAI...`);
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

      console.log(`[${speaker}] ✅ WebRTC connection established`);

    } catch (err) {
      console.error(`[${speaker}] ❌ Connection failed:`, err);
      setError(err instanceof Error ? err.message : 'Failed to start connection');
      setIsConnecting(false);
      setIsConnected(false);

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    }
  }, [speaker, handleServerEvent, setStreaming]);

  // 연결 종료
  const stopConnection = useCallback(() => {
    console.log(`[${speaker}] 🛑 Stopping connection...`);

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setStreaming(false);
  }, [speaker, setStreaming]);

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
