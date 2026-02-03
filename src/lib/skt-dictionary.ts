// SKT 커스텀 딕셔너리 — 상품명/별칭/의도 중앙 관리

type ProductType = 'plan' | 'addon' | 'roaming' | 'general';

interface DictionaryEntry {
  id: string;
  type: ProductType;
  officialName: string;
  aliases: string[];
  keywords: string[];
  category: string;
}

// ── 딕셔너리 데이터 ──

const DICTIONARY: DictionaryEntry[] = [
  // ── 요금제 ──
  {
    id: '5gx-platinum',
    type: 'plan',
    officialName: '5GX 플래티넘',
    aliases: ['플래티넘', '플래티남', '플레티넘', '5gx 플래티넘', '5g 플래티넘'],
    keywords: ['최고급', '프리미엄', '테더링 120'],
    category: '5GX',
  },
  {
    id: '5gx-premium',
    type: 'plan',
    officialName: '5GX 프리미엄',
    aliases: ['프리미엄', '5gx 프리미엄', '5g 프리미엄'],
    keywords: ['넷플릭스', '콘텐츠 옵션'],
    category: '5GX',
  },
  {
    id: '5gx-prime-plus',
    type: 'plan',
    officialName: '5GX 프라임플러스',
    aliases: ['프라임플러스', '프라임 플러스', '5gx 프라임플러스'],
    keywords: ['콘텐츠 선택형'],
    category: '5GX',
  },
  {
    id: '5gx-prime',
    type: 'plan',
    officialName: '5GX 프라임',
    aliases: ['프라임', '5gx 프라임', '5g 프라임'],
    keywords: ['기본 5g'],
    category: '5GX',
  },
  {
    id: 'young-79',
    type: 'plan',
    officialName: '0 청년 79',
    aliases: ['청년 79', '영 79', '0청년 79', '청년79'],
    keywords: ['300gb', '5mbps'],
    category: '0청년',
  },
  {
    id: 'young-59',
    type: 'plan',
    officialName: '0 청년 59',
    aliases: ['청년 59', '영 59', '0청년 59', '청년59', '청년 오구', '청년오구'],
    keywords: ['36gb', '1mbps'],
    category: '0청년',
  },
  {
    id: 'young-49',
    type: 'plan',
    officialName: '0 청년 49',
    aliases: ['청년 49', '영 49', '0청년 49', '청년49'],
    keywords: ['15gb', '기본형'],
    category: '0청년',
  },
  {
    id: 'basic-plus',
    type: 'plan',
    officialName: '베이직플러스',
    aliases: ['베이직 플러스', '베이직플러스'],
    keywords: ['24gb'],
    category: '베이직',
  },
  {
    id: 'basic',
    type: 'plan',
    officialName: '베이직',
    aliases: ['베이직'],
    keywords: ['11gb'],
    category: '베이직',
  },
  {
    id: 'slim',
    type: 'plan',
    officialName: '슬림',
    aliases: ['슬림'],
    keywords: ['15gb'],
    category: '베이직',
  },
  {
    id: 'compact',
    type: 'plan',
    officialName: '컴팩트',
    aliases: ['컴팩트'],
    keywords: ['6gb', '저용량'],
    category: '베이직',
  },
  {
    id: 'senior-a',
    type: 'plan',
    officialName: '시니어 A',
    aliases: ['시니어A', '시니어 에이'],
    keywords: ['65세', '안심케어'],
    category: '시니어',
  },
  {
    id: 'senior-c',
    type: 'plan',
    officialName: '시니어 C',
    aliases: ['시니어C', '시니어 씨'],
    keywords: ['65세', '경제형'],
    category: '시니어',
  },
  {
    id: 'teen-5g',
    type: 'plan',
    officialName: '0틴 5G',
    aliases: ['영틴', '0틴', '제로틴', '틴 5g'],
    keywords: ['청소년', '유해차단'],
    category: '청소년',
  },
  {
    id: 'zem-plan',
    type: 'plan',
    officialName: '5G ZEM 플랜',
    aliases: ['제모', '젬', 'zem', '젬플랜', '제모플랜'],
    keywords: ['어린이', '키즈'],
    category: '청소년',
  },

  // ── 부가서비스 ──
  {
    id: 'addon-smart-callkeeper',
    type: 'addon',
    officialName: '스마트 콜키퍼',
    aliases: ['콜키퍼', '스마트콜키퍼', '콜 키퍼'],
    keywords: ['부재중', '착신전환', '전화 관리'],
    category: '통화',
  },
  {
    id: 'addon-callkeeper',
    type: 'addon',
    officialName: '콜키퍼',
    aliases: ['콜키퍼 기본'],
    keywords: ['부재중', '기본 콜키퍼'],
    category: '통화',
  },
  {
    id: 'addon-perfect-call',
    type: 'addon',
    officialName: '퍼펙트콜',
    aliases: ['퍼펙트 콜', '완벽콜'],
    keywords: ['통화 품질'],
    category: '통화',
  },
  {
    id: 'addon-v-coloring',
    type: 'addon',
    officialName: 'V 컬러링',
    aliases: ['컬러링', '브이컬러링', '비컬러링'],
    keywords: ['통화연결음', '벨소리'],
    category: '통화',
  },
  {
    id: 'addon-flo-data',
    type: 'addon',
    officialName: 'FLO 앤 데이터',
    aliases: ['플로', 'flo', '플로앤데이터', '플로 앤 데이터'],
    keywords: ['음악', '스트리밍', '음악 앱'],
    category: '콘텐츠',
  },
  {
    id: 'addon-wavve-data',
    type: 'addon',
    officialName: 'Wavve 앤 데이터',
    aliases: ['웨이브', 'wavve', '웨이브앤데이터', '웨이브 앤 데이터'],
    keywords: ['영상', '동영상', 'ott', '드라마'],
    category: '콘텐츠',
  },
  {
    id: 'addon-onestory-data',
    type: 'addon',
    officialName: '원스토리 앤 데이터',
    aliases: ['원스토리', '원스토리앤데이터'],
    keywords: ['웹소설', '웹툰', '콘텐츠'],
    category: '콘텐츠',
  },
  {
    id: 'addon-lte-safety',
    type: 'addon',
    officialName: 'LTE 안심옵션',
    aliases: ['안심옵션', 'lte 안심'],
    keywords: ['데이터 안심', '속도 제한'],
    category: '데이터',
  },
  {
    id: 'addon-data-charge-4gb',
    type: 'addon',
    officialName: '데이터 충전 4GB',
    aliases: ['데이터충전', '데이터 충전'],
    keywords: ['추가 데이터', '충전'],
    category: '데이터',
  },
  {
    id: 'addon-safe-data-100',
    type: 'addon',
    officialName: '안심데이터 100',
    aliases: ['안심데이터', '안심 데이터'],
    keywords: ['데이터 안심', '100gb'],
    category: '데이터',
  },
  {
    id: 'addon-t-allcare-6',
    type: 'addon',
    officialName: 'T 올케어+6',
    aliases: ['올케어', '티올케어', 't올케어', '올케어플러스', '올케어+6'],
    keywords: ['보험', '파손', '수리'],
    category: '보험',
  },
  {
    id: 'addon-insurance-iphone',
    type: 'addon',
    officialName: '분실파손6 i일반',
    aliases: ['분실파손', '아이폰 보험'],
    keywords: ['아이폰', '분실', '파손'],
    category: '보험',
  },
  {
    id: 'addon-insurance-fold',
    type: 'addon',
    officialName: '분실파손6 폴드',
    aliases: ['폴드 보험', '분실파손 폴드'],
    keywords: ['폴드', '분실', '파손'],
    category: '보험',
  },

  // ── 로밍 ──
  {
    id: 'roaming-baro',
    type: 'roaming',
    officialName: 'T 로밍 baro',
    aliases: ['바로', '바로로밍', 'baro', 'baro로밍', '티로밍바로', 't로밍바로', '바로 로밍'],
    keywords: ['해외', '로밍', '자동'],
    category: '로밍',
  },
  {
    id: 'roaming-onepass',
    type: 'roaming',
    officialName: 'OnePass',
    aliases: ['원패스', '원패스로밍', 'onepass', '원 패스'],
    keywords: ['해외', '로밍', '패스'],
    category: '로밍',
  },
  {
    id: 'roaming-esim',
    type: 'roaming',
    officialName: 'eSIM',
    aliases: ['이심', 'esim', '이심로밍', 'e심'],
    keywords: ['해외', '심카드', '듀얼심'],
    category: '로밍',
  },
  {
    id: 'roaming-data-flat',
    type: 'roaming',
    officialName: '데이터로밍 정액제',
    aliases: ['로밍 정액', '데이터로밍', '로밍 데이터'],
    keywords: ['해외 데이터', '정액'],
    category: '로밍',
  },

  // ── 일반 의도 ──
  {
    id: 'intent-cost-saving',
    type: 'general',
    officialName: '요금절감',
    aliases: ['비싸다', '비싼', '저렴하게', '싸게', '절약', '할인', '요금이 높', '요금 낮', '부담', '아끼', '깎아'],
    keywords: ['요금 절감', '비용 절약'],
    category: '의도',
  },
  {
    id: 'intent-data-more',
    type: 'general',
    officialName: '데이터증량',
    aliases: ['데이터 부족', '데이터가 부족', '데이터 많이', '데이터가 모자', '데이터 다 써', '데이터 더', '데이터 모자라', '데이터가 없'],
    keywords: ['데이터 증량', '데이터 추가'],
    category: '의도',
  },
  {
    id: 'intent-premium',
    type: 'general',
    officialName: '프리미엄',
    aliases: ['5g', '5지', '속도 빠른', '속도가 빠', '빠른 속도', '무제한'],
    keywords: ['고급', '프리미엄'],
    category: '의도',
  },
  {
    id: 'intent-young',
    type: 'general',
    officialName: '청년요금제',
    aliases: ['청년', '젊은', '0청년', '영', '2030', '청년요금'],
    keywords: ['청년', '만 34세'],
    category: '의도',
  },
  {
    id: 'intent-roaming',
    type: 'general',
    officialName: '로밍문의',
    aliases: ['해외여행', '해외 가는', '여행 가는', '출장', '해외 출장', '외국'],
    keywords: ['로밍', '해외'],
    category: '의도',
  },
  {
    id: 'intent-senior',
    type: 'general',
    officialName: '시니어요금제',
    aliases: ['어르신', '시니어', '65세', '노인', '부모님 요금'],
    keywords: ['시니어', '65세 이상'],
    category: '의도',
  },
  {
    id: 'intent-teen',
    type: 'general',
    officialName: '청소년요금제',
    aliases: ['자녀', '청소년', '아이', '초등학생', '중학생', '고등학생', '키즈'],
    keywords: ['청소년', '자녀'],
    category: '의도',
  },
];

