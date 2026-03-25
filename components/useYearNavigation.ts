'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useYearNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [pendingYearsAgo, setPendingYearsAgo] = useState<number | null>(null);
  const pendingPathRef = useRef<string | null>(null);

  useEffect(() => {
    pendingPathRef.current = null;
    setPendingYearsAgo(null);
  }, [pathname]);

  const goToYearsAgo = (yearsAgo: number) => {
    const nextPath = `/${yearsAgo}`;

    if (nextPath === pathname || pendingPathRef.current === nextPath) {
      return false;
    }

    pendingPathRef.current = nextPath;
    setPendingYearsAgo(yearsAgo);
    startTransition(() => {
      router.push(nextPath);
    });

    return true;
  };

  return {
    goToYearsAgo,
    isNavigating: pendingYearsAgo !== null || isPending,
    pendingYearsAgo
  };
}
