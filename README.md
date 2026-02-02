# SKT AICC (AI Contact Center)

SKT 고객센터 상담원을 위한 AI 기반 실시간 상담 지원 시스템입니다.

## 주요 기능

### 1. 실시간 상담 지원
- 실시간 음성 인식 및 텍스트 변환 (STT)
- AI 기반 대화 분석 및 인사이트 제공
- 실시간 감정 분석 및 키워드 추출

### 2. 고객 서비스 관리 (`/advanced`)
- 고객 프로필 및 요금제 조회
- 부가서비스 및 할인 혜택 관리
- 로밍 서비스 설정

### 3. 해지 손익 분석 (신규)
요금제/부가서비스/결합 해지 시 **단기/중기/장기 이득 변화**를 계산하고 시각화하는 기능

#### 분석 항목
| 기간 | 분석 내용 |
|------|----------|
| 단기 (1-3개월) | 즉시 비용(위약금), 월 비용 변화, 3개월 총 영향 |
| 중기 (6-12개월) | 손익분기점, 12개월 총 영향, 월별 누적 손익 |
| 장기 (2-3년) | 예상 절감액, 잃는 혜택 가치, 36개월 순이익/손해 |

#### 데모 시나리오
1. **프리미엄 약정 해지** - 5G 프리미엄 + 24개월 약정 + 공시지원금 50만원 → 해지 비추천
2. **OTT 부가서비스 정리** - 넷플릭스 + 디즈니+ + 유튜브 월 26,850원 → 해지 추천
3. **가족 결합 해지** - 4인 가족 결합 + 인터넷 + TV 트리플 → 연쇄 효과로 대안 제시

### 4. 상담 마무리
- AI 기반 상담 요약 생성
- 고객 만족도 및 상담 유형 기록
- 후속 조치 관리

## 기술 스택

- **Framework**: Next.js 16, React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **AI/ML**: OpenAI GPT-4, Whisper API
- **Icons**: Lucide Icons

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── advanced/          # 고객 서비스 관리 페이지
│   ├── dashboard/         # 대시보드
│   ├── history/           # 상담 이력
│   └── api/               # API Routes
├── components/            # 공통 UI 컴포넌트
├── features/              # 기능별 모듈
│   ├── advanced/          # 고객 서비스 관리
│   │   ├── components/    # UI 컴포넌트
│   │   ├── data/          # 데모 시나리오 데이터
│   │   ├── lib/           # 계산 로직
│   │   └── types/         # 타입 정의
│   ├── dashboard/         # 대시보드
│   ├── transcript/        # 실시간 대화
│   └── wrap-up/           # 상담 마무리
├── stores/                # Zustand 스토어
└── lib/                   # 유틸리티
```

## 시작하기

### 환경 설정

```bash
# 환경 변수 설정
cp .env.example .env.local
```

`.env.local` 파일에 필요한 API 키를 설정합니다:
```
OPENAI_API_KEY=your_openai_api_key
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 대시보드 |
| `/dashboard` | 실시간 상담 대시보드 |
| `/advanced` | 고객 서비스 관리 (해지 분석 포함) |
| `/history` | 상담 이력 조회 |

## 해지 분석 사용 방법

1. `/advanced` 페이지 접속
2. 상단 드롭다운에서 데모 시나리오 선택
3. 요금제/부가서비스/할인 탭에서 항목 선택
4. "해지 분석" 버튼 클릭
5. 모달에서 단기/중기/장기 탭 전환하며 결과 확인
6. 연쇄 효과 및 추천 사항 확인

## 라이선스

Private - SK Telecom Internal Use Only
