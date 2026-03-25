import { ArchiveEmptyState } from '@/components/ArchiveEmptyState';
import { ArchiveYearNavigator } from '@/components/ArchiveYearNavigator';
import { HeadlineText } from '@/components/HeadlineText';
import { LeadStory } from '@/components/LeadStory';
import { MastheadBand } from '@/components/MastheadBand';
import { SourceMeta } from '@/components/SourceMeta';
import type { CSSProperties } from 'react';
import type { IssueOfDay } from '@/lib/db/types';
import type { SeoulDate } from '@/lib/date';
import { formatPublishedAt, getSourceLabel, toKoreanDateLabel, toMonthDayLabel } from '@/lib/date';
import { sanitizeIssueSummary } from '@/lib/news/summarizeIssue';
import { getMaxYearsAgo, getResolvedYearsAgoTitle, KOREAN_SERVICE_NAME, MIN_YEARS_AGO } from '@/lib/year';

type EmptyStateCopy = {
  eyebrow: string;
  title: string;
  body: string;
};

type BackThenFrontPageProps = {
  availableIssueYears?: number[];
  year: number;
  currentYearsAgo: number;
  today: SeoulDate;
  issue: IssueOfDay | null;
  themeStyle?: CSSProperties;
  emptyState?: EmptyStateCopy;
};

const defaultEmptyState: EmptyStateCopy = {
  eyebrow: '자료 공란',
  title: '이 날짜의 공개된 원문 또는 지면을 찾지 못했습니다',
  body: '소스 아카이브에 남아 있는 기사 원문이나 지면 자료가 없어 1면을 비워 둡니다. 다른 값으로 같은 날짜를 넘겨 보세요.'
};

export function BackThenFrontPage({
  availableIssueYears = [],
  year,
  currentYearsAgo,
  today,
  issue,
  themeStyle,
  emptyState = defaultEmptyState
}: BackThenFrontPageProps) {
  const dateLabel = toKoreanDateLabel(year, today.month, today.day);
  const monthDayLabel = toMonthDayLabel(today.month, today.day);
  const sourceLabel = issue ? getSourceLabel(issue.sourceName, issue.sourceUrl) : null;
  const publishedLabel = issue?.publishedAt ? formatPublishedAt(issue.publishedAt) : null;
  const listedArticles = issue ? (issue.relatedArticles.length ? issue.relatedArticles : issue.secondaryArticles) : [];
  const cleanedSummary = issue ? sanitizeIssueSummary(issue.summary) : '';
  const titleLabel = issue ? getResolvedYearsAgoTitle(currentYearsAgo) : KOREAN_SERVICE_NAME;

  return (
    <main className="page-shell min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4" style={themeStyle}>
      <div className="paper-frame mx-auto min-h-[calc(100vh-1rem)] max-w-[1720px] border border-[color:var(--frame-line)] sm:min-h-[calc(100vh-1.5rem)]">
        <div className="relative z-10 flex min-h-[calc(100vh-1rem)] flex-col px-3 py-3 sm:min-h-[calc(100vh-1.5rem)] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          <MastheadBand
            currentYear={today.year}
            currentYearsAgo={currentYearsAgo}
            dateLabel={dateLabel}
            maxYearsAgo={getMaxYearsAgo(today.year)}
            minYearsAgo={MIN_YEARS_AGO}
            monthDayLabel={monthDayLabel}
            titleLabel={titleLabel}
          />

          <div className="mt-4 grid flex-1 min-h-0 gap-5 xl:grid-cols-[minmax(0,1.48fr)_minmax(280px,0.48fr)] xl:gap-6">
            <section className="min-w-0 xl:min-h-0">
              {issue ? (
                <LeadStory dateLabel={dateLabel} issue={issue} monthDayLabel={monthDayLabel} />
              ) : (
                <ArchiveEmptyState eyebrow={emptyState.eyebrow} title={emptyState.title} body={emptyState.body} />
              )}
            </section>

            <aside className="flex min-w-0 flex-col gap-4 xl:h-full xl:min-h-0 xl:border-l-2 xl:border-ink xl:pl-6">
              {issue ? (
                <section className="archive-panel border-2 border-ink">
                  <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
                    <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">오늘의 지면</p>
                    <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--banner-ink-muted)]">
                      {sourceLabel}
                    </p>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-4 border-b-2 border-ink/75 pb-4">
                      <div className="border-r border-ink/20 pr-3 text-center">
                        <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">연도</p>
                        <p className="mt-2 font-tabloid text-[2.9rem] font-extrabold leading-none tracking-[-0.08em] text-tabloid-red">
                          {String(year).slice(-2)}
                        </p>
                      </div>
                      <div className="min-w-0 space-y-2">
                        <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">머리기사</p>
                        <p className="headline-wrap text-balance font-tabloid text-[1.08rem] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
                          <HeadlineText text={issue.headline} />
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3">
                        <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">신문</p>
                        <p className="hangul-keep font-sans text-[0.9rem] leading-6 text-ink/86">{sourceLabel}</p>
                      </div>

                      <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-4">
                        <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">게재</p>
                        <p className="hangul-keep font-sans text-[0.9rem] leading-6 text-ink/86">{publishedLabel ?? dateLabel}</p>
                      </div>

                      <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-4">
                        <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">주요어</p>
                        <p className="hangul-keep font-sans text-[0.9rem] leading-6 text-ink/86">
                          {issue.keywords.length ? issue.keywords.slice(0, 4).join(' · ') : '주요어 정보 없음'}
                        </p>
                      </div>

                      {cleanedSummary ? (
                        <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-4">
                          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">리드</p>
                          <p className="hangul-keep font-sans text-[0.86rem] leading-6 text-ink/86">{cleanedSummary}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-3 border-t-2 border-ink pt-4">
                      <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">추가 기사</p>
                      <div className="space-y-3">
                        {listedArticles.length ? (
                          listedArticles.slice(0, 4).map((article, index) => (
                            <a
                              key={`${article.url}-aside`}
                              className="grid min-w-0 grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-3 first:border-t-0 first:pt-0"
                              href={article.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <span className="font-tabloid text-[1rem] font-bold leading-none tracking-[-0.04em] text-tabloid-red">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div className="min-w-0 space-y-1">
                                <p className="headline-wrap text-balance font-sans text-[0.86rem] leading-6 text-ink/88">
                                  <HeadlineText text={article.title} />
                                </p>
                                <p className="font-sans text-[0.8rem] leading-5 text-muted-ink">
                                  {getSourceLabel(article.sourceName, article.url)}
                                  {article.section ? ` · ${article.section}` : ''}
                                </p>
                              </div>
                            </a>
                          ))
                        ) : (
                          <p className="hangul-keep font-sans text-[0.9rem] leading-6 text-ink/78">추가 기사 목록 없음</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}

              {issue ? (
                <SourceMeta issue={issue} />
              ) : (
                <section className="archive-panel border-2 border-ink">
                  <div className="border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
                    <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">자료 상태</p>
                  </div>
                  <p className="hangul-keep p-4 font-sans text-[0.98rem] leading-7 text-ink/80">
                    소스 아카이브에 남아 있는 기사 원문이나 지면 자료를 확인하지 못해 이 날짜의 1면을 비워 둔 상태입니다.
                  </p>
                </section>
              )}

              {issue ? (
                <ArchiveYearNavigator
                  activeYear={year}
                  availableYears={availableIssueYears}
                  currentYear={today.year}
                  monthDayLabel={monthDayLabel}
                />
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
