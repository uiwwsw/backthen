import 'server-only';
import type { ImageStatus } from '@/lib/db/types';
import { normalizeWhitespace, stripHtml } from '@/lib/sources/shared';

type SearchBackgroundImageInput = {
  title: string;
  keywords: string[];
  year: number;
  monthDay: string;
};

type SearchBackgroundImageResult = {
  backgroundImageUrl: string;
  backgroundImageCredit: string;
  imageStatus: ImageStatus;
};

type WikimediaSearchRecord = {
  pageid: number;
  snippet?: string;
  title: string;
};

type WikimediaSearchResponse = {
  query?: {
    search?: WikimediaSearchRecord[];
  };
};

type WikimediaMetadataRecord = {
  value?: string;
};

type WikimediaImageInfo = {
  extmetadata?: Record<string, WikimediaMetadataRecord>;
  height?: number;
  mime?: string;
  thumburl?: string;
  url?: string;
  width?: number;
};

type WikimediaImagePage = {
  imageinfo?: WikimediaImageInfo[];
  missing?: boolean;
  title: string;
};

type WikimediaImageInfoResponse = {
  query?: {
    pages?: WikimediaImagePage[];
  };
};

type CommonsImageCandidate = {
  info: WikimediaImageInfo;
  snippet: string;
  title: string;
};

const COMMONS_API_ENDPOINT = 'https://commons.wikimedia.org/w/api.php';
const WIKIMEDIA_FETCH_HEADERS = {
  accept: 'application/json',
  'user-agent': 'BackThenBot/1.0 (+https://backthen.example)'
};
const GENERIC_QUERY_TOKENS = new Set([
  '그해',
  '기사',
  '당시',
  '대한',
  '대한민국',
  '동아일보',
  '오늘',
  '조선일보',
  '중앙일보',
  '파문',
  '사진'
]);
const UNWANTED_IMAGE_HINTS = [
  'banner',
  'coat of arms',
  'election poster',
  'diagram',
  'flag',
  'icon',
  'location map',
  'logo',
  'map',
  'party symbol',
  'poster',
  'seal',
  'signature',
  'wordmark'
];

function cleanQueryText(value: string) {
  return normalizeWhitespace(
    value
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/\([^)]+\)/g, ' ')
      .replace(/[“”"'`]/g, ' ')
  );
}

function tokenize(value: string) {
  return cleanQueryText(value)
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter((token) => token.length >= 2)
    .filter((token) => !GENERIC_QUERY_TOKENS.has(token));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function buildSearchQueries({ title, keywords, year }: SearchBackgroundImageInput) {
  const titleTokens = tokenize(title);
  const keywordTokens = keywords.flatMap((keyword) => tokenize(keyword));
  const combinedTokens = unique([...keywordTokens, ...titleTokens]);
  const fullTitle = cleanQueryText(title);
  const focusedPhrase = combinedTokens.slice(0, 3).join(' ');
  const broadPhrase = combinedTokens.slice(0, 2).join(' ');

  return unique(
    [fullTitle, `${focusedPhrase} ${year}`.trim(), focusedPhrase, broadPhrase].filter((query) => query.trim().length >= 2)
  ).slice(0, 4);
}

function getMetadataValue(metadata: Record<string, WikimediaMetadataRecord> | undefined, key: string) {
  const value = metadata?.[key]?.value;
  if (!value) {
    return null;
  }

  const normalized = normalizeWhitespace(stripHtml(value));
  return normalized || null;
}

function buildSearchUrl(query: string) {
  const searchParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    list: 'search',
    origin: '*',
    srlimit: '6',
    srnamespace: '6',
    srprop: 'snippet',
    srsearch: query
  });

  return `${COMMONS_API_ENDPOINT}?${searchParams.toString()}`;
}