// ── 음성인식 오인식 보정 맵 (발음 유사어 → 정식 표기) ──
// Whisper / Web Speech API가 자주 틀리는 패턴
// 주의: 긴 패턴이 먼저 와야 짧은 패턴에 먹히지 않음
const PHONETIC_CORRECTIONS: [RegExp, string][] = [
  // ── 5GX 요금제 ──
  [/플래티남/g, '플래티넘'],
  [/플레티넘/g, '플래티넘'],
  [/플레티남/g, '플래티넘'],
  [/플라티넘/g, '플래티넘'],
  [/프라임 플러스/g, '프라임플러스'],

  // ── 0 청년 요금제 (가장 흔한 오인식) ──
  // "0청년109" → "영창년백구", "영청년일공구" 등으로 인식됨
  // 긴 패턴 먼저 (숫자 포함)
  [/영창년\s*백구/g, '0 청년 109'],
  [/영청년\s*백구/g, '0 청년 109'],
  [/영\s*창년\s*백구/g, '0 청년 109'],
  [/영\s*청년\s*백구/g, '0 청년 109'],
  [/영창년\s*109/g, '0 청년 109'],
  [/영청년\s*109/g, '0 청년 109'],
  [/영창년\s*일공구/g, '0 청년 109'],
  [/영청년\s*일공구/g, '0 청년 109'],
  [/영창년\s*일영구/g, '0 청년 109'],
  [/영청년\s*일영구/g, '0 청년 109'],
  [/공창년\s*109/g, '0 청년 109'],
  [/공청년\s*109/g, '0 청년 109'],
  [/제로\s*청년\s*109/g, '0 청년 109'],
  [/제로\s*청년\s*백구/g, '0 청년 109'],
  [/제로\s*청년\s*일공구/g, '0 청년 109'],

  // 0 청년 79
  [/영창년\s*칠구/g, '0 청년 79'],
  [/영청년\s*칠구/g, '0 청년 79'],
  [/영창년\s*79/g, '0 청년 79'],
  [/영청년\s*79/g, '0 청년 79'],
  [/영창년\s*칠십구/g, '0 청년 79'],
  [/영청년\s*칠십구/g, '0 청년 79'],
  [/공청년\s*79/g, '0 청년 79'],
  [/제로\s*청년\s*79/g, '0 청년 79'],

  // 0 청년 59
  [/영창년\s*오구/g, '0 청년 59'],
  [/영청년\s*오구/g, '0 청년 59'],
  [/영창년\s*59/g, '0 청년 59'],
  [/영청년\s*59/g, '0 청년 59'],
  [/영창년\s*오십구/g, '0 청년 59'],
  [/영청년\s*오십구/g, '0 청년 59'],
  [/공청년\s*59/g, '0 청년 59'],
  [/제로\s*청년\s*59/g, '0 청년 59'],
  [/청년\s*오구/g, '0 청년 59'],
  [/청년오구/g, '0 청년 59'],

  // 0 청년 49
  [/영창년\s*49/g, '0 청년 49'],
  [/영청년\s*49/g, '0 청년 49'],
  [/영창년\s*사구/g, '0 청년 49'],
  [/영청년\s*사구/g, '0 청년 49'],
  [/공청년\s*49/g, '0 청년 49'],
  [/제로\s*청년\s*49/g, '0 청년 49'],

  // 0 청년 (숫자 없는 일반 패턴 — 위의 구체적 패턴 뒤에 와야 함)
  [/영창년/g, '0 청년'],
  [/영\s*창년/g, '0 청년'],
  [/영청년/g, '0 청년'],
  [/영\s*청년/g, '0 청년'],
  [/제로\s*청년/g, '0 청년'],
  [/공\s*청년/g, '0 청년'],
  [/공청년/g, '0 청년'],

  // ── 청소년/키즈 ──
  [/영\s*틴/g, '0틴'],
  [/제로\s*틴/g, '0틴'],
  [/공\s*틴/g, '0틴'],
  [/영틴/g, '0틴'],
  [/공틴/g, '0틴'],
  [/제모\s*플랜/g, 'ZEM 플랜'],
  [/젬\s*플랜/g, 'ZEM 플랜'],
  [/제모플랜/g, 'ZEM 플랜'],
  [/젬플랜/g, 'ZEM 플랜'],

  // ── 로밍 ──
  [/티\s*로밍\s*바로/g, 'T 로밍 baro'],
  [/T로밍\s*바로/g, 'T 로밍 baro'],
  [/티로밍\s*바로/g, 'T 로밍 baro'],
  [/바로\s*로밍/g, 'T 로밍 baro'],
  [/바로로밍/g, 'T 로밍 baro'],
  [/원\s*패스/g, 'OnePass'],
  [/원패스/g, 'OnePass'],
  [/이\s*심/g, 'eSIM'],
  [/이심/g, 'eSIM'],
  [/e\s*심/g, 'eSIM'],

  // ── 시니어 요금제 ──
  // "시니어 C" → "시니어 씨", "신유씨", "시뉴씨" 등
  [/신유\s*씨/g, '시니어 C'],
  [/시뉴\s*씨/g, '시니어 C'],
  [/씨니어\s*씨/g, '시니어 C'],
  [/시니어\s*씨/g, '시니어 C'],
  [/시니어씨/g, '시니어 C'],
  // "시니어 A" → "시니어 에이", "신유에이" 등
  [/신유\s*에이/g, '시니어 A'],
  [/시뉴\s*에이/g, '시니어 A'],
  [/씨니어\s*에이/g, '시니어 A'],
  [/시니어\s*에이/g, '시니어 A'],
  [/시니어에이/g, '시니어 A'],

  // ── 부가서비스 ──
  [/스마트\s*콜\s*키퍼/g, '스마트 콜키퍼'],
  [/콜\s*키퍼/g, '콜키퍼'],
  [/퍼펙트\s*콜/g, '퍼펙트콜'],
  [/브이\s*컬러링/g, 'V 컬러링'],
  [/비\s*컬러링/g, 'V 컬러링'],
  [/비컬러링/g, 'V 컬러링'],
  [/브이컬러링/g, 'V 컬러링'],
  [/플로\s*앤\s*데이터/g, 'FLO 앤 데이터'],
  [/플로앤데이터/g, 'FLO 앤 데이터'],
  [/웨이브\s*앤\s*데이터/g, 'Wavve 앤 데이터'],
  [/웨이브앤데이터/g, 'Wavve 앤 데이터'],
  [/티\s*올케어/g, 'T 올케어'],
  [/티올케어/g, 'T 올케어'],
  [/올\s*케어/g, '올케어'],

  // ── 일반 통신 용어 ──
  [/파이브\s*지/g, '5G'],
  [/파이브지/g, '5G'],
  [/5\s*지/g, '5G'],
  [/엘\s*티\s*이/g, 'LTE'],
  [/엘티이/g, 'LTE'],
  [/에스\s*케이/g, 'SK'],
  [/에스케이/g, 'SK'],
  [/티\s*멤버십/g, 'T멤버십'],
  [/티멤버십/g, 'T멤버십'],
];

