import type { ArticleCandidate, SourceName } from '@/lib/db/types';

export type SourceCrawlerInput = {
  year: number;
  month: number;
  day: number;
};

type AnchorRecord = {
  href: string;
  text: string;
};

type HtmlFetchOptions = RequestInit & {
  next?: {
    revalidate: number;
  };
};

const BACKTHEN_FETCH_HEADERS = {
  'user-agent': 'BackThenBot/1.0 (+https://backthen.example)',
  accept: 'text/html,application/xhtml+xml'
};

const CHARSET_ALIASES: Record<string, string> = {
  utf8: 'utf-8',
  'x-windows-949': 'euc-kr',
  'windows-949': 'euc-kr',
  cp949: 'euc-kr',
  ms949: 'euc-kr',
  uhc: 'euc-kr',
  ksc5601: 'euc-kr',
  'ks_c_5601-1987': 'euc-kr',
  'ks_c_5601-1989': 'euc-kr',
  'csksc56011987': 'euc-kr'
};

function normalizeCharset(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/^["']|["']$/g, '').toLowerCase();
  return CHARSET_ALIASES[normalized] ?? normalized;
}

function extractCharsetFromContentType(contentType: string | null) {
  const match = contentType?.match(/charset\s*=\s*([^;]+)/i);
  return normalizeCharset(match?.[1] ?? null);
}

function getAsciiPreview(bytes: Uint8Array, maxLength = 2048) {
  return Array.from(bytes.slice(0, maxLength), (byte) => String.fromCharCode(byte)).join('');
}

function extractCharsetFromHtml(bytes: Uint8Array) {
  const preview = getAsciiPreview(bytes);
  const metaCharsetMatch =
    preview.match(/<meta[^>]+charset=["']?\s*([^"'\/>\s;]+)/i) ??
    preview.match(/<meta[^>]+content=["'][^"']*charset=([^"'\/>\s;]+)/i) ??
    preview.match(/<\?xml[^>]+encoding=["']([^"']+)/i);

  return normalizeCharset(metaCharsetMatch?.[1] ?? null);
}

function decodeHtml(bytes: Uint8Array, charsets: Array<string | null>) {
  const attempts = uniqueBy(
    [...charsets, 'utf-8'].filter((charset): charset is string => Boolean(charset)),
    (charset) => charset
  );

  for (const charset of attempts) {
    try {
      return new TextDecoder(charset).decode(bytes);
    } catch {
      continue;
    }
  }

  return new TextDecoder().decode(bytes);
}

export async function fetchHtml(url: string, options?: HtmlFetchOptions) {
  try {
    const headers = new Headers(BACKTHEN_FETCH_HEADERS);

    for (const [key, value] of new Headers(options?.headers ?? {}).entries()) {
      headers.set(key, value);
    }

    const method = (options?.method ?? 'GET').toUpperCase();
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options?.signal ?? AbortSignal.timeout(8000),
      next: options?.next ?? (method === 'GET' || method === 'HEAD' ? { revalidate: 3600 } : undefined)
    });

    if (!response.ok) {
      return null;
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    const headerCharset = extractCharsetFromContentType(response.headers.get('content-type'));
    const htmlCharset = extractCharsetFromHtml(bytes);

    return decodeHtml(bytes, [headerCharset, htmlCharset]);
  } catch {
    return null;
  }
}

export function padDate(value: number) {
  return String(value).padStart(2, '0');
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function extractSegment(html: string, startMarker: string, endMarker: string) {
  const startIndex = html.indexOf(startMarker);

  if (startIndex === -1) {
    return null;
  }

  const sliced = html.slice(startIndex);
  const endIndex = sliced.indexOf(endMarker);

  if (endIndex === -1) {
    return sliced;
  }

  return sliced.slice(0, endIndex + endMarker.length);
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&#8230;/g, '…')
    .replace(/&#x2026;/gi, '…')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function stripHtml(value: string) {
  return normalizeWhitespace(decodeHtmlEntities(value.replace(/<[^>]*>/g, ' ')));
}

export function resolveUrl(baseUrl: string, href: string) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function collectAnchors(html: string, baseUrl: string): AnchorRecord[] {
  const matches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];

  return matches
    .map((match) => {
      const href = resolveUrl(baseUrl, match[1]);
      const text = stripHtml(match[2]);

      return href && text
        ? {
            href,
            text
          }
        : null;
    })
    .filter((record): record is AnchorRecord => Boolean(record));
}

export function collectArticleAnchors(
  html: string,
  baseUrl: string,
  options?: {
    startMarker?: string;
    endMarker?: string;
    hrefPattern?: RegExp;
  }
) {
  const segment =
    options?.startMarker && options?.endMarker ? extractSegment(html, options.startMarker, options.endMarker) ?? '' : html;
  const hrefPattern = options?.hrefPattern ?? /\/article\//;

  return uniqueBy(
    collectAnchors(segment, baseUrl).filter((anchor) => hrefPattern.test(anchor.href)),
    (anchor) => anchor.href
  );
}

export function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractMetaContent(html: string, key: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const match = pattern.exec(html);

  return match?.[1] ? decodeHtmlEntities(match[1]) : null;
}

export function extractTitle(html: string) {
  const rawTitle = stripHtml(extractMetaContent(html, 'og:title') ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  return normalizeHeadline(rawTitle);
}

export function extractPublishedAt(html: string) {
  return (
    extractMetaContent(html, 'article:published_time') ??
    extractMetaContent(html, 'og:article:published_time') ??
    html.match(/datetime=["']([^"']+)["']/i)?.[1] ??
    new Date().toISOString()
  );
}

export function extractSection(html: string) {
  return extractMetaContent(html, 'article:section') ?? extractMetaContent(html, 'og:article:section');
}

export function extractImageUrl(html: string, baseUrl: string) {
  const raw = extractMetaContent(html, 'og:image');

  return raw ? resolveUrl(baseUrl, raw) : null;
}

export function extractExcerpt(html: string) {
  const metaDescription =
    extractMetaContent(html, 'description') ??
    extractMetaContent(html, 'og:description') ??
    [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((match) => stripHtml(match[1]))
      .find((paragraph) => paragraph.length >= 30) ??
    null;

  return metaDescription ? normalizeWhitespace(metaDescription) : null;
}

export function buildDuplicateClusterKey(title: string) {
  return normalizeWhitespace(title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' '))
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .slice(0, 6)
    .join(' ');
}

export function computeEventScore(title: string, section: string | null) {
  const keywords: Record<string, number> = {
    대통령: 4.2,
    선거: 3.8,
    전쟁: 4.4,
    북핵: 4.3,
    정상회담: 4.1,
    IMF: 4.7,
    긴급: 2.8,
    참사: 4.6,
    판결: 3.3,
    폭발: 4.2,
    총파업: 3.8
  };

  const titleScore = Object.entries(keywords).reduce((score, [keyword, bonus]) => {
    return title.includes(keyword) ? score + bonus : score;
  }, 1.4);

  const sectionScore = section ? computeSectionScore(section) : 0;

  return Number((titleScore + sectionScore).toFixed(2));
}

function computeSectionScore(section: string) {
  if (section.includes('정치') || section.includes('국제')) {
    return 2.4;
  }

  if (section.includes('사회')) {
    return 2.2;
  }

  if (section.includes('경제')) {
    return 1.9;
  }

  return 0.7;
}

export async function candidateFromArticleUrl(
  sourceName: SourceName,
  url: string,
  titleFallback: string,
  expectedDate?: {
    year: number;
    month: number;
    day: number;
  }
): Promise<ArticleCandidate | null> {
  const html = await fetchHtml(url);

  if (!html) {
    return null;
  }

  const title = extractTitle(html) || normalizeHeadline(titleFallback);
  const section = extractSection(html);
  const publishedAt = extractPublishedAt(html);

  if (expectedDate && !matchesRequestedDate(url, publishedAt, expectedDate)) {
    return null;
  }

  const candidate: ArticleCandidate = {
    sourceName,
    title,
    url,
    publishedAt,
    excerpt: extractExcerpt(html),
    imageUrl: extractImageUrl(html, url),
    section,
    duplicateClusterKey: buildDuplicateClusterKey(title),
    sourceWeight: 5,
    eventScore: computeEventScore(title, section)
  };

  return candidate;
}

export function normalizeHeadline(title: string) {
  return normalizeWhitespace(
    title
      .replace(/\s*[|｜]\s*(중앙일보|동아일보|조선일보|JoongAng Ilbo|The Dong-a Ilbo|Chosun)\s*$/i, '')
      .replace(/\s*-\s*(중앙일보|동아일보|조선일보)\s*$/i, '')
  );
}

function matchesRequestedDate(
  articleUrl: string,
  publishedAt: string | null,
  expectedDate: {
    year: number;
    month: number;
    day: number;
  }
) {
  const requested = `${expectedDate.year}-${padDate(expectedDate.month)}-${padDate(expectedDate.day)}`;
  const publishedParts = extractComparableDateParts(publishedAt);

  if (publishedParts && publishedParts.isoDate === requested) {
    return true;
  }

  const urlParts = extractComparableDateParts(articleUrl);

  if (urlParts && urlParts.isoDate === requested) {
    return true;
  }

  return false;
}

function extractComparableDateParts(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = decodeHtmlEntities(value);
  const compactMatch = normalized.match(/((?:19|20)\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])/);

  if (compactMatch) {
    const [, year, month, day] = compactMatch;
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      isoDate: `${year}-${month}-${day}`
    };
  }

  const slashPathMatch = normalized.match(/\/((?:19|20)\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])(?:\/|$)/);

  if (slashPathMatch) {
    const [, year, month, day] = slashPathMatch;
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      isoDate: `${year}-${month}-${day}`
    };
  }

  const ymdMatch = normalized.match(/\b((?:19|20)\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b/);

  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      isoDate: `${year}-${month}-${day}`
    };
  }

  return null;
}

export function filterLikelyArticles(anchors: AnchorRecord[], dateSegments: string[]) {
  return uniqueBy(
    anchors.filter((anchor) => {
      if (anchor.text.length < 12 || anchor.text.length > 120) {
        return false;
      }

      const hrefLower = anchor.href.toLowerCase();
      const hasDateInPath = dateSegments.every((segment) => hrefLower.includes(`/${segment.toLowerCase()}/`));
      const likelyArticlePath =
        hrefLower.includes('/article') ||
        hrefLower.includes('/news') ||
        hrefLower.includes('/site/data/html_dir') ||
        hasDateInPath;

      return likelyArticlePath;
    }),
    (anchor) => anchor.href
  );
}
