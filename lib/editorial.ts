import type { ImageStatus, IssueOfDay } from '@/lib/db/types';

type ThemeProfile = {
  id: string;
  label: string;
  lead: string;
  focus: string;
  compare: string;
};

type ToneProfile = {
  label: string;
  line: string;
};

type ScopeProfile = {
  label: string;
  line: string;
};

export type IssueEditorialNote = {
  themeLabel: string;
  toneLabel: string;
  toneLine: string;
  scopeLabel: string;
  lead: string;
  focusLine: string;
  compareLine: string;
  selectionLine: string;
  accessLine: string;
  imageStatusLabel: string;
};

const themeProfiles: ThemeProfile[] = [
  {
    id: 'politics',
    label: '권력과 제도',
    lead: '권력 이동과 제도 충돌이 이 날짜의 첫 문장을 차지합니다.',
    focus: '정책의 세부보다 누가 주도권을 잡는지가 더 크게 적히는 날의 판면입니다.',
    compare: '값을 바꿔 넘겨 보며 국가 권력이 생활 기사보다 얼마나 자주 앞면을 점유하는지 비교해 보세요.'
  },
  {
    id: 'economy',
    label: '시장과 생계',
    lead: '가격, 산업, 고용 같은 생계 문제가 1면의 주어로 올라옵니다.',
    focus: '숫자와 지표가 바로 체감의 언어로 번역되는 날의 리듬이 강합니다.',
    compare: '같은 날짜가 정치 기사에서 경제 기사로 이동하는 순간을 보면 시대의 불안이 어디에 있었는지 드러납니다.'
  },
  {
    id: 'diplomacy',
    label: '국가와 외교',
    lead: '국경 밖 긴장이 국내의 첫 문장이 되는 날입니다.',
    focus: '외교, 군사, 국제 질서가 국내 정치보다 앞줄에 놓이는 구도입니다.',
    compare: '다른 시점과 나란히 놓고 보면 세계 정세가 한국 사회에 얼마나 가까이 들이닥쳤는지 읽힙니다.'
  },
  {
    id: 'disaster',
    label: '재난과 충격',
    lead: '사고와 재난이 다른 의제를 밀어내고 판면을 점거합니다.',
    focus: '충격의 규모와 즉시성이 그대로 헤드라인의 압력으로 전해지는 날입니다.',
    compare: '처음에는 충격이, 이어지는 해에는 원인과 책임이 앞면으로 올라오는지 비교해 보세요.'
  },
  {
    id: 'justice',
    label: '수사와 판결',
    lead: '범죄, 수사, 판결 같은 책임의 문제가 전면으로 떠오릅니다.',
    focus: '사건 자체보다 책임 소재와 처분의 강도가 판면을 이끄는 흐름입니다.',
    compare: '비슷한 날짜를 넘겨 보며 충격의 보도에서 제도적 책임 추궁으로 무게가 이동하는지 보세요.'
  },
  {
    id: 'society',
    label: '거리와 생활',
    lead: '제도보다 거리의 감정과 생활 문제가 더 먼저 올라옵니다.',
    focus: '시민의 체감, 현장의 장면, 생활의 균열이 국가 단위 의제를 밀어내는 판면입니다.',
    compare: '같은 날짜를 넘길 때 국가 의제가 생활 문제를 덮는 해와 반대로 생활이 전면에 선 해를 비교해 보세요.'
  },
  {
    id: 'culture',
    label: '대중과 열광',
    lead: '문화, 스포츠, 인물의 파급력이 하루의 첫 인상을 결정합니다.',
    focus: '정책보다 인물과 장면의 흡인력이 큰 날의 1면입니다.',
    compare: '무거운 공적 이슈 사이에 대중적 열광이 전면을 차지하는 해가 언제 나타나는지 보세요.'
  },
  {
    id: 'default',
    label: '시대의 긴장',
    lead: '그해 오늘 사회가 가장 먼저 붙잡은 불안과 관심이 전면에 남습니다.',
    focus: '사건 하나보다 그날 무엇이 가장 앞줄에 배치됐는지가 이 판의 핵심입니다.',
    compare: '몇 년 전 값을 바꾸며 앞면의 주어가 권력, 시장, 거리, 세계 중 어디로 이동하는지 비교해 보세요.'
  }
];

function includesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

