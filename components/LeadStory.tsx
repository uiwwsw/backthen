import { InsideArticles } from '@/components/InsideArticles';
import { formatPublishedAt, getSourceLabel } from '@/lib/date';
import type { IssueOfDay } from '@/lib/db/types';
import { sanitizeIssueSummary } from '@/lib/news/summarizeIssue';

type LeadStoryProps = {
  issue: IssueOfDay;
  dateLabel: string;
  monthDayLabel: string;
};

const BODY_BLOCK_LIMIT = 2;
const BODY_BLOCK_TARGET_LENGTH = 110;
const BODY_BLOCK_MAX_LENGTH = 170;

function truncateCopy(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
}

function buildDisplayBodyParagraphs(paragraphs: string[]) {
  const queue = paragraphs
    .flatMap((paragraph) =>
      paragraph
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    )
    .filter(Boolean);

  if (!queue.length) {
    return [];
  }

  const blocks: string[] = [];

  while (queue.length && blocks.length < BODY_BLOCK_LIMIT) {
    let block = '';

    while (queue.length) {
      const nextSentence = queue[0];
      const candidate = block ? `${block} ${nextSentence}` : nextSentence;

      if (block && candidate.length > BODY_BLOCK_TARGET_LENGTH) {
        break;
      }

      block = candidate;
      queue.shift();
    }

    if (!block) {
      block = queue.shift() ?? '';
    }

    blocks.push(block);
  }

  if (queue.length) {
    blocks[blocks.length - 1] = truncateCopy(`${blocks[blocks.length - 1]} ${queue.join(' ')}`.trim(), BODY_BLOCK_MAX_LENGTH);
  }

  return blocks.map((block, index) => truncateCopy(block, index === 0 ? BODY_BLOCK_MAX_LENGTH : BODY_BLOCK_TARGET_LENGTH + 24));
}

