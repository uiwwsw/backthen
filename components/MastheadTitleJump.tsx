'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useYearNavigation } from '@/components/useYearNavigation';
import { DEFAULT_YEARS_AGO, sanitizeYearsAgoInput } from '@/lib/year';

type MastheadTitleJumpProps = {
  titleLabel: string;
  monthDayLabel: string;
  currentYear: number;
  currentYearsAgo: number;
  minYearsAgo: number;
  maxYearsAgo: number;
};

function buildQuickYears(maxYearsAgo: number, currentYearsAgo: number | null) {
  const values = [1, 5, 10, 20, DEFAULT_YEARS_AGO, 50, currentYearsAgo, maxYearsAgo].filter(
    (value): value is number => value !== null && value >= 0 && value <= maxYearsAgo
  );

  return Array.from(new Set(values)).sort((left, right) => left - right);
}

export function MastheadTitleJump({
  titleLabel,
  monthDayLabel,
  currentYear,
  currentYearsAgo,
  minYearsAgo,
  maxYearsAgo
}: MastheadTitleJumpProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const { goToYearsAgo, isNavigating } = useYearNavigation();
  const resolvedCurrentYearsAgo =
    currentYearsAgo >= minYearsAgo && currentYearsAgo <= maxYearsAgo ? currentYearsAgo : null;
  const quickYears = buildQuickYears(maxYearsAgo, resolvedCurrentYearsAgo);
  const defaultYearsAgo = resolvedCurrentYearsAgo ?? Math.min(DEFAULT_YEARS_AGO, maxYearsAgo);
  const exampleYearsAgo = Math.min(30, maxYearsAgo);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(String(defaultYearsAgo));
  const [error, setError] = useState<string | null>(null);
  const maxInputLength = String(maxYearsAgo).length;
  const numericValue = Number(value);
  const isNumeric = value.length > 0 && !Number.isNaN(numericValue);
  const isInRange = isNumeric && numericValue >= minYearsAgo && numericValue <= maxYearsAgo;
  const previewYearsAgo = isInRange ? numericValue : defaultYearsAgo;
  const previewYear = currentYear - previewYearsAgo;

  useEffect(() => {
    setValue(String(defaultYearsAgo));
    setError(null);
  }, [defaultYearsAgo]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isNavigating) {
          return;
        }

        setIsOpen(false);
        setError(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isNavigating, isOpen]);

  const navigateToYearsAgo = (yearsAgo: number) => {
    setError(null);

    if (goToYearsAgo(yearsAgo)) {
      setIsOpen(false);
      return;
    }

    if (yearsAgo === resolvedCurrentYearsAgo) {
      setError('이미 보고 있는 판입니다.');
    }
  };

  const submit = () => {
    if (!isNumeric) {
      setError('몇 년 전인지 숫자로 입력해주세요.');
      return;
    }

    if (!isInRange) {
      setError(`입력 가능한 범위는 ${minYearsAgo} - ${maxYearsAgo}년 전입니다.`);
      return;
    }

    navigateToYearsAgo(numericValue);
  };

  return (
    <>
      <div className="border-y-[3px] border-ink py-4">
        <button
          aria-expanded={isOpen}
          aria-busy={isNavigating}
          className="group block w-full text-left disabled:cursor-progress disabled:opacity-75"
          disabled={isNavigating}
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
        >
          <span className="block text-balance font-display text-[clamp(1.85rem,4.4vw,3.75rem)] font-extrabold leading-[0.96] tracking-[-0.05em] text-ink transition group-hover:text-tabloid-red">
            {titleLabel}
          </span>
          <span className="mt-3 flex flex-wrap items-center gap-3 font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">
            <span>제호 클릭</span>
            <span className="h-3 border-l border-line" />
            <span>판 이동 열기</span>
            <span className="h-3 border-l border-line" />
            <span>주소도 직접 수정 가능</span>
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,8,8,0.82)] px-4 py-6 backdrop-blur-[4px]"
          onClick={() => {
            if (isNavigating) {
              return;
            }

            setIsOpen(false);
            setError(null);
          }}
        >
          <div
            aria-describedby={dialogDescriptionId}
            aria-labelledby={dialogTitleId}
            aria-modal="true"
            className="archive-panel w-full max-w-[620px] border-2 border-ink shadow-[0_28px_90px_rgba(17,17,17,0.38)]"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-[color:var(--banner)] px-4 py-3 text-[color:var(--banner-ink)]">
              <div>
                <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--banner-ink-muted)]">
                  Time Jump
                </p>
                <p className="mt-1 font-display text-[1.42rem] font-bold tracking-[-0.03em]" id={dialogTitleId}>
                  몇 년 전의 오늘로 갈까요
                </p>
              </div>
              <button
                className="border border-[color:var(--banner-line)] px-3 py-2 font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--banner-ink)] transition hover:bg-white/10 disabled:cursor-progress disabled:opacity-55"
                disabled={isNavigating}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
              >
                닫기
              </button>
            </div>

            <form
              className="space-y-5 p-4 sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <div className="space-y-2" id={dialogDescriptionId}>
                <p className="hangul-keep text-balance font-sans text-[1rem] leading-7 text-ink/84">
                  숫자만 입력하면 같은 날짜의 다른 해 기사로 바로 이동합니다. 원하면 주소창 맨 끝 숫자를 직접 바꿔도 됩니다.
                </p>
                <p className="hangul-keep font-sans text-[0.92rem] leading-6 text-ink/70">
                  지금 보고 있는 판은 {resolvedCurrentYearsAgo !== null ? `/${resolvedCurrentYearsAgo}` : '현재 경로'}이고, 예를 들어 `{exampleYearsAgo}`을
                  입력하면 {currentYear - exampleYearsAgo}년 {monthDayLabel} 판으로 이동합니다.
                </p>
              </div>

              <div className="grid gap-4 border-y-2 border-ink py-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-end">
                <label className="block">
                  <span className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">몇 년 전 입력</span>
                  <input
                    ref={inputRef}
                    className="mt-3 w-full border-0 border-b-[3px] border-ink bg-transparent px-0 pb-2 pt-1 font-display text-[3rem] font-bold leading-none tracking-[-0.06em] text-ink outline-none placeholder:text-ink/28 focus:border-tabloid-red disabled:cursor-progress disabled:opacity-55"
                    disabled={isNavigating}
                    inputMode="numeric"
                    maxLength={maxInputLength}
                    pattern="[0-9]*"
                    placeholder={String(defaultYearsAgo)}
                    value={value}
                    onChange={(event) => {
                      setValue(sanitizeYearsAgoInput(event.target.value, maxInputLength));
                      setError(null);
                    }}
                  />
                </label>

                <div className="border border-ink/15 bg-[color:var(--surface-tag)] p-3 sm:text-right">
                  <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">열릴 판</p>
                  <p className="mt-2 font-mono text-[1.02rem] text-ink">/{value || String(defaultYearsAgo)}</p>
                  <p className="mt-2 hangul-keep font-sans text-[0.92rem] leading-6 text-ink/78">
                    {previewYear}년 {monthDayLabel}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">빠른 이동</p>
                <div className="flex flex-wrap gap-2">
                  {quickYears.map((yearsAgo) => (
                    <button
                      key={yearsAgo}
                      className="border border-ink bg-[color:var(--surface)] px-3 py-2 font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-ink transition hover:bg-[color:var(--surface-muted)] disabled:cursor-progress disabled:opacity-55"
                      disabled={isNavigating}
                      type="button"
                      onClick={() => navigateToYearsAgo(yearsAgo)}
                    >
                      {yearsAgo}년 전
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-ink/12 bg-[color:var(--surface)] px-4 py-3">
                <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">주소창으로도 이동 가능</p>
                <p className="mt-2 hangul-keep font-sans text-[0.92rem] leading-6 text-ink/78">
                  이 창을 띄운 채로 주소창 맨 끝 숫자를 바꿔도 됩니다. 한 번 이동한 뒤에는 경로의 마지막 숫자만 수정하면 같은 날짜의 다른 해로 넘어갑니다.
                </p>
              </div>

              {error ? <p className="font-sans text-[0.96rem] leading-6 text-tabloid-red">{error}</p> : null}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  className="border border-ink bg-transparent px-4 py-3 font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-ink transition hover:bg-[color:var(--surface)] disabled:cursor-progress disabled:opacity-55"
                  disabled={isNavigating}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                  }}
                >
                  취소
                </button>
                <button
                  className="border-2 border-ink bg-tabloid-red px-4 py-3 font-tabloid text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--accent-ink)] transition hover:bg-[color:var(--tabloid-red-strong)] disabled:cursor-progress disabled:bg-[color:var(--tabloid-red-strong)] disabled:opacity-80"
                  disabled={isNavigating}
                  type="submit"
                >
                  이동
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
