import { useEffect, useState, type RefObject } from 'react';

/** 요소의 내용이 세로로 넘치는지. 크기가 바뀌면 다시 잰다. */
export function useOverflow(ref: RefObject<HTMLElement | null>): boolean {
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [ref]);
  return overflowing;
}
