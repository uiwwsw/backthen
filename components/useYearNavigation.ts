'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationLoading } from '@/components/NavigationLoadingProvider';

export function useYearNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { startLoading, stopLoading } = useNavigationLoading();
  const [isPending, startTransition] = useTransition();
  const [pendingYearsAgo, setPendingYearsAgo] = useState<number | null>(null);
  const pendingPathRef = useRef<string | null>(null);

  useEffect(() => {
    pendingPathRef.current = null;
    setPendingYearsAgo(null);
    stopLoading();
  }, [pathname, stopLoading]);

  const goToYearsAgo = (yearsAgo: number) => {
    const nextPath = `/${yearsAgo}`;

    if (nextPath === pathname || pendingPathRef.current === nextPath) {
      return false;
    }

    pendingPathRef.current = nextPath;
    setPendingYearsAgo(yearsAgo);
    startLoading();
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