function buildImageInfoUrl(titles: string[]) {
  const searchParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    iiprop: 'url|mime|size|extmetadata',
    iiurlwidth: '1600',
    origin: '*',
    prop: 'imageinfo',
    titles: titles.join('|')
  });

  return `${COMMONS_API_ENDPOINT}?${searchParams.toString()}`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: WIKIMEDIA_FETCH_HEADERS,
      next: {
        revalidate: 86400
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function searchCommons(query: string): Promise<CommonsImageCandidate[]> {
  const searchResponse = await fetchJson<WikimediaSearchResponse>(buildSearchUrl(query));
  const searchHits = searchResponse?.query?.search ?? [];

  if (searchHits.length === 0) {
    return [];
  }

  const imageInfoResponse = await fetchJson<WikimediaImageInfoResponse>(buildImageInfoUrl(searchHits.map((hit) => hit.title)));
  const pages = imageInfoResponse?.query?.pages ?? [];
  const imageInfoByTitle = new Map(
    pages
      .filter((page) => !page.missing)
      .map((page) => {
        return [page.title, page.imageinfo?.[0] ?? null] as const;
      })
  );

  return searchHits
    .map((hit) => {
      const info = imageInfoByTitle.get(hit.title);
      if (!info || !info.url) {
        return null;
      }

      return {
        title: hit.title,
        snippet: normalizeWhitespace(stripHtml(hit.snippet ?? '')),
        info
      };
    })
    .filter((candidate): candidate is CommonsImageCandidate => Boolean(candidate));
}

function getCandidateSearchText(candidate: CommonsImageCandidate) {
  const metadata = candidate.info.extmetadata;
  return normalizeWhitespace(
    [
      candidate.title,
      candidate.snippet,
      getMetadataValue(metadata, 'ObjectName'),
      getMetadataValue(metadata, 'ImageDescription'),
      getMetadataValue(metadata, 'Categories')
    ]
      .filter(Boolean)
      .join(' ')
  ).toLowerCase();
}

function getMatchingTokens(candidate: CommonsImageCandidate, tokens: string[]) {
  const searchText = getCandidateSearchText(candidate);
  return tokens.filter((token) => searchText.includes(token));
}

function getImageArea(candidate: CommonsImageCandidate) {
  return (candidate.info.width ?? 0) * (candidate.info.height ?? 0);
}

function getUndesiredPenalty(candidate: CommonsImageCandidate) {
  const searchText = getCandidateSearchText(candidate);

  return UNWANTED_IMAGE_HINTS.reduce((penalty, term) => {
    return searchText.includes(term) ? penalty - 8 : penalty;
  }, 0);
}

function scoreCandidate(candidate: CommonsImageCandidate, input: SearchBackgroundImageInput, query: string) {
  const tokens = unique([...tokenize(input.title), ...input.keywords.flatMap((keyword) => tokenize(keyword)), ...tokenize(query)]).slice(
    0,
    8
  );
  const searchText = getCandidateSearchText(candidate);
  const matchingTokens = getMatchingTokens(candidate, tokens);
  const tokenScore = matchingTokens.length * 4.2;
  const areaScore = Math.min(getImageArea(candidate) / 240000, 12);
  const yearScore = searchText.includes(String(input.year)) ? 1.8 : 0;
  const mimePenalty = candidate.info.mime === 'image/svg+xml' ? -14 : 0;
  const sizePenalty = getImageArea(candidate) > 0 && getImageArea(candidate) < 320 * 240 ? -10 : 0;
  const lowRelevancePenalty = matchingTokens.length === 0 ? -100 : matchingTokens.length === 1 ? -16 : 0;

  return tokenScore + areaScore + yearScore + getUndesiredPenalty(candidate) + mimePenalty + sizePenalty + lowRelevancePenalty;
}

function resolveImageStatus(candidate: CommonsImageCandidate): ImageStatus {
  const metadata = candidate.info.extmetadata;
  const licenseShortName = getMetadataValue(metadata, 'LicenseShortName')?.toLowerCase() ?? '';
  const usageTerms = getMetadataValue(metadata, 'UsageTerms')?.toLowerCase() ?? '';
  const copyrightFlag = getMetadataValue(metadata, 'Copyrighted')?.toLowerCase() ?? '';
  const licenseKey = getMetadataValue(metadata, 'License')?.toLowerCase() ?? '';

  if (
    licenseShortName.includes('public domain') ||
    usageTerms.includes('public domain') ||
    copyrightFlag === 'false' ||
    licenseKey === 'pd'
  ) {
    return 'public_domain';
  }

  if (licenseShortName || usageTerms || licenseKey) {
    return 'licensed';
  }

  return 'unknown';
}

function buildCredit(candidate: CommonsImageCandidate) {
  const metadata = candidate.info.extmetadata;
  const artist = getMetadataValue(metadata, 'Artist') ?? getMetadataValue(metadata, 'Attribution');
  const license = getMetadataValue(metadata, 'LicenseShortName') ?? getMetadataValue(metadata, 'UsageTerms');

  return ['Wikimedia Commons', artist, license].filter(Boolean).join(' · ');
}

export async function searchBackgroundImage(input: SearchBackgroundImageInput): Promise<SearchBackgroundImageResult | null> {
  const queries = buildSearchQueries(input);

  if (queries.length === 0) {
    return null;
  }

  const candidateGroups = await Promise.all(queries.map((query) => searchCommons(query)));
  const rankedCandidates = candidateGroups
    .flatMap((candidates, index) => {
      const query = queries[index];
      return candidates.map((candidate) => ({
        candidate,
        score: scoreCandidate(candidate, input, query)
      }));
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  const bestMatch = rankedCandidates[0]?.candidate;

  if (!bestMatch) {
    return null;
  }

  const imageUrl = bestMatch.info.thumburl ?? bestMatch.info.url;

  if (!imageUrl) {
    return null;
  }

  return {
    backgroundImageUrl: imageUrl,
    backgroundImageCredit: buildCredit(bestMatch),
    imageStatus: resolveImageStatus(bestMatch)
  };
}
