import type { SourceName } from '@/lib/db/types';

export type SeoulDate = {
  year: number;
  month: number;
  day: number;
  monthDay: string;
  isoDate: string;
};

const seoulFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

export function getTodayInSeoul(reference = new Date()): SeoulDate {
  const parts = seoulFormatter.formatToParts(reference);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '0');
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '0');
  const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    monthDay,
    isoDate: `${year}-${monthDay}`
  };
}

export function toKoreanDateLabel(year: number, month: number, day: number) {
  return `${year}년 ${month}월 ${day}일`;
}

export function toMonthDayLabel(month: number, day: number) {
  return `${month}월 ${day}일`;
}

export function formatPublishedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul'
  }).format(date);
}

export function getSourceLabel(sourceName: SourceName, sourceUrl?: string) {
  switch (sourceName) {
    case 'chosun':
      return '조선일보';
    case 'joongang':
      return '중앙일보';
    case 'donga':
      return sourceUrl?.includes('/archive/newslibrary/') ? '동아일보 디지털 아카이브' : '동아일보';
    default:
      return sourceName;
  }
}

export function getSourceWebAddress(url: string) {
  try {
    const target = new URL(url);
    return `${target.origin}${target.pathname}${target.search}`;
  } catch {
    return url;
  }
}
