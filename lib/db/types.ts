export type SourceName = 'chosun' | 'joongang' | 'donga';

export type ImageStatus = 'licensed' | 'public_domain' | 'generated' | 'none' | 'unknown';

export type IssueOfDay = {
  year: number;
  monthDay: string;
  headline: string;
  rawHeadline?: string | null;
  summary: string;
  sourceName: SourceName;
  sourceUrl: string;
  publishedAt: string;
  backgroundImageUrl: string | null;
  backgroundImageCredit: string | null;
  imageStatus: ImageStatus;
  keywords: string[];
  importanceScore: number;
  relatedArticles: ArticleCandidate[];
  secondaryArticles: ArticleCandidate[];
};

export type ArticleCandidate = {
  sourceName: SourceName;
  title: string;
  rawTitle?: string | null;
  url: string;
  publishedAt: string;
  excerpt: string | null;
  imageUrl: string | null;
  section: string | null;
  duplicateClusterKey: string | null;
  sourceWeight: number;
  eventScore: number;
};

export type StoredIssueRow = {
  year: number;
  month_day: string;
  headline: string;
  raw_headline: string | null;
  summary: string;
  source_name: SourceName;
  source_url: string;
  published_at: string;
  background_image_url: string | null;
  background_image_credit: string | null;
  image_status: ImageStatus;
  keywords: string[] | null;
  importance_score: number;
};

export type StoredIssueCandidateRow = {
  source_name: SourceName;
  title: string;
  raw_title: string | null;
  url: string;
  published_at: string;
  excerpt: string | null;
  image_url: string | null;
  section: string | null;
  duplicate_cluster_key: string | null;
  source_weight: number;
  event_score: number;
};
