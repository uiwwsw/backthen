import { cache } from 'react';
import { getEditorialOverride, getIssueRecord, storeIssueRecord, updateIssueVisual } from '@/lib/db/queries';
import type { IssueOfDay } from '@/lib/db/types';
import { searchBackgroundImage } from '@/lib/news/wikimediaImageSearch';
import { crawlChosun } from '@/lib/sources/chosun';
import { crawlDonga } from '@/lib/sources/donga';
import { crawlJoongang } from '@/lib/sources/joongang';
import { getLocalEditorialOverride } from '@/lib/news/editorialOverrides';
import { resolveBackgroundImage } from '@/lib/news/imagePolicy';
import { rankIssueCandidates } from '@/lib/news/rankIssueCandidates';
import { summarizeIssue } from '@/lib/news/summarizeIssue';

function toMonthDayParts(monthDay: string) {
  const [month, day] = monthDay.split('-').map(Number);
  return { month, day };
}

function isStoredIssueValid(issue: IssueOfDay, requestedYear: number, requestedMonthDay: string) {
  if (issue.year !== requestedYear || issue.monthDay !== requestedMonthDay) {
    return false;
  }

  if (!issue.backgroundImageUrl && issue.sourceUrl.includes('/archive/newslibrary/view?idx=')) {
    return false;
  }

  const published = issue.publishedAt.match(/((?:19|20)\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])/);

  if (!published) {
    return true;
  }

  const [, year, month, day] = published;
  return `${year}-${month}-${day}` === `${requestedYear}-${requestedMonthDay}`;
}

async function enrichIssueVisual(issue: IssueOfDay, options?: { persist: boolean }) {
  const searchedImage = await searchBackgroundImage({
    title: issue.headline,
    keywords: issue.keywords,
    monthDay: issue.monthDay,
    year: issue.year
  });

  if (!searchedImage) {
    return issue;
  }

  const enrichedIssue = {
    ...issue,
    backgroundImageUrl: searchedImage.backgroundImageUrl,
    backgroundImageCredit: searchedImage.backgroundImageCredit,
    imageStatus: searchedImage.imageStatus
  };

  const hasVisualChanged =
    issue.backgroundImageUrl !== enrichedIssue.backgroundImageUrl ||
    issue.backgroundImageCredit !== enrichedIssue.backgroundImageCredit ||
    issue.imageStatus !== enrichedIssue.imageStatus;

  if (options?.persist && hasVisualChanged) {
    try {
      await updateIssueVisual(issue.year, issue.monthDay, searchedImage);
    } catch {
      return enrichedIssue;
    }
  }

  return enrichedIssue;
}

export const getOrCreateIssueOfThatDay = cache(async (year: number, monthDay: string): Promise<IssueOfDay | null> => {
  const localOverride = getLocalEditorialOverride(year, monthDay);

  if (localOverride) {
    return enrichIssueVisual(localOverride);
  }

  let existing: IssueOfDay | null = null;

  try {
    existing = await getIssueRecord(year, monthDay);
  } catch {
    existing = null;
  }

  if (existing && isStoredIssueValid(existing, year, monthDay)) {
    return enrichIssueVisual(existing, { persist: true });
  }

  let override: IssueOfDay | null = null;

  try {
    override = await getEditorialOverride(year, monthDay);
  } catch {
    override = null;
  }

  if (override) {
    return enrichIssueVisual(override);
  }

  const { month, day } = toMonthDayParts(monthDay);

  const sourceGroups = await Promise.allSettled([
    crawlChosun({ year, month, day }),
    crawlJoongang({ year, month, day }),
    crawlDonga({ year, month, day })
  ]);

  const candidates = sourceGroups.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const selection = rankIssueCandidates(candidates);

  if (!selection) {
    return null;
  }

  const visual = await resolveBackgroundImage(selection.primary, {
    year,
    monthDay,
    keywords: selection.keywords
  });
  const issue: IssueOfDay = {
    year,
    monthDay,
    headline: selection.primary.title,
    summary: summarizeIssue({
      year,
      monthDay,
      primary: selection.primary,
      related: selection.secondary
    }),
    sourceName: selection.primary.sourceName,
    sourceUrl: selection.primary.url,
    publishedAt: selection.primary.publishedAt,
    backgroundImageUrl: visual.backgroundImageUrl,
    backgroundImageCredit: visual.backgroundImageCredit,
    imageStatus: visual.imageStatus,
    keywords: selection.keywords,
    importanceScore: selection.importanceScore,
    relatedArticles: selection.related,
    secondaryArticles: selection.secondary
  };

  try {
    await storeIssueRecord(issue, candidates);
  } catch {
    return issue;
  }

  return issue;
});
