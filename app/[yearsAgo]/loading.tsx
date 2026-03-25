import { getTodayInSeoul, toMonthDayLabel } from '@/lib/date';

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-sm bg-ink/10 ${className}`} />;
}

export default function YearsAgoLoading() {
  const today = getTodayInSeoul();
  const monthDayLabel = toMonthDayLabel(today.month, today.day);

  return (
    <main className="min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="paper-frame mx-auto min-h-[calc(100vh-1rem)] max-w-[1720px] border border-[color:var(--frame-line)] sm:min-h-[calc(100vh-1.5rem)]">
        <div className="relative z-10 flex min-h-[calc(100vh-1rem)] flex-col px-3 py-3 sm:min-h-[calc(100vh-1.5rem)] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          <header className="border-b-4 border-ink pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)] sm:px-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em]">
                <span>제1면</span>
                <span className="h-3 border-l border-[color:var(--banner-line)]" />
                <span>{monthDayLabel}</span>
                <span className="h-3 border-l border-[color:var(--banner-line)]" />
                <span>서울</span>
              </div>
              <div className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--banner-ink-muted)]">
                로딩 중
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
              <div className="space-y-4">
                <div className="border-y-[3px] border-ink py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-balance font-display text-[clamp(2.1rem,5.4vw,4.2rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-ink">
                        판을 불러오는 중
                      </p>
                      <p className="mt-3 hangul-keep font-sans text-[0.96rem] leading-6 text-ink/74">
                        {monthDayLabel} 같은 날짜의 다른 해 보관판을 준비하고 있습니다.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 border border-ink bg-[color:var(--surface)] px-3 py-2 font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-ink">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-tabloid-red" />
                      Loading Edition
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 font-tabloid text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-ink">
                  <span>{monthDayLabel} 기록면</span>
                  <span className="h-3 border-l border-line" />
                  <span>아카이브 확인 중</span>
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
                  <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">상태</p>
                  <p className="mt-2 font-tabloid text-[1.6rem] font-bold leading-none tracking-[-0.04em] text-ink sm:text-[1.9rem]">
                    대기
                  </p>
                  <p className="mt-2 font-sans text-[0.86rem] leading-6 text-ink/72">기사 선별 중</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-4 grid flex-1 gap-5 xl:grid-cols-[minmax(0,1.48fr)_minmax(280px,0.48fr)] xl:gap-6">
            <section className="archive-panel border-2 border-ink p-5 sm:p-7">
              <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-ink">Loading Front Page</p>
              <div className="mt-5 space-y-4">
                <SkeletonLine className="h-6 w-28" />
                <SkeletonLine className="h-16 w-full" />
                <SkeletonLine className="h-[320px] w-full" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <SkeletonLine className="h-24 w-full" />
                  <SkeletonLine className="h-24 w-full" />
                </div>
                <SkeletonLine className="h-5 w-4/5" />
                <SkeletonLine className="h-5 w-3/5" />
                <SkeletonLine className="h-5 w-2/3" />
              </div>
            </section>

            <aside className="flex min-w-0 flex-col gap-4 xl:border-l-2 xl:border-ink xl:pl-6">
              <section className="archive-panel border-2 border-ink">
                <div className="border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
                  <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">자료 준비</p>
                </div>
                <div className="space-y-4 p-4">
                  <SkeletonLine className="h-10 w-20" />
                  <SkeletonLine className="h-6 w-full" />
                  <SkeletonLine className="h-6 w-11/12" />
                  <SkeletonLine className="h-6 w-4/5" />
                </div>
              </section>

              <section className="archive-panel border-2 border-ink">
                <div className="border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
                  <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">추가 기사</p>
                </div>
                <div className="space-y-3 p-4">
                  <SkeletonLine className="h-5 w-full" />
                  <SkeletonLine className="h-5 w-5/6" />
                  <SkeletonLine className="h-5 w-full" />
                  <SkeletonLine className="h-5 w-4/5" />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
