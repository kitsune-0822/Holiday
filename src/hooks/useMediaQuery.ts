import { useSyncExternalStore } from 'react';
import { breakpoints } from '@/styles/tokens';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** 모바일: tablet 브레이크포인트 미만 */
export const mobileQuery = `(max-width: ${breakpoints.tablet - 1}px)`;
/** 태블릿: tablet 이상 desktop 미만 */
export const tabletQuery = `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`;

export function useIsMobile() {
  return useMediaQuery(mobileQuery);
}
