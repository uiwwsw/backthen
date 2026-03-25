import { cache } from 'react';
import type { ImageStatus, IssueOfDay } from '@/lib/db/types';
import { searchBackgroundImage } from '@/lib/news/wikimediaImageSearch';

export type IssueContextImage = {
  imageUrl: string | null;
  imageCredit: string | null;
  imageStatus: ImageStatus;
  searchState: 'match' | 'no_match' | 'duplicate_preview';
};

const KEYWORD_SEPARATOR = '\u0001';

const getCachedIssueContextImage = cache(
  async (headline: string, keywordsKey: string, year: number, monthDay: string, previewImageUrl: string | null) => {
    const keywords = keywordsKey ? keywordsKey.split(KEYWORD_SEPARATOR).filter(Boolean) : [];
    const searchedImage = await searchBackgroundImage({
      title: headline,
      keywords,
      monthDay,
      year
    });

    if (!searchedImage) {
      return {
        imageUrl: null,
        imageCredit: null,
        imageStatus: 'none',
        searchState: 'no_match'
      } satisfies IssueContextImage;
    }

    if (searchedImage.backgroundImageUrl === previewImageUrl) {
      return {
        imageUrl: null,
        imageCredit: searchedImage.backgroundImageCredit,
        imageStatus: searchedImage.imageStatus,
        searchState: 'duplicate_preview'
      } satisfies IssueContextImage;
    }

    return {
      imageUrl: searchedImage.backgroundImageUrl,
      imageCredit: searchedImage.backgroundImageCredit,
      imageStatus: searchedImage.imageStatus,
      searchState: 'match'
    } satisfies IssueContextImage;
  }
);

export function getIssueContextImage(issue: IssueOfDay) {
  return getCachedIssueContextImage(
    issue.headline,
    issue.keywords.join(KEYWORD_SEPARATOR),
    issue.year,
    issue.monthDay,
    issue.backgroundImageUrl
  );
}
