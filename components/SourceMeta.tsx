import type { IssueOfDay } from '@/lib/db/types';
import { formatPublishedAt, getSourceLabel, getSourceWebAddress } from '@/lib/date';

type SourceMetaProps = {
  issue: IssueOfDay;
};

function getImageStatusLabel(imageStatus: IssueOfDay['imageStatus']) {
  switch (imageStatus) {
    case 'licensed':
      return '기사 사진';
    case 'public_domain':
      return '공개 이미지';
    case 'generated':
      return '재구성 이미지';
    case 'none':
      return '사진 자료 없음';
    case 'unknown':
    default:
      return '사진 자료';
  }
}

export function SourceMeta({ issue }: SourceMetaProps) {
  const sourceLabel = getSourceLabel(issue.sourceName, issue.sourceUrl);
  const publishedLabel = issue.publishedAt ? formatPublishedAt(issue.publishedAt) : '발행 시각 정보 없음';

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
            <p className="mt-3 hangul-keep font-sans text-[0.98rem] leading-6 text-ink">{sourceLabel}</p>
          </div>

          <div className="border border-ink/15 bg-[color:var(--surface-strong)] p-3">
            <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">게재 시각</p>
            <p className="mt-3 hangul-keep font-sans text-[0.98rem] leading-6 text-ink">{publishedLabel}</p>
          </div>
        </div>

        <div className="space-y-2 border-t-2 border-ink pt-4">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">원문 주소</p>
          <a
            className="block break-all font-sans text-[0.94rem] leading-7 text-ink underline-offset-4 transition hover:underline"
            href={issue.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            {getSourceWebAddress(issue.sourceUrl)}
          </a>
        </div>

        <div className="space-y-2 border-t border-ink/12 pt-4">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">사진 자료</p>
          <p className="hangul-keep font-sans text-[0.94rem] leading-7 text-ink/88">
            {getImageStatusLabel(issue.imageStatus)}
            {issue.backgroundImageCredit ? ` · ${issue.backgroundImageCredit}` : ''}
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
              <p className="hangul-keep font-sans text-[0.9rem] leading-6 text-ink/78">주요어 정보 없음</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
