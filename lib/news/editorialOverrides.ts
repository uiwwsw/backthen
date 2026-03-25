import type { IssueOfDay } from '@/lib/db/types';

const editorialOverrides: Record<string, IssueOfDay> = {
  '1996-03-24': {
    year: 1996,
    monthDay: '03-24',
    headline: '與 "조기진화" 野 "득표연계" 장학로 파문 정치권 동향',
    rawHeadline: '與 "조기진화" 野 "득표연계" 장학로 파문 정치권 동향',
    summary:
      '1996년 3월 24일, 장학로 파문은 4·11 총선을 앞둔 정치권의 핵심 변수로 떠올랐습니다. 동아일보 디지털 아카이브의 3면과 4면, 6면 기사 목록을 보면 검찰 수사, 여야 공방, 주말 유세가 같은 쟁점으로 이어졌습니다.',
    sourceName: 'donga',
    sourceUrl: 'https://www.donga.com/archive/newslibrary/view?idx=19960324%2F0002720450%2F1',
    publishedAt: '1996-03-24T00:00:00+09:00',
    backgroundImageUrl: 'https://dimg.donga.com/a/500/0/90/5/PDF_EXT/NEWS/1996/03/24/da_23147_m_19960324_4.jpg',
    backgroundImageCredit: '동아일보 디지털 아카이브 1996년 3월 24일 조간 4면',
    imageStatus: 'unknown',
    keywords: ['장학로', '총선', '정치권', '여야'],
    importanceScore: 34.6,
    relatedArticles: [],
    secondaryArticles: []
  }
};

export function getLocalEditorialOverride(year: number, monthDay: string) {
  return editorialOverrides[`${year}-${monthDay}`] ?? null;
}

export function getLocalEditorialOverrideYears(monthDay: string) {
  return Object.values(editorialOverrides)
    .filter((issue) => issue.monthDay === monthDay)
    .map((issue) => issue.year)
    .sort((left, right) => left - right);
}
