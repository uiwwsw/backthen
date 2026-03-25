'use client';

import { useState } from 'react';
import { useYearNavigation } from '@/components/useYearNavigation';

type ArchiveYearNavigatorProps = {
  activeYear: number;
  currentYear: number;
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
  monthDayLabel: string
): { cards: NavigationCard[]; randomYears: number[] } {
  const sortedYears = Array.from(new Set(availableYears)).sort((left, right) => left - right);
  const previousYear = sortedYears.filter((year) => year < activeYear).at(-1) ?? null;
  const nextYear = sortedYears.find((year) => year > activeYear) ?? null;
  const randomYears = sortedYears.filter((year) => year !== activeYear);
  const cards: NavigationCard[] = [];

  if (previousYear !== null) {
    cards.push({
      id: 'previous',
      eyebrow: '이전 판',
      value: String(previousYear),
      description: `${monthDayLabel}의 가장 가까운 이전 판입니다.`,
      helper: '가까운 해',
      targetYear: previousYear
    });
  }

  if (randomYears.length) {
    cards.push({
      id: 'random',
      eyebrow: '임의 탐색',
      value: '임의',
      description: '이 날짜의 다른 판 가운데 한 판으로 바로 이동합니다.',
      helper: '무작위',
      targetYear: null
    });
  }

  if (nextYear !== null) {
    cards.push({
      id: 'next',
      eyebrow: '다음 판',
      value: String(nextYear),
      description: `${monthDayLabel}의 가장 가까운 다음 판입니다.`,
      helper: '가까운 해',
      targetYear: nextYear
    });
  }

  return {
    cards,
    randomYears
  };
}

export function ArchiveYearNavigator({
  activeYear,
  currentYear,
  monthDayLabel,
  availableYears
}: ArchiveYearNavigatorProps) {
  const { goToYearsAgo, isNavigating, pendingYearsAgo } = useYearNavigation();
  const [pendingCardId, setPendingCardId] = useState<NavigationCard['id'] | null>(null);
  const { cards, randomYears } = buildNavigationCards(activeYear, availableYears, monthDayLabel);
  const isBusy = isNavigating;

  const navigateToYear = (targetYear: number | null, cardId: NavigationCard['id']) => {
    if (targetYear === null) {
      return;
    }

    setPendingCardId(cardId);
    goToYearsAgo(currentYear - targetYear);
  };

  const navigateRandom = () => {
    if (!randomYears.length) {
      return;
    }

    const targetYear = randomYears[getRandomIndex(randomYears.length)] ?? null;
    navigateToYear(targetYear, 'random');
  };

  if (!cards.length) {
    return null;
  }

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
          {cards.map((card) => {
            const isRandomCard = card.id === 'random';
            const isEnabled = isRandomCard ? randomYears.length > 0 : card.targetYear !== null;
            const isPending = isEnabled && pendingYearsAgo !== null && pendingCardId === card.id;

            return (
              <button
                key={card.id}
                className="group relative min-h-[112px] w-full overflow-hidden border-2 border-ink bg-[color:var(--surface-tag)] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:-translate-y-[1px] hover:bg-white/70 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-[color:var(--surface-tag)]"
                disabled={!isEnabled || isBusy}
                type="button"
                onClick={() => {
                  if (isRandomCard) {
                    navigateRandom();
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
                      {card.eyebrow}
                    </p>
                    <span className="font-tabloid text-[9px] font-semibold uppercase tracking-[0.24em] text-ink/60">
                      {isPending ? '이동 중' : card.helper}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="font-display text-[2.35rem] font-extrabold leading-none tracking-[-0.06em] text-ink">
                      {card.value}
                    </p>
                    <p className="hangul-keep max-w-[17rem] font-sans text-[0.8rem] leading-5 text-ink/76">
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
