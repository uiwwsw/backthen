import { cache } from 'react';
import { getAvailableIssueYearsForMonthDay } from '@/lib/db/queries';
import { getLocalEditorialOverrideYears } from '@/lib/news/editorialOverrides';
import { getOrCreateIssueOfThatDay } from '@/lib/news/getOrCreateIssueOfThatDay';
import { MIN_YEAR } from '@/lib/year';

const MAX_PROBE_DISTANCE = 8;

async function probeNearestAvailableYear(
  activeYear: number,
  monthDay: string,
  currentYear: number,
  direction: -1 | 1,
  knownYears: Set<number>
) {
  for (let distance = 1; distance <= MAX_PROBE_DISTANCE; distance += 1) {
    const candidateYear = activeYear + distance * direction;

    if (candidateYear < MIN_YEAR || candidateYear > currentYear) {
      break;
    }

    if (knownYears.has(candidateYear)) {
      return candidateYear;
    }

    const issue = await getOrCreateIssueOfThatDay(candidateYear, monthDay);

    if (issue) {
      knownYears.add(candidateYear);
      return candidateYear;
    }
  }

  return null;
}

export const getAvailableIssueYears = cache(async (monthDay: string, activeYear?: number, currentYear?: number) => {
  const years = new Set<number>(getLocalEditorialOverrideYears(monthDay));

  try {
    const storedYears = await getAvailableIssueYearsForMonthDay(monthDay);

    for (const year of storedYears) {
      years.add(year);
    }
  } catch {
    if (typeof activeYear === 'number') {
      years.add(activeYear);
    }

    if (typeof activeYear === 'number' && typeof currentYear === 'number') {
      await probeNearestAvailableYear(activeYear, monthDay, currentYear, -1, years);
      await probeNearestAvailableYear(activeYear, monthDay, currentYear, 1, years);
    }

    return Array.from(years).sort((left, right) => left - right);
  }

  if (typeof activeYear === 'number') {
    years.add(activeYear);
  }

  if (typeof activeYear === 'number' && typeof currentYear === 'number') {
    const sortedYears = Array.from(years).sort((left, right) => left - right);
    const hasPrevious = sortedYears.some((year) => year < activeYear);
    const hasNext = sortedYears.some((year) => year > activeYear);

    if (!hasPrevious) {
      await probeNearestAvailableYear(activeYear, monthDay, currentYear, -1, years);
    }

    if (!hasNext) {
      await probeNearestAvailableYear(activeYear, monthDay, currentYear, 1, years);
    }
  }

  return Array.from(years).sort((left, right) => left - right);
});
