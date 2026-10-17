import { useOverlayScrollbars } from 'overlayscrollbars-react';
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { scrollbarOptions } from '@/lib/scrollbars';
import styles from './ScrollArea.module.css';

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** 스크롤할 방향 */
  axis?: 'y' | 'x' | 'both';
  /** 스크롤 영역(viewport)에 붙일 속성. 키보드 스크롤용 tabIndex, 접근성 이름 등. */
  viewportProps?: HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
}

/**
 * 폭을 차지하지 않고, 마우스가 올라갔을 때만 보이는 얇은 스크롤바를 가진 영역.
 * 바깥(host)이 크기를 정하고, 안쪽(viewport)이 실제로 스크롤된다.
 */
export function ScrollArea({ axis = 'y', viewportProps, className, children, ...rest }: ScrollAreaProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [initialize, instance] = useOverlayScrollbars({
    options: {
      ...scrollbarOptions,
      overflow: { x: axis === 'y' ? 'hidden' : 'scroll', y: axis === 'x' ? 'hidden' : 'scroll' },
    },
    defer: true,
  });

  useEffect(() => {
    const host = hostRef.current;
    const viewport = viewportRef.current;
    if (host && viewport) initialize({ target: host, elements: { viewport } });
    return () => instance()?.destroy();
  }, [initialize, instance]);

  return (
    <div ref={hostRef} className={cx(styles.host, className)} data-overlayscrollbars-initialize="" {...rest}>
      <div ref={viewportRef} {...viewportProps} className={cx(styles.viewport, viewportProps?.className)}>
        {children}
      </div>
    </div>
  );
}
