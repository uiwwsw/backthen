'use client';

import { useState } from 'react';
import { useYearNavigation } from '@/components/useYearNavigation';
import { MIN_YEAR } from '@/lib/year';

type ArchiveYearNavigatorProps = {
  activeYear: number;
  currentYear: number;
  monthDay: string;
  monthDayLabel: string;
  availableYears: number[];
};

type NavigationCard = {
  description: string;
  eyebrow: string;
  helper: string;
  id: 'previous' | 'random' | 'next';
  targetYear: number | null;
  value: string;
};

function getRandomIndex(length: number) {
  if (length <= 0) {
    return 0;
  }

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

function buildNavigationCards(
  activeYear: number,
  availableYears: number[],
  monthDayLabel: string,
  canSearchRandomYear: boolean
): { cards: NavigationCard[]; randomYears: number[] } {
  const sortedYears = Array.from(new Set(availableYears)).sort((left, right) => left - right);
  const previousYear = sortedYears.filter((year) => year < activeYear).at(-1) ?? null;
  const nextYear = sortedYears.find((year) => year > activeYear) ?? null;
  const randomYears = sortedYears.filter((year) => year !== activeYear);

  return {
    cards: [
      {
        id: 'previous',
        eyebrow: '이전 판',
        value: previousYear ? String(previousYear) : '없음',
        description: previousYear ? `${monthDayLabel}에 확인된 가장 가까운 이전 해입니다.` : '더 이른 해의 확인된 지면이 없습니다.',
        helper: previousYear ? '가장 가까운 보관 연도' : '보관 없음',
        targetYear: previousYear
      },
      {
        id: 'random',
        eyebrow: '임의 탐색',
        value: canSearchRandomYear ? '임의' : '없음',
        description: canSearchRandomYear
          ? '현재 판을 제외한 이동 가능한 해 전체에서 무작위로 한 판을 고릅니다.'
          : '이 서비스 범위에서 이동할 다른 해가 없습니다.',
        helper: canSearchRandomYear ? '가능 연도 전체 무작위' : '후보 없음',
        targetYear: null
      },
      {
        id: 'next',
        eyebrow: '다음 판',
        value: nextYear ? String(nextYear) : '없음',
        description: nextYear ? `${monthDayLabel}에 확인된 가장 가까운 다음 해입니다.` : '더 늦은 해의 확인된 지면이 없습니다.',
        helper: nextYear ? '가장 가까운 보관 연도' : '보관 없음',
        targetYear: nextYear
      }
    ],
    randomYears
  };
}

export function ArchiveYearNavigator({
  activeYear,
  currentYear,
  monthDay,
  monthDayLabel,
  availableYears
}: ArchiveYearNavigatorProps) {
  const { goToYearsAgo, isNavigating, pendingYearsAgo } = useYearNavigation();
  const [isResolvingRandom, setIsResolvingRandom] = useState(false);
  const [pendingCardId, setPendingCardId] = useState<NavigationCard['id'] | null>(null);
  const [randomUnavailable, setRandomUnavailable] = useState(false);
  const sortedYears = Array.from(new Set(availableYears)).sort((left, right) => left - right);
  const canSearchRandomYear = currentYear > MIN_YEAR;
  const { cards, randomYears } = buildNavigationCards(activeYear, sortedYears, monthDayLabel, canSearchRandomYear);
  const isBusy = isNavigating || isResolvingRandom;

  const navigateToYear = (targetYear: number | null, cardId: NavigationCard['id']) => {
    if (targetYear === null) {
      return;
    }

    setPendingCardId(cardId);
    goToYearsAgo(currentYear - targetYear);
  };

  const navigateRandom = async () => {
    if (!canSearchRandomYear) {
      return;
    }

    setPendingCardId('random');
    setRandomUnavailable(false);
    setIsResolvingRandom(true);

    let targetYear: number | null = null;

    try {
      const response = await fetch(
        `/api/random-year?monthDay=${encodeURIComponent(monthDay)}&activeYear=${encodeURIComponent(String(activeYear))}`,
        {
          cache: 'no-store'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resolve a random archive year.');
      }

      const payload = (await response.json()) as { year?: number | null };
      targetYear = typeof payload.year === 'number' ? payload.year : null;
    } catch {
      targetYear = randomYears[getRandomIndex(randomYears.length)] ?? null;
    } finally {
      setIsResolvingRandom(false);
    }

    if (targetYear !== null) {
      navigateToYear(targetYear, 'random');
      return;
    }

    setPendingCardId(null);
    setRandomUnavailable(true);
  };

  return (
    <section className="archive-panel relative hidden min-h-0 flex-1 overflow-hidden border-2 border-ink text-sm text-muted-ink xl:flex xl:flex-col">
      <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">같은 날짜 더 보기</p>
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em] text-[color:var(--banner-ink-muted)]">
          {monthDayLabel}
        </p>
      </div>

      <div className="relative flex flex-1 flex-col px-4 py-4">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-4 top-4 h-px bg-ink/10" />
          <div className="absolute inset-x-4 top-10 grid grid-cols-5 gap-2 opacity-[0.16]">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={`ghost-column-${index}`} className="h-28 border-l border-ink/20" />
            ))}
          </div>
          <div className="absolute bottom-4 right-4 font-display text-[5.6rem] font-extrabold leading-none tracking-[-0.08em] text-ink/[0.05]">
            {String(activeYear).slice(-2)}
          </div>
          <div className="absolute left-4 top-16 h-[120px] w-[68%] bg-[linear-gradient(180deg,rgba(17,17,17,0.04),transparent)]" />
        </div>

        <div className="relative space-y-3">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-ink">Archive Jump</p>
          <div className="space-y-2">
            <h3 className="text-balance font-display text-[1.48rem] font-bold leading-[1.02] tracking-[-0.035em] text-ink">
              확인된 보관 연도만 따라
              <br />
              다른 판으로 넘깁니다
            </h3>
            <p className="hangul-keep max-w-[24rem] font-sans text-[0.88rem] leading-6 text-ink/78">
              이전, 임의, 다음 이동 모두 실제로 자료가 확인된 해만 노출합니다. 빈 연도나 닿지 않는 경로로는 보내지 않습니다.
            </p>
          </div>
        </div>

        <div className="relative mt-5 space-y-3">
          {cards.map((card) => {
            const isRandomCard = card.id === 'random';
            const displayCard =
              isRandomCard && randomUnavailable
                ? {
                    ...card,
                    value: '없음',
                    description: '이 날짜에 이동할 다른 확인 연도를 찾지 못했습니다.',
                    helper: '후보 없음'
                  }
                : card;
            const isEnabled = isRandomCard ? canSearchRandomYear && !randomUnavailable : card.targetYear !== null;
            const isPending = isEnabled && pendingYearsAgo !== null && pendingCardId === card.id;

            return (
              <button
                key={card.id}
                className="group relative min-h-[112px] w-full overflow-hidden border-2 border-ink bg-[color:var(--surface-tag)] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:-translate-y-[1px] hover:bg-white/70 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-[color:var(--surface-tag)]"
                disabled={!isEnabled || isBusy}
                type="button"
                onClick={() => {
                  if (isRandomCard) {
                    void navigateRandom();
                    return;
                  }

                  navigateToYear(card.targetYear, card.id);
                }}
              >
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),transparent_36%,rgba(17,17,17,0.03))]" />
                <div aria-hidden="true" className="absolute inset-x-3 top-[44px] space-y-2 opacity-[0.14]">
                  <div className="h-px w-[68%] bg-ink" />
                  <div className="h-px w-[84%] bg-ink" />
                  <div className="h-px w-[56%] bg-ink" />
                </div>

                <div className="relative flex h-full flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">
                      {displayCard.eyebrow}
                    </p>
                    <span className="font-tabloid text-[9px] font-semibold uppercase tracking-[0.24em] text-ink/60">
                      {isPending || (isRandomCard && isResolvingRandom) ? '판 찾는 중' : displayCard.helper}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-display text-[2.35rem] font-extrabold leading-none tracking-[-0.06em] text-ink">
                      {displayCard.value}
                    </p>
                    <p className="hangul-keep max-w-[17rem] font-sans text-[0.8rem] leading-5 text-ink/76">
                      {displayCard.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="relative mt-auto flex items-center justify-between gap-3 border-t-2 border-ink pt-3">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">
            확인된 연도 {sortedYears.length}건
          </p>
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">랜덤도 안전 이동</p>
        </div>
      </div>
    </section>
  );
}
