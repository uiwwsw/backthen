import type { IssueOfDay } from '@/lib/db/types';
import { formatPublishedAt, getSourceLabel, getSourceLinkLabel } from '@/lib/date';
type SourceMetaProps = {
  issue: IssueOfDay;
};

export function SourceMeta({ issue }: SourceMetaProps) {
  const sourceLabel = getSourceLabel(issue.sourceName, issue.sourceUrl);
  const publishedLabel = issue.publishedAt ? formatPublishedAt(issue.publishedAt) : '발행 시각 정보 없음';
  const previewCredit = issue.backgroundImageCredit ?? '기존 기사나 지면에서 확인된 이미지 없음';

  return (
    <section className="archive-panel border-2 border-ink text-sm text-muted-ink">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">자료 출처</p>
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--banner-ink-muted)]">
          {sourceLabel}
        </p>
      </div>

      <div className="space-y-5 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border border-ink/15 bg-[color:var(--surface-strong)] p-3">
            <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">발행 매체</p>
            <p className="mt-3 hangul-keep font-sans text-[0.9rem] leading-6 text-ink">{sourceLabel}</p>
          </div>

          <div className="border border-ink/15 bg-[color:var(--surface-strong)] p-3">
            <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">게재 시각</p>
            <p className="mt-3 hangul-keep font-sans text-[0.9rem] leading-6 text-ink">{publishedLabel}</p>
          </div>
        </div>

        <div className="space-y-2 border-t-2 border-ink pt-4">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">원문 링크</p>
          <a
            className="block font-sans text-[0.88rem] leading-7 text-ink underline-offset-4 transition hover:underline"
            href={issue.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            {getSourceLinkLabel(issue.sourceName, issue.sourceUrl)}
          </a>
        </div>

        <div className="space-y-2 border-t border-ink/12 pt-4">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">지면 자료</p>
          <p className="hangul-keep font-sans text-[0.86rem] leading-7 text-ink/88">
            {previewCredit}
          </p>
        </div>

        <div className="space-y-2 border-t border-ink/12 pt-4">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">주요어</p>
          <div className="flex flex-wrap gap-2">
            {issue.keywords.length ? (
              issue.keywords.slice(0, 5).map((keyword) => (
                <span
                  key={`source-${keyword}`}
                  className="border border-ink/20 bg-[color:var(--surface-tag)] px-2 py-1 font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-ink"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="hangul-keep font-sans text-[0.84rem] leading-6 text-ink/78">주요어 정보 없음</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