export function LeadStory({ issue, dateLabel, monthDayLabel }: LeadStoryProps) {
  const keywords = issue.keywords.filter(Boolean).slice(0, 4);
  const sourceLabel = getSourceLabel(issue.sourceName, issue.sourceUrl);
  const publishedLabel = issue.publishedAt ? formatPublishedAt(issue.publishedAt) : dateLabel;
  const cleanedSummary = sanitizeIssueSummary(issue.summary);
  const summarySentences = cleanedSummary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const lede = summarySentences[0] ?? cleanedSummary;
  const bodyCandidates =
    summarySentences.length > 1
      ? [
          summarySentences.slice(1, 1 + Math.ceil((summarySentences.length - 1) / 2)).join(' '),
          summarySentences.slice(1 + Math.ceil((summarySentences.length - 1) / 2)).join(' ')
        ].filter(Boolean)
      : issue.secondaryArticles
          .map((article) => article.excerpt?.trim())
          .filter((excerpt): excerpt is string => Boolean(excerpt))
          .slice(0, 2);
  const bodyParagraphs = buildDisplayBodyParagraphs(bodyCandidates.length ? bodyCandidates : [cleanedSummary || issue.summary]);
  const displayBodyParagraphs = bodyParagraphs.length ? bodyParagraphs : [cleanedSummary || issue.summary];
  const leadVisualStyle = issue.backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, var(--photo-fill-start) 0%, var(--photo-fill-end) 100%), url(${issue.backgroundImageUrl})`
      }
    : {
        backgroundImage:
          'linear-gradient(135deg, var(--photo-fallback-start) 0%, var(--photo-fallback-end) 100%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%)'
      };

  return (
    <article className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em]">제1면 머리기사</p>
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--banner-ink-muted)]">
              {monthDayLabel}
            </p>
          </div>
          <div
            className="relative min-h-[38svh] overflow-hidden border-x-2 border-b-2 border-ink bg-[color:var(--banner)] bg-cover bg-center sm:min-h-[44svh] xl:min-h-[50svh]"
            style={leadVisualStyle}
          >
            <div className="absolute inset-0 bg-grain opacity-30 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--photo-overlay-strong)] via-[color:var(--photo-overlay-soft)] to-transparent" />
            {!issue.backgroundImageUrl ? (
              <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                <span className="font-tabloid text-[clamp(4.5rem,14vw,10rem)] font-extrabold leading-none tracking-[-0.09em] text-[color:var(--display-ghost)]">
                  {issue.year}
                </span>
              </div>
            ) : null}
            <div className="absolute left-4 top-4 inline-flex bg-tabloid-red px-3 py-1 font-tabloid text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-ink)] sm:left-5 sm:top-5">
              사진 자료
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 border-t border-[color:var(--banner-line)] bg-gradient-to-t from-[color:var(--photo-overlay-strong)] via-[color:var(--photo-overlay-soft)] to-transparent px-4 py-3 text-[color:var(--banner-ink-muted)] sm:px-6">
              <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em]">사진 설명</p>
              <p className="hangul-keep max-w-[70%] text-right font-sans text-[0.76rem] leading-5 sm:text-[0.83rem]">
                {issue.backgroundImageCredit ?? '자료 사진 없음'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="border-2 border-ink bg-[color:var(--surface)] p-4">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-ink">발행 연도</p>
            <p className="mt-3 font-tabloid text-[3.2rem] font-extrabold leading-none tracking-[-0.08em] text-ink">{issue.year}</p>
            <p className="mt-3 font-sans text-[0.9rem] leading-6 text-ink/78">같은 날짜의 머리기사</p>
          </div>

          <div className="border-2 border-ink bg-[color:var(--surface-alt)] p-4">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-ink">발행 신문</p>
            <p className="mt-3 font-tabloid text-[1.45rem] font-bold leading-[0.98] tracking-[-0.03em] text-ink sm:text-[1.7rem]">
              {sourceLabel}
            </p>
            <p className="mt-3 font-sans text-[0.9rem] leading-6 text-ink/80">{publishedLabel}</p>
          </div>

          <div className="border-2 border-ink bg-[color:var(--surface-alt-2)] p-4">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-ink">주요어</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.length ? (
                keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="border border-ink bg-[color:var(--surface-tag)] px-2.5 py-1 font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-ink"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-ink">주요어 없음</span>
              )}
            </div>
          </div>

          <div className="border-2 border-ink bg-[color:var(--surface)] p-4">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-ink">기사 갈피</p>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3">
                <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-ink">지면</p>
                <p className="hangul-keep font-sans text-[0.88rem] leading-6 text-ink/86">{issue.secondaryArticles.length + 1}개 신문</p>
              </div>
              <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-3">
                <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-ink">게재</p>
                <p className="hangul-keep font-sans text-[0.88rem] leading-6 text-ink/86">{publishedLabel}</p>
              </div>
              <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-3">
                <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-ink">출처</p>
                <p className="hangul-keep break-all font-sans text-[0.82rem] leading-6 text-ink/76">{issue.sourceUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-ink bg-[color:var(--surface)]">
        <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3 sm:px-5">
          <span className="bg-tabloid-red px-3 py-1 font-tabloid text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent-ink)]">
            머리기사
          </span>
          <span className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">{sourceLabel}</span>
          <span className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">{publishedLabel}</span>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="hangul-keep text-balance max-w-none font-tabloid text-[clamp(2.35rem,6.1vw,5.15rem)] font-extrabold leading-[0.92] tracking-[-0.03em] text-ink">
            {issue.headline}
          </h1>

          <p className="hangul-keep max-w-5xl border-l-4 border-tabloid-red pl-4 font-sans text-[clamp(1.05rem,1.9vw,1.42rem)] leading-[1.56] text-muted-ink">
            {lede}
          </p>

          <div className="grid gap-5 border-t-4 border-ink pt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
            <div className="min-w-0 lg:pr-2">
              <div className="max-w-3xl space-y-4">
                {displayBodyParagraphs.map((paragraph, index) => (
                  <p
                    key={`body-${index}`}
                    className="hangul-keep font-sans text-[0.98rem] leading-7 text-ink/88"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/12 pt-4">
                <span className="border border-ink/15 bg-[color:var(--surface-tag)] px-2.5 py-1 font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-ink">
                  {issue.secondaryArticles.length + 1}개 신문 1면
                </span>
                <span className="border border-ink/15 bg-[color:var(--surface-tag)] px-2.5 py-1 font-tabloid text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-ink">
                  관련 기사 {issue.secondaryArticles.length}건
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t-2 border-ink pt-4 lg:border-l-2 lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="space-y-2">
                <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">기록 출처</p>
                <p className="hangul-keep font-sans text-[0.95rem] leading-6 text-ink">{sourceLabel}</p>
                <p className="hangul-keep font-sans text-[0.88rem] leading-6 text-ink/76">{publishedLabel}</p>
              </div>

              <div className="space-y-2 border-t border-ink/12 pt-4">
                <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">사진 자료</p>
                <p className="hangul-keep font-sans text-[0.88rem] leading-6 text-ink/82">
                  {issue.backgroundImageCredit ?? '확인된 사진 자료 없음'}
                </p>
              </div>

              <div className="space-y-2 border-t border-ink/12 pt-4">
                <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">관련 키워드</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.length ? (
                    keywords.map((keyword) => (
                      <span
                        key={`headline-${keyword}`}
                        className="border-2 border-ink px-2.5 py-1 font-tabloid text-[10px] font-semibold uppercase tracking-[0.2em] text-ink"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <span className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-ink">기록 없음</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InsideArticles articles={issue.secondaryArticles} primarySource={issue.sourceName} />
    </article>
  );
}