function classifyTheme(text: string) {
  if (
    includesAny(text, [
      '대통령',
      '국회',
      '청와대',
      '정권',
      '총리',
      '선거',
      '여당',
      '야당',
      '정치',
      '계엄',
      '탄핵',
      '개헌',
      '정부',
      '헌법',
      '내각'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'politics') ?? themeProfiles[0];
  }

  if (
    includesAny(text, [
      '주가',
      '증시',
      '환율',
      '금리',
      '물가',
      '수출',
      '수입',
      '고용',
      '실업',
      '기업',
      '반도체',
      '부동산',
      '경제',
      '산업'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'economy') ?? themeProfiles[0];
  }

  if (
    includesAny(text, [
      '북한',
      '미국',
      '중국',
      '일본',
      '소련',
      '러시아',
      '우크라',
      '가자',
      '정상회담',
      '외교',
      '유엔',
      '전쟁',
      '미사일',
      '핵',
      '국제'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'diplomacy') ?? themeProfiles[0];
  }

  if (
    includesAny(text, [
      '화재',
      '침몰',
      '폭발',
      '참사',
      '붕괴',
      '사망',
      '실종',
      '태풍',
      '홍수',
      '지진',
      '재난',
      '사고'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'disaster') ?? themeProfiles[0];
  }

  if (
    includesAny(text, [
      '검찰',
      '법원',
      '영장',
      '구속',
      '수사',
      '재판',
      '판결',
      '의혹',
      '혐의',
      '살인',
      '강도',
      '범죄',
      '체포'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'justice') ?? themeProfiles[0];
  }

  if (
    includesAny(text, [
      '시민',
      '노동',
      '파업',
      '교육',
      '복지',
      '주거',
      '의료',
      '학교',
      '학생',
      '버스',
      '지하철',
      '사회',
      '현장'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'society') ?? themeProfiles[0];
  }

  if (
    includesAny(text, [
      '축구',
      '야구',
      '올림픽',
      '월드컵',
      '영화',
      '드라마',
      '가수',
      '배우',
      '우승',
      '음악',
      '문화',
      '공연'
    ])
  ) {
    return themeProfiles.find((profile) => profile.id === 'culture') ?? themeProfiles[0];
  }

  return themeProfiles.find((profile) => profile.id === 'default') ?? themeProfiles[0];
}

function classifyTone(text: string): ToneProfile {
  if (
    includesAny(text, ['속보', '긴급', '비상', '경보', '참사', '사망', '붕괴', '폭발', '실종', '침몰', '패닉'])
  ) {
    return {
      label: '경보',
      line: '충격과 즉시성이 강한 문장으로 사건을 밀어 올리는 톤입니다.'
    };
  }

  if (includesAny(text, ['충돌', '대치', '압박', '반발', '파문', '갈등', '대립', '파업', '격돌'])) {
    return {
      label: '대치',
      line: '갈등의 선이 뚜렷하고, 판면도 긴장 상태를 그대로 밀어붙이는 어조입니다.'
    };
  }

  if (includesAny(text, ['타결', '합의', '출범', '개막', '선언', '출시', '개편', '전환', '복원'])) {
    return {
      label: '전환',
      line: '완결보다 변화의 문턱을 강조하는, 비교적 결기 있는 톤으로 읽힙니다.'
    };
  }

  if (includesAny(text, ['급등', '급락', '확대', '증가', '성장', '호황', '회복', '최대', '신기록'])) {
    return {
      label: '확장',
      line: '증감과 흐름을 크게 부각해 시대의 방향성을 설명하려는 어조가 강합니다.'
    };
  }

  if (includesAny(text, ['추모', '애도', '영결', '별세', '희생', '눈물'])) {
    return {
      label: '비탄',
      line: '수치보다 상실의 무게가 먼저 느껴지는, 눌린 감정의 톤입니다.'
    };
  }

  return {
    label: '기록',
    line: '사건을 단정적으로 외치기보다, 그날의 변화를 정리해 남기려는 비교적 건조한 톤입니다.'
  };
}

function classifyScope(text: string, themeId: string): ScopeProfile {
  if (includesAny(text, ['미국', '중국', '일본', '북한', '유엔', '세계', '해외', '국제', '유럽', '중동'])) {
    return {
      label: '국경 밖 정세',
      line: '시선의 무게가 국내 생활보다 바깥 세계의 충격에 더 실려 있습니다.'
    };
  }

  if (themeId === 'politics') {
    return {
      label: '국가 권력',
      line: '판면의 주어가 시민 개개인보다 정당, 정부, 권력기관에 가깝습니다.'
    };
  }

  if (themeId === 'economy') {
    return {
      label: '시장과 가계',
      line: '거대한 정책보다 결국 장바구니와 산업 현장으로 이어지는 문제를 먼저 보여줍니다.'
    };
  }

  if (themeId === 'disaster' || themeId === 'justice') {
    return {
      label: '현장과 책임',
      line: '추상적 담론보다 현장과 책임 주체가 더 선명하게 드러나는 1면입니다.'
    };
  }

  if (themeId === 'culture') {
    return {
      label: '대중의 시선',
      line: '국가의 결정문보다 사람들의 관심과 열광이 판면을 끌고 갑니다.'
    };
  }

  return {
    label: '사회의 표정',
    line: '거대한 담론과 생활의 장면이 맞물리며, 그날의 사회적 표정이 전면에 남습니다.'
  };
}

export function formatImageStatusLabel(status: ImageStatus) {
  switch (status) {
    case 'licensed':
      return '사용 허가 이미지';
    case 'public_domain':
      return '퍼블릭 도메인';
    case 'generated':
      return '생성 비주얼';
    case 'none':
      return '비주얼 없음';
    case 'unknown':
    default:
      return '권리 확인 중';
  }
}

export function getIssueEditorialNote(issue: IssueOfDay): IssueEditorialNote {
  const searchableText = [issue.headline, issue.summary, ...issue.keywords].join(' ');
  const theme = classifyTheme(searchableText);
  const tone = classifyTone(searchableText);
  const scope = classifyScope(searchableText, theme.id);

  return {
    themeLabel: theme.label,
    toneLabel: tone.label,
    toneLine: `${tone.line} ${scope.line}`,
    scopeLabel: scope.label,
    lead: `${issue.year}년 오늘의 1면은 ${theme.lead} 헤드라인의 어조는 ${tone.label} 쪽으로 기울고, 시선은 ${scope.label}에 머뭅니다.`,
    focusLine: theme.focus,
    compareLine: theme.compare,
    selectionLine: `동일 날짜의 기사 후보를 제목 군집으로 묶은 뒤, 매체 교차도와 사건성, 지면 비중을 합산해 대표 기사를 골랐습니다. 현재 판의 대표 점수는 ${issue.importanceScore.toFixed(1)}입니다.`,
    accessLine: '전문은 이 화면에 싣지 않고, 제목과 요약 그리고 원문 링크까지만 남깁니다.',
    imageStatusLabel: formatImageStatusLabel(issue.imageStatus)
  };
}
