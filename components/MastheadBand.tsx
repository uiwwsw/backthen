import Link from 'next/link';

type MastheadBandProps = {
  dateLabel: string;
  monthDayLabel: string;
  titleLabel: string;
};

export function MastheadBand({ dateLabel, monthDayLabel, titleLabel }: MastheadBandProps) {
  return (
    <header className="border-b-4 border-ink pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)] sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em]">
          <span>제1면</span>
          <span className="h-3 border-l border-[color:var(--banner-line)]" />
          <span>{dateLabel}</span>
          <span className="h-3 border-l border-[color:var(--banner-line)]" />
          <span>서울</span>
        </div>
        <div className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--banner-ink-muted)]">조간</div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
        <div className="space-y-4">
          <div className="border-y-[3px] border-ink py-4">
            <Link
              href="/"
              className="block text-balance font-tabloid text-[clamp(2.3rem,6vw,4.8rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-ink"
            >
              {titleLabel}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-ink">
            <span>{monthDayLabel} 기록면</span>
            <span className="h-3 border-l border-line" />
            <span>과거 보관판</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-2 border-ink bg-[color:var(--surface)] px-4 py-3 text-right">
            <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">발행일</p>
            <p className="mt-2 font-tabloid text-[1.9rem] font-bold leading-none tracking-[-0.04em] text-ink sm:text-[2.2rem]">
              {monthDayLabel}
            </p>
            <p className="mt-2 font-sans text-[0.86rem] leading-6 text-ink/72">과거 보관판</p>
          </div>
          <div className="border-2 border-ink bg-[color:var(--surface-muted)] px-4 py-3 text-right">
            <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">지면</p>
            <p className="mt-2 font-tabloid text-[1.6rem] font-bold leading-none tracking-[-0.04em] text-ink sm:text-[1.9rem]">
              조간
            </p>
            <p className="mt-2 font-sans text-[0.86rem] leading-6 text-ink/72">{dateLabel}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
