# 실시간 자막 기능 가이드

## 개요

OpenAI Realtime API를 WebRTC 방식으로 사용하여 실시간 음성 인식 및 자막 생성 기능을 구현했습니다.

## 구현 내용

### 1. 백엔드 API

**`/src/app/api/realtime/session/route.ts`**

- OpenAI Realtime API의 ephemeral token을 발급하는 엔드포인트
- 클라이언트가 WebRTC 연결을 위해 필요한 임시 인증 토큰 제공
- Whisper-1 모델을 사용한 한국어 음성 전사 설정

### 2. 프론트엔드 Hook

**`/src/features/transcript/hooks/useRealtimeSTT.ts`**

WebRTC 기반 실시간 음성 인식 기능을 제공하는 React Hook:

- **WebRTC 연결 관리**: RTCPeerConnection을 통한 실시간 오디오 스트리밍
- **마이크 입력**: getUserMedia API로 마이크 접근 및 오디오 트랙 추가
- **데이터 채널**: 'oai-events' 데이터 채널을 통한 이벤트 송수신
- **실시간 전사**: OpenAI Realtime API의 음성 전사 이벤트 수신 및 처리
- **상태 관리**: Zustand store를 통한 전사 결과 저장

#### 주요 기능

```typescript
const {
  isConnected,    // WebRTC 연결 상태
  isConnecting,   // 연결 진행 중
  error,          // 에러 메시지
  startConnection, // 연결 시작
  stopConnection,  // 연결 종료
} = useRealtimeSTT({ speaker: 'customer' | 'counselor' });
```

### 3. UI 컴포넌트

**`/src/features/transcript/components/RealtimeSTTControls.tsx`**

실시간 STT 제어 UI:

- 고객/상담사 마이크 버튼
- 연결 상태 표시 (연결 중, 인식 중)
- 에러 메시지 표시
- 실시간 피드백 애니메이션

### 4. 대시보드 통합

**`/src/app/dashboard/page.tsx`**

- "실시간" 모드 선택 시 `RealtimeSTTControls` 활성화
- 고객 또는 상담사 음성을 선택하여 실시간 인식
- 전사 결과는 `ConversationStream`에 실시간 표시

## 사용 방법

### 1. 환경 설정

`.env` 파일에 OpenAI API 키가 설정되어 있는지 확인:

```env
OPENAI_API_KEY=sk-proj-...
```

### 2. 실시간 자막 시작

1. 대시보드에서 **"실시간"** 모드 선택
2. **"상담 시작"** 버튼 클릭
3. **"고객"** 또는 **"상담사"** 마이크 버튼 클릭
4. 브라우저에서 마이크 권한 허용
5. 연결이 완료되면 실시간 음성 인식 시작

### 3. 작동 원리

```
[사용자 음성]
    ↓
[브라우저 마이크] → getUserMedia API
    ↓
[WebRTC PeerConnection] → 오디오 트랙 추가
    ↓
[OpenAI Realtime API] → Whisper-1 음성 전사
    ↓
[Data Channel] → 전사 이벤트 수신
    ↓
[Zustand Store] → 상태 저장
    ↓
[UI 렌더링] → 실시간 자막 표시
```

## 주요 이벤트

Realtime API에서 수신하는 주요 이벤트:

- `session.created`: 세션 생성 완료
- `session.updated`: 세션 설정 업데이트
- `input_audio_buffer.speech_started`: 음성 입력 시작 감지
- `input_audio_buffer.speech_stopped`: 음성 입력 중지 감지
- `conversation.item.input_audio_transcription.delta`: 실시간 전사 진행 중
- `conversation.item.input_audio_transcription.completed`: 전사 완료
- `conversation.item.created`: 대화 아이템 생성
- `error`: 에러 발생

## 기술 스택

- **OpenAI Realtime API**: gpt-realtime 모델 + Whisper-1 전사
- **WebRTC**: RTCPeerConnection, RTCDataChannel
- **React Hooks**: 상태 관리 및 생명주기
- **Zustand**: 전역 상태 관리
- **Next.js API Routes**: 서버사이드 토큰 발급

## 참고 자료

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebRTC API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- `documents/Realtime_api.md`: OpenAI Realtime API WebRTC 가이드

## 주의사항

1. **브라우저 호환성**: WebRTC를 지원하는 최신 브라우저 필요 (Chrome, Firefox, Safari 등)
2. **마이크 권한**: 사용자가 마이크 권한을 허용해야 함
3. **HTTPS 필요**: 프로덕션 환경에서는 HTTPS 연결 필수
4. **동시 연결**: 고객/상담사 중 하나만 동시에 인식 가능 (현재 구현)
5. **API 비용**: OpenAI Realtime API 사용 시 과금 발생

## 향후 개선 사항

- [ ] 양방향 동시 음성 인식 지원
- [ ] 화자 분리 (diarization) 자동화
- [ ] 전사 정확도 향상을 위한 커스텀 어휘/문맥 추가
- [ ] 네트워크 끊김 시 자동 재연결
- [ ] 전사 결과 실시간 편집 기능
