import { randomInt } from 'crypto';
import { getAvailableIssueYearsForMonthDay } from '@/lib/db/queries';
import { getLocalEditorialOverrideYears } from '@/lib/news/editorialOverrides';
import { getOrCreateIssueOfThatDay } from '@/lib/news/getOrCreateIssueOfThatDay';
import { MIN_YEAR } from '@/lib/year';

function buildCandidateYears(activeYear: number, currentYear: number) {
  const years: number[] = [];

  for (let year = MIN_YEAR; year <= currentYear; year += 1) {
    if (year !== activeYear) {
      years.push(year);
    }
  }

  return years;
}

function shuffleInPlace<T>(values: T[]) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
}

export async function pickRandomAvailableIssueYear(monthDay: string, activeYear: number, currentYear: number) {
  const knownYears = new Set<number>(getLocalEditorialOverrideYears(monthDay));

  try {
    const storedYears = await getAvailableIssueYearsForMonthDay(monthDay);

    for (const year of storedYears) {
      knownYears.add(year);
    }
  } catch {
    // Ignore database lookup failures and continue probing directly.
  }

  const candidateYears = buildCandidateYears(activeYear, currentYear);

  if (!candidateYears.length) {
    return null;
  }

  shuffleInPlace(candidateYears);

  // A uniform shuffle lets us stop at the first available year without biasing toward
  // either already-known years or whichever side of the active year we probe first.
  for (const candidateYear of candidateYears) {
    if (knownYears.has(candidateYear)) {
      return candidateYear;
    }

    const issue = await getOrCreateIssueOfThatDay(candidateYear, monthDay);

    if (issue) {
      return candidateYear;
    }
  }

  return null;
}
