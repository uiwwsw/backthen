import type { ArticleCandidate } from '@/lib/db/types';
import {
  buildDuplicateClusterKey,
  computeEventScore,
  candidateFromArticleUrl,
  collectArticleAnchors,
  fetchHtml,
  normalizeHeadline,
  padDate,
  stripHtml,
  type SourceCrawlerInput
} from '@/lib/sources/shared';

function getDongaEndpoints(year: number, month: number, day: number) {
  const ymd = `${year}${padDate(month)}${padDate(day)}`;

  return [
    `https://www.donga.com/news/search?query=&check_news=91&sorting=1&search_date=5&v1=${ymd}&v2=${ymd}&more=1`,
    `https://www.donga.com/news/search?query=${encodeURIComponent(`${year} ${month} ${day}`)}&check_news=91&sorting=2&search_date=1&v1=&v2=&more=1`
  ];
}

function buildDongaArchiveViewUrl(year: number, month: number, day: number) {
  return `https://www.donga.com/archive/newslibrary/view?ymd=${year}${padDate(month)}${padDate(day)}`;
}

function buildArchiveArticleUrl(idx: string) {
  return `https://www.donga.com/archive/newslibrary/view?idx=${encodeURIComponent(idx)}`;
}

function getArchivePageThumbs(html: string) {
  const thumbs = new Map<string, string>();
  const matches = html.matchAll(
    /<img src='([^']+)'[^>]*><span class='bg'><\/span><\/a><a href='#' class='btn_list' onclick="javascript:return articleDetail\('([^']+)'\);"/g
  );

  for (const match of matches) {
    const [, imageUrl, pageKey] = match;

    if (!thumbs.has(pageKey)) {
      thumbs.set(pageKey, imageUrl);
    }
  }

  return thumbs;
}

function shouldSkipArchiveHeadline(title: string) {
  const normalized = title.replace(/\s+/g, ' ').trim();
  const comparable = normalized
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, '')
    .trim();

  const skipTitles = new Set([
    '횡설수설',
    '부음',
    '인사',
    '人事',
    '휴지통',
    '동아포스트',
    '東亞포스트',
    '세계표정',
    '오늘의 소사',
    '오늘의 小史',
    'TV하이라이트',
    '텔레비젼 프로',
    '정치',
    '경제',
    '국제',
    '사회',
    '문화',
    '스포츠',
    '오락',
    '영화',
    '드라마',
    '교양',
    '케이블TV',
    '위성방송',
    '해외토픽',
    '그래픽뉴스',
    '비즈니스 정보',
    '금융지표',
    '주간증시',
    '주식시세표',
    '투자포인트',
    '레이더',
    '동정',
    '動靜',
    '여록',
    '餘錄'
  ]);

  return skipTitles.has(normalized) || skipTitles.has(comparable);
}

function getArchiveSourceWeight(pageNumber: number, position: number) {
  const pageScore = Math.max(0, 14 - (pageNumber - 1) * 1.2);
  const positionScore = Math.max(0, 6 - position * 0.7);

  return Number((pageScore + positionScore).toFixed(2));
}

function parseArchiveCandidates(html: string, year: number, month: number, day: number): ArticleCandidate[] {
  const pageThumbs = getArchivePageThumbs(html);
  const publishedAt = `${year}-${padDate(month)}-${padDate(day)}T00:00:00+09:00`;
  const candidates: ArticleCandidate[] = [];
  const pageBlocks = html.matchAll(
    /<div class='list' id='seq_([^']+)'><span class='title'>([^<]+)<\/span><ul class='news_list'>([\s\S]*?)<\/ul><\/div>/g
  );

  for (const pageBlock of pageBlocks) {
    const [, pageKey, rawPageTitle, listHtml] = pageBlock;
    const pageMatch = rawPageTitle.match(/(\d+)면\s+(.+)/);
    const pageNumber = Number(pageMatch?.[1] ?? '99');
    const section = pageMatch?.[2]?.trim() ?? rawPageTitle.trim();
    const pageThumb = pageThumbs.get(pageKey) ?? null;
    const articleMatches = listHtml.matchAll(
      /getNewsArticle\('([^']+)'\)[^>]*>\s*([\s\S]*?)\s*<\/a>/g
    );

    let position = 0;

    for (const articleMatch of articleMatches) {
      const [, idx, rawTitle] = articleMatch;
      const cleanedRawTitle = stripHtml(rawTitle);

      if (!cleanedRawTitle || shouldSkipArchiveHeadline(cleanedRawTitle)) {
        continue;
      }

      const title = normalizeHeadline(cleanedRawTitle);

      candidates.push({
        sourceName: 'donga',
        title,
        rawTitle: cleanedRawTitle,
        url: buildArchiveArticleUrl(idx),
        publishedAt,
        excerpt: null,
        imageUrl: pageThumb,
        section,
        duplicateClusterKey: buildDuplicateClusterKey(title),
        sourceWeight: getArchiveSourceWeight(pageNumber, position),
        eventScore: computeEventScore(title, section)
      });

      position += 1;
    }
  }

  return candidates;
}

async function crawlDongaArchive({ year, month, day }: SourceCrawlerInput): Promise<ArticleCandidate[]> {
  const html = await fetchHtml(buildDongaArchiveViewUrl(year, month, day));

  if (!html) {
    return [];
  }

  return parseArchiveCandidates(html, year, month, day);
}

export async function crawlDonga({ year, month, day }: SourceCrawlerInput): Promise<ArticleCandidate[]> {
  const endpoints = getDongaEndpoints(year, month, day);

  for (const endpoint of endpoints) {
    const html = await fetchHtml(endpoint);

    if (!html) {
      continue;
    }

    const anchors = collectArticleAnchors(html, endpoint, {
      startMarker: "<ul class='row_list'>",
      endMarker: '</ul>',
      hrefPattern: /\/news\/|sports\.donga\.com\/news\//
    }).slice(0, 12);

    if (anchors.length === 0) {
      continue;
    }

    const candidates = await Promise.all(
      anchors.map((anchor) => candidateFromArticleUrl('donga', anchor.href, anchor.text, { year, month, day }))
    );

    const validCandidates = candidates.filter((candidate): candidate is ArticleCandidate => Boolean(candidate));

    if (validCandidates.length > 0) {
      return validCandidates;
    }
  }

  return crawlDongaArchive({ year, month, day });
}