/** 음성인식 결과 텍스트를 딕셔너리 기반으로 후보정 */
export function correctTranscription(text: string): string {
  let corrected = text;

  // 1단계: 발음 유사어 보정
  for (const [pattern, replacement] of PHONETIC_CORRECTIONS) {
    corrected = corrected.replace(pattern, replacement);
  }

  return corrected;
}

// ── 유틸 함수 ──

/** 텍스트에서 별칭/줄임말 매칭 → 정식 상품 엔트리 반환 (첫 번째 매칭) */
export function resolveProduct(text: string): DictionaryEntry | null {
  const lower = text.toLowerCase();

  // aliases 길이 긴 순으로 매칭 (가장 구체적인 것 우선)
  const allAliases: { alias: string; entry: DictionaryEntry }[] = [];
  for (const entry of DICTIONARY) {
    for (const alias of entry.aliases) {
      allAliases.push({ alias: alias.toLowerCase(), entry });
    }
  }
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  for (const { alias, entry } of allAliases) {
    if (lower.includes(alias)) {
      return entry;
    }
  }
  return null;
}

/** 텍스트에서 매칭되는 모든 상품 반환 */
export function resolveAllProducts(text: string): DictionaryEntry[] {
  const lower = text.toLowerCase();
  const matched: DictionaryEntry[] = [];
  const matchedIds = new Set<string>();

  const allAliases: { alias: string; entry: DictionaryEntry }[] = [];
  for (const entry of DICTIONARY) {
    for (const alias of entry.aliases) {
      allAliases.push({ alias: alias.toLowerCase(), entry });
    }
  }
  allAliases.sort((a, b) => b.alias.length - a.alias.length);

  for (const { alias, entry } of allAliases) {
    if (lower.includes(alias) && !matchedIds.has(entry.id)) {
      matched.push(entry);
      matchedIds.add(entry.id);
    }
  }
  return matched;
}

