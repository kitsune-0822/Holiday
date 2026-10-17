import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 열려 있는 동안 Tab 포커스를 container 안에 가두고, 닫히면 원래 위치로 돌려준다.
 * 바깥 요소에는 `inert`를 걸어 클릭·스크린 리더 탐색도 막는다.
 */
export function useFocusTrap(container: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const node = container.current;
    if (!active || !node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = node.querySelector<HTMLElement>('[data-autofocus]') ?? node;
    first.focus({ preventScroll: true });

    // 포털 루트의 형제 요소를 비활성화한다
    let portalRoot: HTMLElement = node;
    while (portalRoot.parentElement && portalRoot.parentElement !== document.body) portalRoot = portalRoot.parentElement;
    const siblings = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== portalRoot && !el.inert,
    );
    siblings.forEach((el) => (el.inert = true));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
        // 화면에 보이는 것만. checkVisibility가 없는 환경에서는 모두 포함한다.
        .filter((el) => el.tabIndex >= 0 && (el.checkVisibility?.() ?? true));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === firstItem || document.activeElement === node)) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    node.addEventListener('keydown', onKeyDown);

    return () => {
      node.removeEventListener('keydown', onKeyDown);
      siblings.forEach((el) => (el.inert = false));
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [container, active]);
}
