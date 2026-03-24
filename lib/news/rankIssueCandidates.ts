import type { ArticleCandidate, SourceName } from '@/lib/db/types';

export type RankedIssueSelection = {
  primary: ArticleCandidate;
  related: ArticleCandidate[];
  secondary: ArticleCandidate[];
  importanceScore: number;
  keywords: string[];
};

const sectionBonus: Record<string, number> = {
  정치: 6,
  사회: 5.5,
  국제: 5,
  경제: 4.6,
  사건: 5.8,
  사고: 5.6,
  대통령: 6.5,
  북한: 6.1
};

const sourceOrder: Record<SourceName, number> = {
  chosun: 0,
  joongang: 1,
  donga: 2
};

function tokenizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .filter((token) => !['오늘', '기자', '단독', '속보', '관련', '대한', '그리고'].includes(token));
}

function buildClusterKey(candidate: ArticleCandidate) {
  if (candidate.duplicateClusterKey) {
    return candidate.duplicateClusterKey;
  }

  return tokenizeTitle(candidate.title).slice(0, 6).join(' ');
}

function getSectionScore(section: string | null) {
  if (!section) {
    return 0;
  }

  return Object.entries(sectionBonus).reduce((score, [keyword, bonus]) => {
    return section.includes(keyword) ? score + bonus : score;
  }, 0);
}

function getClusterKeywords(candidates: ArticleCandidate[]) {
  const counter = new Map<string, number>();

  for (const candidate of candidates) {
    for (const token of tokenizeTitle(candidate.title)) {
      counter.set(token, (counter.get(token) ?? 0) + 1);
    }
  }

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([token]) => token);
}

export function getCandidatePriorityScore(candidate: ArticleCandidate) {
  return candidate.sourceWeight + candidate.eventScore + (candidate.excerpt ? 1 : 0) + (candidate.imageUrl ? 1 : 0);
}

function getArticleRankScore(candidate: ArticleCandidate) {
  return getCandidatePriorityScore(candidate) + getSectionScore(candidate.section);
}

function compareByRank(left: ArticleCandidate, right: ArticleCandidate) {
  return getArticleRankScore(right) - getArticleRankScore(left);
}

function compareBySourceOrder(left: ArticleCandidate, right: ArticleCandidate) {
  return sourceOrder[left.sourceName] - sourceOrder[right.sourceName];
}

function pickSourceLeadArticles(candidates: ArticleCandidate[]) {
  const grouped = new Map<SourceName, ArticleCandidate[]>();

  for (const candidate of candidates) {
    const existing = grouped.get(candidate.sourceName) ?? [];
    existing.push(candidate);
    grouped.set(candidate.sourceName, existing);
  }

  return [...grouped.values()]
    .map((group) => [...group].sort(compareByRank)[0])
    .sort(compareByRank);
}

export function pickSecondaryArticles(candidates: ArticleCandidate[], primary: ArticleCandidate, limit = 2) {
  const sourceLeads = pickSourceLeadArticles(candidates);
  return sourceLeads
    .filter((candidate) => candidate.url !== primary.url && candidate.sourceName !== primary.sourceName)
    .slice(0, limit)
    .sort(compareBySourceOrder);
}

export function pickRelatedArticles(
  candidates: ArticleCandidate[],
  primary: ArticleCandidate,
  options?: {
    excludeUrls?: string[];
    limit?: number;
  }
) {
  const limit = options?.limit ?? 4;
  const excluded = new Set(options?.excludeUrls ?? []);
  excluded.add(primary.url);

  const sameSource = candidates
    .filter((candidate) => candidate.sourceName === primary.sourceName && !excluded.has(candidate.url))
    .sort(compareByRank);
  const selected: ArticleCandidate[] = [];
  const seenUrls = new Set<string>(excluded);

  for (const candidate of sameSource) {
    if (selected.length >= limit) {
      break;
    }

    selected.push(candidate);
    seenUrls.add(candidate.url);
  }

  if (selected.length >= limit) {
    return selected;
  }

  const sorted = [...candidates].sort(compareByRank);

  for (const candidate of sorted) {
    if (selected.length >= limit) {
      break;
    }

    if (seenUrls.has(candidate.url)) {
      continue;
    }

    selected.push(candidate);
    seenUrls.add(candidate.url);
  }

  return selected;
}

export function rankIssueCandidates(candidates: ArticleCandidate[]): RankedIssueSelection | null {
  if (candidates.length === 0) {
    return null;
  }

  const sourceLeads = pickSourceLeadArticles(candidates);
  const primary = sourceLeads[0];

  if (!primary) {
    return null;
  }

  const secondary = pickSecondaryArticles(candidates, primary, 2);
  const related = pickRelatedArticles(candidates, primary, {
    excludeUrls: secondary.map((article) => article.url),
    limit: 4
  });
  const keywords = getClusterKeywords([primary, ...secondary, ...related]);
  const importanceScore = Number(
    (
      sourceLeads.reduce((score, candidate) => score + getArticleRankScore(candidate), 0) +
      related.slice(0, 2).reduce((score, candidate) => score + getArticleRankScore(candidate) * 0.45, 0)
    ).toFixed(2)
  );

  return {
    primary,
    related,
    secondary,
    importanceScore,
    keywords
  };
}