/** AI 시스템 프롬프트에 주입할 딕셔너리 텍스트 */
export function getPromptDictionary(): string {
  const lines: string[] = [
    '=== SKT 상품 딕셔너리 (고객이 사용하는 줄임말 → 정식 상품명) ===',
  ];

  const byType: Record<ProductType, DictionaryEntry[]> = {
    plan: [],
    addon: [],
    roaming: [],
    general: [],
  };

  for (const entry of DICTIONARY) {
    byType[entry.type].push(entry);
  }

  if (byType.plan.length > 0) {
    lines.push('\n[요금제]');
    for (const e of byType.plan) {
      if (e.aliases.length > 0) {
        lines.push(`- "${e.aliases.join('", "')}" → ${e.officialName}`);
      }
    }
  }

  if (byType.addon.length > 0) {
    lines.push('\n[부가서비스]');
    for (const e of byType.addon) {
      if (e.aliases.length > 0) {
        lines.push(`- "${e.aliases.join('", "')}" → ${e.officialName}`);
      }
    }
  }

  if (byType.roaming.length > 0) {
    lines.push('\n[로밍]');
    for (const e of byType.roaming) {
      if (e.aliases.length > 0) {
        lines.push(`- "${e.aliases.join('", "')}" → ${e.officialName}`);
      }
    }
  }

  if (byType.general.length > 0) {
    lines.push('\n[고객 의도 감지]');
    for (const e of byType.general) {
      lines.push(`- "${e.aliases.join('", "')}" → ${e.officialName}`);
    }
  }

  lines.push('\n주의: 고객이 줄임말/구어체를 사용해도 정식 상품명으로 이해하고 응대하세요.');

  return lines.join('\n');
}

