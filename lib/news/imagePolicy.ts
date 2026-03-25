import type { ArticleCandidate, ImageStatus } from '@/lib/db/types';
import { getSourceLabel } from '@/lib/date';

export function resolveImageStatus(candidate: ArticleCandidate): ImageStatus {
  if (!candidate.imageUrl) {
    return 'none';
  }

  return 'unknown';
}

function getImageHost(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function buildArticleImageCredit(candidate: ArticleCandidate) {
  const sourceLabel = getSourceLabel(candidate.sourceName, candidate.url);
  const imageHost = getImageHost(candidate.imageUrl);
  const assetLabel = candidate.url.includes('/archive/newslibrary/') ? '지면 미리보기' : '기사 이미지';

  return imageHost ? `${sourceLabel} ${assetLabel} · ${imageHost}` : `${sourceLabel} ${assetLabel}`;
}

export function resolveBackgroundImage(candidate: ArticleCandidate) {
  if (!candidate.imageUrl) {
    return {
      backgroundImageUrl: null,
      backgroundImageCredit: null,
      imageStatus: 'none' as const
    };
  }

  return {
    backgroundImageUrl: candidate.imageUrl,
    backgroundImageCredit: buildArticleImageCredit(candidate),
    imageStatus: resolveImageStatus(candidate)
  };
}
