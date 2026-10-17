import { OverlayScrollbars, type PartialOptions } from 'overlayscrollbars';

/**
 * 모든 스크롤바 공통 설정
 * - 내용 위에 겹쳐 그려 폭을 차지하지 않는다
 * - 영역에 마우스가 없으면 숨는다 (autoHide: 'leave')
 */
export const scrollbarOptions: PartialOptions = {
  scrollbars: {
    theme: 'os-theme-holiday',
    autoHide: 'leave',
    autoHideDelay: 200,
    clickScroll: true,
  },
};

/** 페이지 전체(body) 스크롤바 */
export function initBodyScrollbars() {
  return OverlayScrollbars({ target: document.body, cancel: { body: null } }, scrollbarOptions);
}

/**
 * 배경 스크롤 잠금. body에 OverlayScrollbars가 붙어 있으면 그 설정을 바꾸고,
 * 아니면 html의 overflow를 막는다. 해제 함수를 돌려준다.
 */
let lockCount = 0;

/** 시트 위에 시트가 열려도 마지막 하나가 닫힐 때 풀리도록 횟수를 센다. */
export function lockBodyScroll(): () => void {
  lockCount += 1;
  if (lockCount === 1) setBodyScroll(false);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) setBodyScroll(true);
  };
}

function setBodyScroll(enabled: boolean) {
  const instance = OverlayScrollbars(document.body);
  if (instance) {
    instance.options({ overflow: enabled ? { x: 'scroll', y: 'scroll' } : { x: 'hidden', y: 'hidden' } });
    return;
  }
  document.documentElement.style.overflow = enabled ? '' : 'hidden';
}
