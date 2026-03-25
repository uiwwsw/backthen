import { HeadlineText } from '@/components/HeadlineText';
import type { ArticleCandidate, SourceName } from '@/lib/db/types';
import { formatPublishedAt, getSourceLabel } from '@/lib/date';

type InsideArticlesProps = {
  articles: ArticleCandidate[];
  className?: string;
  primarySource: SourceName;
};

const sourceOrder: SourceName[] = ['chosun', 'joongang', 'donga'];

function getArticleSummary(article: ArticleCandidate) {
  if (article.excerpt) {
    return article.excerpt;
  }

  return null;
}

export function InsideArticles({ articles, className, primarySource }: InsideArticlesProps) {
  const slots = sourceOrder
    .filter((source) => source !== primarySource)
    .map((source) => ({
      source,
      article: articles.find((article) => article.sourceName === source) ?? null
    }));

  return (
    <section className={`flex h-full flex-col border-2 border-ink bg-[color:var(--surface)] ${className ?? ''}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-3 text-[color:var(--banner-ink)] sm:px-5">
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">다른 신문 기사</p>
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--banner-ink-muted)]">조중동 지면</p>
      </div>

      <div className="grid flex-1 gap-4 p-4 sm:p-5 lg:grid-cols-2 lg:auto-rows-fr">
        {slots.map(({ source, article }, index) => {
          const sourceLabel = getSourceLabel(source, article?.url);
          const summary = article ? getArticleSummary(article) : null;

          return (
            <article key={`${source}-${article?.url ?? 'empty'}`} className="flex min-w-0 h-full flex-col border-2 border-ink bg-[color:var(--surface-card)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/20 pb-3">
                <div>
                  <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">
                    신문 {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 font-tabloid text-[0.84rem] font-semibold uppercase tracking-[0.2em] text-ink">{sourceLabel}</p>
                </div>
                {article?.section ? (
                  <span className="border border-ink/20 bg-[color:var(--surface-tag)] px-2 py-1 font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-ink">
                    {article.section}
                  </span>
                ) : null}
              </div>

              {article ? (
                <a href={article.url} rel="noreferrer" target="_blank" className="mt-4 block min-w-0">
                  <h2 className="headline-wrap text-balance font-tabloid text-[1.28rem] font-bold leading-[1.08] tracking-[-0.02em] text-ink underline-offset-4 transition hover:underline">
                    <HeadlineText text={article.title} />
                  </h2>
                </a>
              ) : (
                <h2 className="headline-wrap mt-4 text-balance font-tabloid text-[1.28rem] font-bold leading-[1.08] tracking-[-0.02em] text-ink/55">
                  기사 없음
                </h2>
              )}

              {article ? (
                summary ? (
                  <p className="mt-4 flex-1 hangul-keep font-sans text-[0.88rem] leading-7 text-ink/86">{summary}</p>
                ) : (
                  <div className="flex-1" />
                )
              ) : (
                <p className="mt-4 flex-1 hangul-keep font-sans text-[0.88rem] leading-7 text-ink/74">
                  이 날짜의 {sourceLabel} 기사를 확인하지 못했습니다.
                </p>
              )}

              <p className="mt-4 border-t border-ink/15 pt-3 font-sans text-[0.78rem] leading-6 text-muted-ink">
                출처 {sourceLabel}
                {article?.publishedAt ? ` · ${formatPublishedAt(article.publishedAt)}` : null}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
