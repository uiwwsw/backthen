import { getTodayInSeoul } from '@/lib/date';

export const MIN_YEAR = 1920;
export const MIN_YEARS_AGO = 0;
export const DEFAULT_YEARS_AGO = 30;
export const KOREAN_SERVICE_NAME = '몇 년 전 오늘';

export function getCurrentSeoulYear() {
  return getTodayInSeoul().year;
}

export function getMaxYearsAgo(currentYear = getCurrentSeoulYear()) {
  return Math.max(MIN_YEARS_AGO, currentYear - MIN_YEAR);
}

export function getDefaultYearsAgo(currentYear = getCurrentSeoulYear()) {
  return Math.min(DEFAULT_YEARS_AGO, getMaxYearsAgo(currentYear));
}

export function getYearFromYearsAgo(yearsAgo: number, currentYear = getCurrentSeoulYear()) {
  return currentYear - yearsAgo;
}

export function getYearsAgoFromYear(year: number, currentYear = getCurrentSeoulYear()) {
  return currentYear - year;
}

export function getResolvedYearsAgoTitle(yearsAgo: number) {
  if (yearsAgo === 0) {
    return '오늘';
  }

  return `${yearsAgo}년 전 오늘`;
}

export function validateYear(year: number, currentYear = getCurrentSeoulYear()) {
  return year >= MIN_YEAR && year <= currentYear;
}

export function validateYearsAgo(yearsAgo: number, currentYear = getCurrentSeoulYear()) {
  return yearsAgo >= MIN_YEARS_AGO && yearsAgo <= getMaxYearsAgo(currentYear);
}

export function sanitizeYearsAgoInput(input: string, maxLength: number) {
  return input.replace(/\D/g, '').slice(0, maxLength);
}

export function parseYearsAgoParam(input: string) {
  if (!/^\d{1,4}$/.test(input)) {
    return null;
  }

  return Number(input);
}

export function parseLegacyYearParam(input: string) {
  if (!/^\d{4}$/.test(input)) {
    return null;
  }

  return Number(input);
}
