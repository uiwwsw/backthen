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

function buildChosunArchiveUrl(year: number, month: number, day: number) {
  return `https://archive.chosun.com/pdf/i_service/index_new_s.jsp?Y=${year}&M=${padDate(month)}&D=${padDate(day)}`;
}

function buildChosunTextSearchUrl() {
  return 'https://archive.chosun.com/pdf/i_service/pdf_SearchList_s.jsp';
}

function shouldSkipArchiveHeadline(title: string) {
  const normalized = title.replace(/\s+/g, ' ').trim();
  const comparable = normalized.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/\s+/g, '').trim();
  const skipTitles = new Set([
    '만물상',
    '팔면봉',
    '사설',
    '독자투고',
    '기자수첩',
    '데스크칼럼',
    '편집자에게',
    '전문가시각',
    '이규태코너',
    '색연필'
  ]);

  return skipTitles.has(normalized) || skipTitles.has(comparable);
}

function getArchiveSourceWeight(pageNumber: number, position: number) {
  const pageScore = Math.max(0, 16 - (pageNumber - 1) * 1.15);
  const positionScore = Math.max(0, 6 - position * 0.65);

  return Number((pageScore + positionScore).toFixed(2));
}

function getArchiveSection(block: string) {
  const section = stripHtml(block.match(/<div class="ss_txt">\s*([\s\S]*?)<br\s*\/?>/i)?.[1] ?? '');
  return section || null;
}

function getLegacyArchiveTitles(listHtml: string) {
  return [...listHtml.matchAll(/<span class="ss_list\d+">([\s\S]*?)<\/span>/gi)]
    .map((match) => stripHtml(match[1]).replace(/[;；]+$/g, '').trim())
    .filter(Boolean);
}

function buildChosunTextSearchParams(year: number, month: number, day: number) {
  const ymd = `${year}${padDate(month)}${padDate(day)}`;
  const params = new URLSearchParams();
  params.set('requestSearchPage', 'simple');
  params.set('collectionType', 'gisa');
  params.set('FV', '');
  params.append('INDEX_FV', 'TI');
  params.append('INDEX_FV', 'TX');
  params.append('INDEX_FV', 'KW');
  params.set('AU_FV', '');
  params.set('PD_TYPE', 'false');
  params.set('PD_F1', ymd);
  params.set('PD_OP', '2');
  params.set('PD_F2', '');
  params.set('DATA_SORT', '2');
  params.set('LIST_TYPE', 'false');
  params.set('sRowsperPage', '50');
  return params;
}

function buildChosunTextCandidateUrl(year: number, month: number, day: number, pageNumber: number | null, index: number) {
  const base = buildChosunArchiveUrl(year, month, day);
  return pageNumber ? `${base}#text-page-${pageNumber}-article-${index + 1}` : `${base}#text-article-${index + 1}`;
}

function parseChosunTextSection(meta: string) {
  const edition = meta.match(/(조간|석간)/)?.[1] ?? null;
  const pageNumber = Number(meta.match(/(\d+)\s*면/)?.[1] ?? '0') || null;
  const section = [edition, pageNumber ? `${pageNumber}면` : null].filter(Boolean).join(' ') || null;

  return {
    pageNumber,
    section
  };
}

function parseTextArchiveCandidates(html: string, year: number, month: number, day: number) {
  const noDataMessage = stripHtml(html.match(/<h3>([\s\S]*?)<\/h3>/i)?.[1] ?? '');

  if (noDataMessage.includes('데이타가 존재하지 않습니다')) {
    return [];
  }

  const publishedAt = `${year}-${padDate(month)}-${padDate(day)}T00:00:00+09:00`;
  const blocks = html.split('<div id="search_list">').slice(1);
  const candidates: ArticleCandidate[] = [];

  for (const [index, block] of blocks.entries()) {
    const rawTitle = stripHtml(block.match(/<span class="list_tit">([\s\S]*?)<\/span>/i)?.[1] ?? '').replace(/[;；]+$/g, '').trim();
    const meta = stripHtml(block.match(/<div class="gigoja">([\s\S]*?)<\/div>/i)?.[1] ?? '');

    if (!rawTitle || shouldSkipArchiveHeadline(rawTitle)) {
      continue;
    }

    const title = normalizeHeadline(rawTitle);
    const { pageNumber, section } = parseChosunTextSection(meta);
    const position = Math.min(index, 12);

    candidates.push({
      sourceName: 'chosun',
      title,
      rawTitle,
      url: buildChosunTextCandidateUrl(year, month, day, pageNumber, index),
      publishedAt,
      excerpt: null,
      imageUrl: null,
      section,
      duplicateClusterKey: buildDuplicateClusterKey(title),
      sourceWeight: getArchiveSourceWeight(pageNumber ?? 9, position),
      eventScore: computeEventScore(title, section)
    });
  }

  return candidates;
}

