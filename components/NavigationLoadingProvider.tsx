'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArchiveFrontPageSkeleton } from '@/components/ArchiveFrontPageSkeleton';

type NavigationLoadingContextValue = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const NavigationLoadingContext = createContext<NavigationLoadingContextValue | null>(null);

export function NavigationLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      startLoading,
      stopLoading
    }),
    [isLoading, startLoading, stopLoading]
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      {children}
      {isLoading ? (
        <div aria-live="polite" className="fixed inset-0 z-[120] overflow-auto">
          <span className="sr-only">콘텐츠 불러오는 중</span>
          <ArchiveFrontPageSkeleton />
        </div>
      ) : null}
    </NavigationLoadingContext.Provider>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);

  if (!context) {
    throw new Error('useNavigationLoading must be used within NavigationLoadingProvider.');
  }

  return context;
}
