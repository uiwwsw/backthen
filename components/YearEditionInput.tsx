'use client';

import Link from 'next/link';
import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeYearsAgoInput } from '@/lib/year';

type YearEditionInputProps = {
  currentYearsAgo: number;
  minYearsAgo: number;
  maxYearsAgo: number;
};

export function YearEditionInput({ currentYearsAgo, minYearsAgo, maxYearsAgo }: YearEditionInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(String(currentYearsAgo));
  const [error, setError] = useState<string | null>(null);
  const previousYearsAgo = currentYearsAgo > minYearsAgo ? currentYearsAgo - 1 : null;
  const nextYearsAgo = currentYearsAgo < maxYearsAgo ? currentYearsAgo + 1 : null;
  const helper = `${minYearsAgo} - ${maxYearsAgo}년 전`;
  const maxInputLength = String(maxYearsAgo).length;

  const submit = () => {
    const numeric = Number(value);

    if (value.length === 0 || Number.isNaN(numeric)) {
      setError('지금을 기준으로 몇 년 전인지 숫자로 입력해주세요.');
      return;
    }

    if (numeric < minYearsAgo || numeric > maxYearsAgo) {
      setError(`지원 범위는 ${helper}입니다.`);
      return;
    }

    setError(null);
    startTransition(() => {
      router.push(`/${numeric}`);
    });
  };

  return (
    <section className="border-2 border-ink bg-[color:var(--surface)]">
      <div className="border-b-2 border-ink bg-[color:var(--banner)] px-4 py-2 text-[color:var(--banner-ink)]">
        <p className="font-tabloid text-[11px] font-semibold uppercase tracking-[0.3em]">시간 이동</p>
      </div>

      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <p className="font-tabloid text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-ink">지금에서 얼마나 거슬러 갈까요</p>
          <p className="hangul-keep font-sans text-[0.9rem] leading-6 text-ink/78">입력값은 절대 연도가 아니라 지금 기준 몇 년 전인지입니다.</p>
          <div className="flex items-end justify-between gap-4">
            <label className="flex-1">
              <span className="sr-only">몇 년 전 입력</span>
              <input
                className="w-full border-0 border-b-[3px] border-ink bg-transparent px-0 pb-2 pt-1 font-tabloid text-[2.4rem] font-bold leading-none tracking-[-0.04em] text-ink outline-none placeholder:text-ink/28 focus:border-tabloid-red"
                inputMode="numeric"
                maxLength={maxInputLength}
                pattern="[0-9]*"
                placeholder="30"
                value={value}
                onChange={(event) => {
                  setValue(sanitizeYearsAgoInput(event.target.value, maxInputLength));
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    submit();
                  }
                }}
              />
            </label>
            <button
              className="border-2 border-ink bg-tabloid-red px-4 py-3 font-tabloid text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--accent-ink)] transition hover:bg-[color:var(--tabloid-red-strong)]"
              type="button"
              onClick={submit}
            >
              이동
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-y-2 border-ink py-3 font-tabloid text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-ink">
          {previousYearsAgo !== null ? (
            <Link className="transition hover:text-ink" href={`/${previousYearsAgo}`}>
              더 최근
            </Link>
          ) : (
            <span className="opacity-35">더 최근</span>
          )}
          <span>{helper}</span>
          {nextYearsAgo !== null ? (
            <Link className="transition hover:text-ink" href={`/${nextYearsAgo}`}>
              더 과거
            </Link>
          ) : (
            <span className="opacity-35">더 과거</span>
          )}
        </div>

        {error ? <p className="font-sans text-[0.96rem] leading-6 text-tabloid-red">{error}</p> : null}
      </div>
    </section>
  );
}