function parseArchiveCandidates(html: string, year: number, month: number, day: number) {
  const publishedAt = `${year}-${padDate(month)}-${padDate(day)}T00:00:00+09:00`;
  const candidates: ArticleCandidate[] = [];
  const blocks = html.split('<div class="ss_txt">').slice(1);

  for (const block of blocks) {
    const pageNumber = Number(block.match(/<br\s*\/?>\s*(\d+)\s*<br\s*\/?>/i)?.[1] ?? block.match(/\s*(\d+)\s*<BR>/)?.[1] ?? '0');
    const listHtml = block.match(/<div class="ss_arti_tit">[\s\S]*?<ul>([\s\S]*?)<\/ul>/)?.[1];
    const section = getArchiveSection(`<div class="ss_txt">${block}`);
    const imageUrl = resolveUrl('https://archive.chosun.com', block.match(/<img src="([^"]+)"/)?.[1] ?? '') ?? null;
    const pageUrl =
      resolveUrl('https://archive.chosun.com', block.match(/<a href="([^"]*index_full_s\.jsp[^"]*)"/i)?.[1] ?? '') ?? null;

    if (!pageNumber || !listHtml) {
      continue;
    }

    const articleMatches = [...listHtml.matchAll(/<a href="([^"]*pdf_ReadBody_s\.jsp[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
    const articleSection = section ? `${pageNumber}면 ${section}` : `${pageNumber}면`;
    let position = 0;

    for (const articleMatch of articleMatches) {
      const [, href, rawTitle] = articleMatch;
      const cleanedRawTitle = stripHtml(rawTitle).replace(/[;；]+$/g, '').trim();

      if (!cleanedRawTitle || shouldSkipArchiveHeadline(cleanedRawTitle)) {
        continue;
      }

      const title = normalizeHeadline(cleanedRawTitle);

      candidates.push({
        sourceName: 'chosun',
        title,
        rawTitle: cleanedRawTitle,
        url: resolveUrl('https://archive.chosun.com', href) ?? href,
        publishedAt,
        excerpt: null,
        imageUrl,
        section: articleSection,
        duplicateClusterKey: buildDuplicateClusterKey(title),
        sourceWeight: getArchiveSourceWeight(pageNumber, position),
        eventScore: computeEventScore(title, articleSection)
      });

      position += 1;
    }

    if (articleMatches.length > 0) {
      continue;
    }

    const legacyTitles = getLegacyArchiveTitles(listHtml);

    for (const [legacyPosition, rawTitle] of legacyTitles.entries()) {
      if (shouldSkipArchiveHeadline(rawTitle)) {
        continue;
      }

      const title = normalizeHeadline(rawTitle);
      const fallbackUrl =
        pageUrl ? `${pageUrl}#article-${pageNumber}-${legacyPosition + 1}` : `https://archive.chosun.com/#${year}${padDate(month)}${padDate(day)}-${pageNumber}-${legacyPosition + 1}`;

      candidates.push({
        sourceName: 'chosun',
        title,
        rawTitle,
        url: fallbackUrl,
        publishedAt,
        excerpt: null,
        imageUrl,
        section: articleSection,
        duplicateClusterKey: buildDuplicateClusterKey(title),
        sourceWeight: getArchiveSourceWeight(pageNumber, legacyPosition),
        eventScore: computeEventScore(title, articleSection)
      });
    }
  }

  return candidates;
}

async function crawlChosunArchive({ year, month, day }: SourceCrawlerInput): Promise<ArticleCandidate[]> {
  const html = await fetchHtml(buildChosunArchiveUrl(year, month, day));

  if (!html) {
    return [];
  }

  return parseArchiveCandidates(html, year, month, day);
}

async function crawlChosunTextArchive({ year, month, day }: SourceCrawlerInput): Promise<ArticleCandidate[]> {
  const html = await fetchHtml(buildChosunTextSearchUrl(), {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: buildChosunTextSearchParams(year, month, day).toString()
  });

  if (!html) {
    return [];
  }

  return parseTextArchiveCandidates(html, year, month, day);
}

export async function crawlChosun({ year, month, day }: SourceCrawlerInput): Promise<ArticleCandidate[]> {
  if (year < 1945) {
    return crawlChosunTextArchive({ year, month, day });
  }

  const sourceUrl = `https://www.chosun.com/search/?query=${encodeURIComponent(`${year}년 ${month}월 ${day}일`)}`;
  const html = await fetchHtml(sourceUrl);

  if (html) {
    const anchors = collectArticleAnchors(html, sourceUrl, {
      hrefPattern: /\/site\/data\/html_dir\/|\/[a-z-]+\/[a-z-]+\/[A-Z0-9]{8,}/i
    }).slice(0, 12);

    if (anchors.length > 0) {
      const candidates = await Promise.all(
        anchors.map((anchor) => candidateFromArticleUrl('chosun', anchor.href, anchor.text, { year, month, day }))
      );

      const validCandidates = candidates.filter((candidate): candidate is ArticleCandidate => Boolean(candidate));

      if (validCandidates.length > 0) {
        return validCandidates;
      }
    }
  }

  return crawlChosunArchive({ year, month, day });
}
