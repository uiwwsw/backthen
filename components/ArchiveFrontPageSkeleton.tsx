function SkeletonBlock({
  className,
  tone = 'default'
}: {
  className: string;
  tone?: 'default' | 'inverse';
}) {
  return <div aria-hidden="true" className={`skeleton-block ${tone === 'inverse' ? 'skeleton-block-inverse' : ''} ${className}`} />;
}

function SkeletonParagraph({
  lines,
  tone = 'default'
}: {
  lines: string[];
  tone?: 'default' | 'inverse';
}) {
  return (
    <div className="space-y-2">
      {lines.map((width, index) => (
        <SkeletonBlock key={`${width}-${index}`} className={`h-3 ${width}`} tone={tone} />
      ))}
    </div>
  );
}

export function ArchiveFrontPageSkeleton() {
  return (
    <main className="page-shell min-h-screen px-2 py-2 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
      <div className="paper-frame mx-auto min-h-[calc(100vh-1rem)] max-w-[1720px] border border-[color:var(--frame-line)] sm:min-h-[calc(100vh-1.5rem)]">
        <div className="relative z-10 flex min-h-[calc(100vh-1rem)] flex-col px-3 py-3 sm:min-h-[calc(100vh-1.5rem)] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          <header className="border-b-4 border-ink pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)] sm:px-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <SkeletonBlock className="h-[11px] w-12" tone="inverse" />
                <span aria-hidden="true" className="h-3 border-l border-[color:var(--banner-line)]" />
                <SkeletonBlock className="h-[11px] w-24" tone="inverse" />
                <span aria-hidden="true" className="h-3 border-l border-[color:var(--banner-line)]" />
                <SkeletonBlock className="h-[11px] w-10" tone="inverse" />
              </div>
              <SkeletonBlock className="h-[11px] w-12" tone="inverse" />
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
              <div className="space-y-4">
                <div className="border-y-[3px] border-ink py-4">
                  <div className="space-y-3">
                    <SkeletonBlock className="h-12 w-full max-w-[44rem]" />
                    <SkeletonBlock className="h-12 w-[78%] max-w-[32rem]" />
                    <SkeletonBlock className="h-3 w-44" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <SkeletonBlock className="h-3 w-24" />
                  <span aria-hidden="true" className="h-3 border-l border-line" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={`masthead-card-${index}`}
                    className={`border-2 border-ink px-4 py-3 text-right ${
                      index === 0 ? 'bg-[color:var(--surface)]' : 'bg-[color:var(--surface-muted)]'
                    }`}
                  >
                    <SkeletonBlock className="ml-auto h-3 w-14" />
                    <SkeletonBlock className="ml-auto mt-3 h-8 w-28" />
                    <SkeletonBlock className="ml-auto mt-3 h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </header>

          <div className="mt-4 grid flex-1 min-h-0 gap-5 xl:grid-cols-[minmax(0,1.48fr)_minmax(280px,0.48fr)] xl:gap-6">
            <section className="min-w-0 xl:min-h-0">
              <article className="flex flex-col gap-5 xl:h-full xl:min-h-0">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="xl:flex xl:h-full xl:flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-[color:var(--banner)] px-4 py-2">
                      <SkeletonBlock className="h-[11px] w-20" tone="inverse" />
                      <SkeletonBlock className="h-[11px] w-16" tone="inverse" />
                    </div>
                    <div className="relative min-h-[38svh] overflow-hidden border-x-2 border-b-2 border-ink bg-[color:var(--surface-card)] sm:min-h-[44svh] xl:min-h-[50svh] xl:flex-1 xl:min-h-0">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_50%),linear-gradient(180deg,rgba(17,17,17,0.04),rgba(17,17,17,0.1))]" />
                      <div className="absolute left-4 top-4">
                        <SkeletonBlock className="h-8 w-28" />
                      </div>
                      <div className="absolute inset-x-6 bottom-6 space-y-3">
                        <SkeletonBlock className="h-5 w-28" tone="inverse" />
                        <SkeletonParagraph lines={['w-full', 'w-4/5']} tone="inverse" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div
                        key={`lead-meta-${index}`}
                        className={`border-2 border-ink p-4 ${
                          index === 1
                            ? 'bg-[color:var(--surface-alt)]'
                            : index === 2
                              ? 'bg-[color:var(--surface-alt-2)]'
                              : 'bg-[color:var(--surface)]'
                        }`}
                      >
                        <SkeletonBlock className="h-3 w-16" />
                        <SkeletonBlock className="mt-3 h-8 w-28" />
                        <SkeletonParagraph lines={index === 2 ? ['w-full', 'w-4/5'] : ['w-24']} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-ink bg-[color:var(--surface)]">
                  <div className="flex flex-wrap items-center gap-3 border-b-2 border-ink px-4 py-3 sm:px-5">
                    <SkeletonBlock className="h-7 w-20" />
                    <SkeletonBlock className="h-3 w-20" />
                    <SkeletonBlock className="h-3 w-28" />
                  </div>

                  <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                    <div className="space-y-3">
                      <SkeletonBlock className="h-12 w-full" />
                      <SkeletonBlock className="h-12 w-[92%]" />
                      <SkeletonBlock className="h-12 w-[78%]" />
                    </div>

                    <div className="border-2 border-ink bg-[color:var(--surface-card)] p-3 shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
                      <div className="relative h-[clamp(16rem,34vw,28rem)] max-h-[28rem] w-full overflow-hidden border border-ink bg-[linear-gradient(180deg,rgba(17,17,17,0.03),rgba(17,17,17,0.12))]">
                        <div className="absolute inset-0">
                          <SkeletonBlock className="h-full w-full rounded-none" />
                        </div>
                      </div>
                    </div>

                    <div className="border-l-4 border-tabloid-red pl-4">
                      <SkeletonParagraph lines={['w-full', 'w-[96%]', 'w-[84%]']} />
                    </div>

                    <div className="grid gap-5 border-t-4 border-ink pt-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
                      <div className="space-y-4">
                        <SkeletonParagraph lines={['w-full', 'w-full', 'w-[92%]', 'w-[96%]', 'w-[84%]']} />
                        <SkeletonParagraph lines={['w-full', 'w-[94%]', 'w-[88%]', 'w-[80%]']} />
                        <div className="flex flex-wrap gap-2 border-t border-ink/12 pt-4">
                          <SkeletonBlock className="h-7 w-28" />
                          <SkeletonBlock className="h-7 w-24" />
                          <SkeletonBlock className="h-7 w-20" />
                        </div>
                      </div>

                      <div className="archive-panel border-2 border-ink p-4">
                        <SkeletonBlock className="h-3 w-20" />
                        <div className="mt-4 space-y-3">
                          {Array.from({ length: 3 }, (_, index) => (
                            <div key={`inside-article-${index}`} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-3 first:border-t-0 first:pt-0">
                              <SkeletonBlock className="h-6 w-6" />
                              <div className="space-y-2">
                                <SkeletonParagraph lines={['w-full', 'w-[82%]']} />
                                <SkeletonBlock className="h-3 w-24" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </section>

            <aside className="flex min-w-0 flex-col gap-4 xl:h-full xl:min-h-0 xl:border-l-2 xl:border-ink xl:pl-6">
              <section className="archive-panel border-2 border-ink">
                <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2">
                  <SkeletonBlock className="h-[11px] w-20" tone="inverse" />
                  <SkeletonBlock className="h-[11px] w-16" tone="inverse" />
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-[78px_minmax(0,1fr)] gap-4 border-b-2 border-ink/75 pb-4">
                    <div className="border-r border-ink/20 pr-3">
                      <SkeletonBlock className="h-3 w-10" />
                      <SkeletonBlock className="mt-3 h-10 w-16" />
                    </div>
                    <div className="space-y-2">
                      <SkeletonBlock className="h-3 w-16" />
                      <SkeletonParagraph lines={['w-full', 'w-[92%]', 'w-[78%]']} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, index) => (
                      <div key={`aside-row-${index}`} className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-4 first:border-t-0 first:pt-0">
                        <SkeletonBlock className="h-3 w-10" />
                        <SkeletonParagraph lines={index === 2 ? ['w-full', 'w-[72%]'] : ['w-4/5']} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-t-2 border-ink pt-4">
                    <SkeletonBlock className="h-3 w-16" />
                    <div className="space-y-3">
                      {Array.from({ length: 4 }, (_, index) => (
                        <div key={`aside-article-${index}`} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-ink/12 pt-3 first:border-t-0 first:pt-0">
                          <SkeletonBlock className="h-5 w-6" />
                          <div className="space-y-2">
                            <SkeletonParagraph lines={['w-full', 'w-[76%]']} />
                            <SkeletonBlock className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="archive-panel border-2 border-ink text-sm text-muted-ink">
                <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2">
                  <SkeletonBlock className="h-[11px] w-16" tone="inverse" />
                  <SkeletonBlock className="h-[11px] w-14" tone="inverse" />
                </div>

                <div className="space-y-5 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 2 }, (_, index) => (
                      <div key={`source-card-${index}`} className="border border-ink/15 bg-[color:var(--surface-strong)] p-3">
                        <SkeletonBlock className="h-3 w-16" />
                        <SkeletonParagraph lines={index === 0 ? ['w-[92%]'] : ['w-[80%]']} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t-2 border-ink pt-4">
                    <SkeletonBlock className="h-3 w-16" />
                    <SkeletonBlock className="h-4 w-full" />
                  </div>

                  <div className="space-y-2 border-t border-ink/12 pt-4">
                    <SkeletonBlock className="h-3 w-14" />
                    <SkeletonParagraph lines={['w-full', 'w-[88%]', 'w-[76%]']} />
                  </div>

                  <div className="space-y-2 border-t border-ink/12 pt-4">
                    <SkeletonBlock className="h-3 w-14" />
                    <div className="flex flex-wrap gap-2">
                      <SkeletonBlock className="h-7 w-16" />
                      <SkeletonBlock className="h-7 w-20" />
                      <SkeletonBlock className="h-7 w-14" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="archive-panel relative hidden min-h-0 flex-1 overflow-hidden border-2 border-ink xl:flex xl:flex-col">
                <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2">
                  <SkeletonBlock className="h-[11px] w-20" tone="inverse" />
                  <SkeletonBlock className="h-[11px] w-12" tone="inverse" />
                </div>

                <div className="relative flex flex-1 flex-col px-4 py-4">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-x-4 top-4 h-px bg-ink/10" />
                    <div className="absolute inset-x-4 top-10 grid grid-cols-5 gap-2 opacity-[0.16]">
                      {Array.from({ length: 5 }, (_, index) => (
                        <div key={`ghost-column-${index}`} className="h-28 border-l border-ink/20" />
                      ))}
                    </div>
                  </div>

                  <div className="relative space-y-3">
                    {Array.from({ length: 3 }, (_, index) => (
                      <div key={`nav-card-${index}`} className="min-h-[112px] overflow-hidden border-2 border-ink bg-[color:var(--surface-tag)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <SkeletonBlock className="h-3 w-14" />
                            <SkeletonBlock className="h-3 w-10" />
                          </div>

                          <div className="space-y-3">
                            <SkeletonBlock className="h-10 w-24" />
                            <SkeletonParagraph lines={['w-full', 'w-[82%]']} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
