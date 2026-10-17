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
