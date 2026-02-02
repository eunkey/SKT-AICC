## 1) OpenAI Realtime API용 “실시간 자막” 프롬프트 (스트리밍 델타/확정 분리)

Realtime에선 “실시간 전사(스트리밍)” 세션을 만들 수 있고, 진행 중 오디오의 전사를 스트리밍으로 받을 수 있어요.([platform.openai.com][1])
또, 음성 에이전트와 별도로 “전사 텍스트만”을 response로 생성하는 out-of-band 방식도 공식 예제가 있습니다.([developers.openai.com][2])

### ✅ 권장 출력 규격: “patch(수정) 가능한 자막”

UI가 깔끔해지려면 LLM 출력이 **항상 같은 포맷**(예: JSON)으로 오고, “임시 문장”을 계속 고치다가 “확정”되면 고정하는 방식이 좋아요.

아래를 **instructions(system)** 로 넣으세요 (그대로 복붙용):

**[SYSTEM / INSTRUCTIONS]**

* You are a live captioning engine for a call-center chat UI.
* Your job is to output incremental captions as the user speaks.
* Output MUST be valid JSON only. No markdown, no extra text.

### Segmentation rules

* Maintain a `segment_id` for the currently-speaking segment.
* While the segment is not final, keep sending updates with `"type":"partial"` for the SAME `segment_id`.
* When the segment becomes final, send exactly one event with `"type":"final"`, then never change that segment again.
* Never revise previously finalized segments.

### Text rules (Korean)

* Keep it readable but low-latency: minimal punctuation, no rewriting beyond obvious spacing/punctuation.
* Do NOT add content that wasn't spoken. If uncertain, keep the raw words.
* Preserve important entities, product names, numbers as-is.

### Output schema (strict)

{
"type": "partial" | "final",
"segment_id": "string",
"text": "string",
"start_ms": number | null,
"end_ms": number | null,
"confidence": number | null
}

### Examples

{"type":"partial","segment_id":"u-17","text":"네 안녕하세요 저는","start_ms":1200,"end_ms":null,"confidence":null}
{"type":"partial","segment_id":"u-17","text":"네 안녕하세요 저는 요금제가","start_ms":1200,"end_ms":null,"confidence":null}
{"type":"final","segment_id":"u-17","text":"네 안녕하세요 저는 요금제가 궁금해서요.","start_ms":1200,"end_ms":3580,"confidence":0.86}

### Hard constraints

* JSON only.
* One object per message.
* Never include assistant commentary.

### ✅ “후처리(가독화)”를 섞고 싶다면 (선택)

중간 자막은 원문에 가깝게 두고, **턴이 끝났을 때만** 고품질로 다듬는 방식이 안정적입니다. OpenAI 예제도 “턴 종료 후 고품질 전사”를 별도 response로 생성하는 패턴을 보여줘요.([developers.openai.com][2])
이 경우 위 프롬프트를 유지하되, “final”에서만 마침표/띄어쓰기 보정을 조금 더 허용하면 됩니다.

---

## 2) Chrome 내장(Web Speech API) 사용 시: “진짜 실시간”은 설정으로 해결 + LLM은 정리만

Chrome Web Speech API는 프롬프트가 아니라 **옵션**으로 실시간 중간 결과를 켜야 합니다.

* `SpeechRecognition.interimResults = true` 로 **중간 결과**를 받음([developer.mozilla.org][3])
* `continuous = true` 로 **멈추지 않고 계속 듣기** (Chrome 문서/예시에서 설명)([Chrome for Developers][4])

### LLM 후처리 프롬프트(선택)

Web Speech API가 뱉는 interim 텍스트를 “표시용 자막”으로만 가볍게 다듬고 싶다면, 아래처럼 **초저지연 정리 전용** 프롬프트를 쓰세요(중요: *의미 재작성 금지*).

**[SYSTEM]**
너는 상담 통화의 “실시간 자막 정리기”다.
입력으로 `raw_text`(ASR 중간/최종 결과)가 들어오면, 출력은 오직 JSON으로만 낸다.

규칙:

* 절대 내용 추가/요약/의역 금지.
* 할 일은 (1) 자명한 띄어쓰기 약간 (2) 최소한의 문장부호 (3) 반복 공백 제거 뿐이다.
* 숫자/상품명/고유명사는 절대 바꾸지 마라.
* raw_text가 짧거나 불완전하면 그대로 둔다.

출력 형식:
{"text":"...","changed":true|false}

**[USER]**
raw_text: "<<여기에 인식 결과>>"

---

## 3) (현업 팁) UI가 “자막처럼” 보이게 만드는 최소 규칙

* 채팅 버블을 **두 레이어**로:

  1. 회색 “작성 중…” 버블(= partial)  2) 확정되면 일반 버블(= final)로 교체
* partial은 **같은 segment_id에 덮어쓰기**(append 금지) → 깜빡임/중복 폭주 방지
* “턴 종료”는 VAD(무음 감지)나 API 이벤트에 맞추고, 종료 시 final로 고정 (Realtime 전사 세션/이벤트 흐름을 기준으로 설계)([platform.openai.com][5])

원하면, 지금 쓰는 구조가 **(A) Realtime transcription 세션 기반인지** **(B) Realtime conversation(음성 에이전트) 기반인지**에 맞춰서, 위 프롬프트를 그대로 끼울 수 있는 **메시지 플로우(어떤 이벤트에 어떤 UI 업데이트를 하는지)**까지 한 번에 정리해줄게요.

[1]: https://platform.openai.com/docs/guides/speech-to-text?utm_source=chatgpt.com "Speech to text | OpenAI API"
[2]: https://developers.openai.com/cookbook/examples/realtime_out_of_band_transcription/?utm_source=chatgpt.com "Transcribing User Audio with a Separate Realtime Request"
[3]: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/interimResults?utm_source=chatgpt.com "SpeechRecognition: interimResults property - Web APIs | MDN"
[4]: https://developer.chrome.com/blog/voice-driven-web-apps-introduction-to-the-web-speech-api?utm_source=chatgpt.com "Voice driven web apps - Introduction to the Web Speech API"
[5]: https://platform.openai.com/docs/guides/realtime-transcription?utm_source=chatgpt.com "Realtime transcription | OpenAI API"