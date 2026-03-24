type ArchiveEmptyStateProps = {
  eyebrow: string;
  title: string;
  body: string;
};

export function ArchiveEmptyState({ eyebrow, title, body }: ArchiveEmptyStateProps) {
  return (
    <section className="space-y-4">
      <div className="bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">{eyebrow}</p>
      </div>

      <div className="border-2 border-ink bg-[color:var(--surface)] px-4 py-5 sm:px-6 sm:py-6">
        <div className="space-y-5">
          <h1 className="hangul-keep text-balance max-w-5xl font-tabloid text-[clamp(2.4rem,5.6vw,4.9rem)] font-bold leading-[0.96] tracking-[-0.03em] text-ink">
            {title}
          </h1>
          <p className="hangul-keep max-w-4xl font-sans text-[clamp(1.02rem,1.7vw,1.34rem)] leading-[1.64] text-muted-ink">
            {body}
          </p>
        </div>

        <div className="mt-8 grid gap-6 border-t-4 border-ink pt-6 lg:grid-cols-[1.35fr_0.7fr]">
          <div className="space-y-3">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">자료 상태</p>
            <p className="hangul-keep max-w-3xl font-sans text-base leading-7 text-ink/84">
              이 날짜에 공개된 기사 원문이나 지면 자료를 확인하지 못해 1면을 비워 둡니다.
            </p>
          </div>
          <div className="space-y-3 border-t-2 border-ink pt-4 lg:border-l-2 lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">다음 판</p>
            <p className="hangul-keep font-sans text-base leading-7 text-ink/78">
              다른 값으로 넘기면 같은 날짜의 다른 지면을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