/** Whisper 음성인식 프롬프트용 상품명 목록 */
export function getWhisperPrompt(): string {
  const productNames: string[] = [];

  for (const entry of DICTIONARY) {
    if (entry.type !== 'general') {
      productNames.push(entry.officialName);
      // 주요 별칭도 추가 (Whisper가 인식할 수 있도록)
      for (const alias of entry.aliases.slice(0, 2)) {
        productNames.push(alias);
      }
    }
  }

  return `이 대화는 SK텔레콤 고객센터 상담 내용입니다. 고객과 상담사가 대화하고 있습니다. 다음 상품명이 포함될 수 있습니다: ${productNames.join(', ')}. 요금제, 데이터, 로밍, T멤버십, 5G, LTE, 휴대폰, 인터넷, TV 등 통신 관련 용어가 포함될 수 있습니다.`;
}

/** 텍스트에서 고객 의도 추출 */
export function extractIntents(text: string): {
  costSaving: boolean;
  dataMore: boolean;
  premium: boolean;
  young: boolean;
  roaming: boolean;
  senior: boolean;
  teen: boolean;
  matchedProducts: DictionaryEntry[];
} {
  const lower = text.toLowerCase();
  const matchedProducts = resolveAllProducts(text).filter(e => e.type !== 'general');

  function hasIntent(intentId: string): boolean {
    const entry = DICTIONARY.find(e => e.id === intentId);
    if (!entry) return false;
    return entry.aliases.some(alias => lower.includes(alias.toLowerCase()));
  }

  return {
    costSaving: hasIntent('intent-cost-saving'),
    dataMore: hasIntent('intent-data-more'),
    premium: hasIntent('intent-premium'),
    young: hasIntent('intent-young'),
    roaming: hasIntent('intent-roaming'),
    senior: hasIntent('intent-senior'),
    teen: hasIntent('intent-teen'),
    matchedProducts,
  };
}

/** 딕셔너리 기반 키워드 추출 (useConversationSearch용) */
export function extractDictionaryKeywords(text: string): string[] {
  const matched = resolveAllProducts(text);
  const keywords: string[] = [];

  for (const entry of matched) {
    keywords.push(entry.officialName);
    // 카테고리도 키워드로 추가
    if (entry.category !== '의도') {
      keywords.push(entry.category);
    }
  }

  return [...new Set(keywords)];
}

/** 딕셔너리 기반 키워드 우선순위 (useConversationSearch용) */
export function getDictionaryPriority(keyword: string): number {
  const entry = DICTIONARY.find(
    e => e.officialName === keyword || e.aliases.some(a => a.toLowerCase() === keyword.toLowerCase())
  );
  if (!entry) return 0;

  // 로밍/분실이 가장 높은 우선순위
  if (entry.type === 'roaming') return 12;
  if (entry.category === '보험' || entry.category === '보안') return 11;
  // 특정 상품명이 나오면 높은 우선순위
  if (entry.type === 'plan') return 9;
  if (entry.type === 'addon') return 8;
  // 일반 의도는 중간
  if (entry.type === 'general') return 5;

  return 3;
}

export { DICTIONARY, type DictionaryEntry, type ProductType };
