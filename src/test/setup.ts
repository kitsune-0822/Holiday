import { beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// jsdom에는 matchMedia가 없다. 테스트에서 setViewport로 폭을 바꾼다.
let viewportWidth = 1280;
const listeners = new Set<() => void>();

function matches(query: string) {
  const max = /max-width:\s*(\d+)px/.exec(query);
  const min = /min-width:\s*(\d+)px/.exec(query);
  return (!max || viewportWidth <= Number(max[1])) && (!min || viewportWidth >= Number(min[1]));
}

window.matchMedia = (query: string) =>
  ({
    get matches() {
      return matches(query);
    },
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }) as unknown as MediaQueryList;

export function setViewport(width: number) {
  viewportWidth = width;
  listeners.forEach((cb) => cb());
}

// jsdom에는 ResizeObserver가 없다. 크기를 재지 않는 빈 구현으로 둔다.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// 테스트 환경의 브라우저 언어는 영어라서, 기본 테스트는 한국어로 고정한다.
beforeEach(() => {
  localStorage.setItem('holiday.locale', 'ko');
  localStorage.removeItem('holiday.tweaks.visible');
});
