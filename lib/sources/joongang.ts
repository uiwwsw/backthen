import type { ArticleCandidate } from '@/lib/db/types';
import {
  buildDuplicateClusterKey,
  computeEventScore,
  candidateFromArticleUrl,
  collectArticleAnchors,
  fetchHtml,
  normalizeHeadline,
  padDate,
  resolveUrl,
  stripHtml,
  type SourceCrawlerInput
} from '@/lib/sources/shared';

function getJoongangEndpoints(year: number, month: number, day: number) {
  const paddedMonth = padDate(month);
  const paddedDay = padDate(day);
  const exactDate = `${year}.${paddedMonth}.${paddedDay}`;
  const keywords = [
    `${year}년 ${month}월 ${day}일`,
    `${year}.${paddedMonth}.${paddedDay}`,
    `${year}-${paddedMonth}-${paddedDay}`,
    `${year}${paddedMonth}${paddedDay}`
  ];

  return [
    `https://www.joongang.co.kr/_CP/598?keyword=${encodeURIComponent(keywords[0])}&startDate=${exactDate}&endDate=${exactDate}&sfield=&serviceCode=&sourceCode=1,3&accurateWord=&searchin=&stopword=&sort=&pageItemId=439&page=1`,
    ...keywords.map((keyword) => `https://www.joongang.co.kr/search/news?keyword=${encodeURIComponent(keyword)}`)
  ];
}

function parseResultDate(dateText: string) {
  const match = dateText.match(/((?:19|20)\d{2})\.(0[1-9]|1[0-2])\.(0[1-9]|[12]\d|3[01])/);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

function parseSearchPageCandidates(html: string, endpoint: string, input: SourceCrawlerInput) {
  const requestedDate = `${input.year}-${padDate(input.month)}-${padDate(input.day)}`;
  const publishedAt = `${requestedDate}T00:00:00+09:00`;
  const cards = html.split('<li class="card"').slice(1);
  const candidates: ArticleCandidate[] = [];

  for (const [index, card] of cards.entries()) {
    const url = resolveUrl(endpoint, card.match(/<a href="([^"]*\/article\/[^"]+)"/)?.[1] ?? '');
    const rawTitle = stripHtml(card.match(/<h2 class="headline">[\s\S]*?<a [^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '');
    const excerpt = stripHtml(card.match(/<p class="description[^"]*">([\s\S]*?)<\/p>/)?.[1] ?? '');
    const sourceText = stripHtml(card.match(/<p class="source">([\s\S]*?)<\/p>/)?.[1] ?? '');
    const dateText = stripHtml(card.match(/<p class="date">([\s\S]*?)<\/p>/)?.[1] ?? '');
    const imageUrl = resolveUrl(endpoint, card.match(/<img [^>]*src="([^"]+)"/)?.[1] ?? '') ?? null;

    if (!url || !rawTitle || !sourceText.includes('중앙일보')) {
      continue;
    }

    if (parseResultDate(dateText) !== requestedDate) {
      continue;
    }

    const title = normalizeHeadline(rawTitle);

    candidates.push({
      sourceName: 'joongang',
      title,
      rawTitle,
      url,
      publishedAt,
      excerpt: excerpt || null,
      imageUrl,
      section: null,
      duplicateClusterKey: buildDuplicateClusterKey(title),
      sourceWeight: Number((9 - index * 0.7).toFixed(2)),
      eventScore: computeEventScore(title, null)
    });
  }

  return candidates;
}

export async function crawlJoongang({ year, month, day }: SourceCrawlerInput): Promise<ArticleCandidate[]> {
  const endpoints = getJoongangEndpoints(year, month, day);

  for (const endpoint of endpoints) {
    const html = await fetchHtml(endpoint);

    if (!html) {
      continue;
    }

    const pageCandidates = parseSearchPageCandidates(html, endpoint, { year, month, day });

    if (pageCandidates.length > 0) {
      return pageCandidates;
    }

    const anchors = collectArticleAnchors(html, endpoint, {
      startMarker: '<ul class="story_list">',
      endMarker: '</ul>'
    }).slice(0, 12);

    if (anchors.length === 0) {
      continue;
    }

    const candidates = await Promise.all(
      anchors.map((anchor) => candidateFromArticleUrl('joongang', anchor.href, anchor.text, { year, month, day }))
    );

    const validCandidates = candidates.filter((candidate): candidate is ArticleCandidate => Boolean(candidate));

    if (validCandidates.length > 0) {
      return validCandidates;
    }
  }

  return [];
}
