import { X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { lockBodyScroll } from '@/lib/scrollbars';
import { IconButton } from '../IconButton/IconButton';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import styles from './Sheet.module.css';

export interface SheetProps {
  open: boolean;
  /** Esc, 배경 클릭, 닫기 버튼, 아래로 끌어내리기 모두 이 함수를 부른다. */
  onClose: () => void;
  /** 닫힘 애니메이션이 끝난 뒤 불린다. (라우트 이동처럼 애니메이션 후에 할 일) */
  onExited?: () => void;
  title: ReactNode;
  /** Figma의 `hasDescription`. 값이 있으면 보인다. */
  description?: ReactNode;
  /** Figma의 `hasDismissButton` (원래 이름은 `hasDissmissButton` 오타) */
  showDismissButton?: boolean;
  /** Figma의 `hasFooter`. 하단 고정 영역. 보통 ButtonGroup. */
  footer?: ReactNode;
  /** 본문. 길어지면 이 영역만 스크롤된다. */
  children: ReactNode;
  className?: string;
}

type Phase = 'closed' | 'entering' | 'open' | 'exiting';

/** 아래로 이만큼(px) 끌거나, 이 속도(px/ms) 이상으로 튕기면 닫는다. */
const DISMISS_DISTANCE_RATIO = 0.25;
const DISMISS_VELOCITY = 0.5;
/** 닫힘 애니메이션이 끝나기를 기다리는 최대 시간 (transitionend가 오지 않는 경우 대비) */
const EXIT_FALLBACK_MS = 450;

/**
 * 태블릿·데스크탑: 화면 가운데 다이얼로그 (최대 폭 800)
 * 모바일: iOS 스타일 bottom sheet
 *   - 아래에서 올라오고, 손잡이·헤더를 끌어내려 닫는다
 *   - 열리는 동안 뒤 화면(`data-sheet-background`)이 살짝 줄어들고 둥글어진다
 *   - 하단 safe area(홈 인디케이터)만큼 여백을 둔다
 */
export function Sheet({
  open,
  onClose,
  onExited,
  title,
  description,
  showDismissButton = true,
  footer,
  children,
  className,
}: SheetProps) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>(open ? 'entering' : 'closed');
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startY: number; lastY: number; lastT: number; velocity: number } | null>(null);

  // open 값에 따라 단계 전환: closed → entering → open → exiting → closed
  useLayoutEffect(() => {
    if (open && (phase === 'closed' || phase === 'exiting')) setPhase('entering');
    if (!open && (phase === 'open' || phase === 'entering')) setPhase('exiting');
  }, [open, phase]);

  useEffect(() => {
    if (phase === 'entering') {
      setDragY(0);
      // 한 프레임 뒤에 open으로 바꿔야 CSS transition이 시작점에서 출발한다
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')));
      return () => cancelAnimationFrame(id);
    }
    if (phase === 'exiting') {
      const timer = window.setTimeout(() => setPhase('closed'), EXIT_FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  const wasVisible = useRef(false);
  useEffect(() => {
    if (phase !== 'closed') wasVisible.current = true;
    else if (wasVisible.current) {
      wasVisible.current = false;
      onExited?.();
    }
  }, [phase, onExited]);

  const visible = phase !== 'closed';
  useFocusTrap(panelRef, visible);

  // 열린 동안: 배경 스크롤 잠금, iOS 배경 축소 효과용 표시
  useEffect(() => {
    if (!visible) return;
    const html = document.documentElement;
    html.dataset.sheetOpen = phase === 'open' || phase === 'entering' ? 'true' : 'closing';
    return () => {
      delete html.dataset.sheetOpen;
    };
  }, [visible, phase]);

  useEffect(() => {
    if (visible) return lockBodyScroll();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  // ── 모바일 드래그 ──
  const onPointerDown = (e: React.PointerEvent) => {
    if (!isMobile || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, a, input, textarea, select')) return;
    drag.current = { startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, velocity: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    const dy = e.clientY - d.startY;
    // 위로 끌면 고무줄처럼 조금만 따라온다
    setDragY(dy > 0 ? dy : dy / 4);
  };
  const onPointerEnd = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragging(false);
    const height = panelRef.current?.offsetHeight ?? 1;
    if (dragY > height * DISMISS_DISTANCE_RATIO || d.velocity > DISMISS_VELOCITY) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const height = panelRef.current?.offsetHeight ?? 1;
  const progress = Math.min(1, Math.max(0, dragY / height));
  const style = { '--sheet-drag': `${dragY}px`, '--sheet-drag-progress': progress } as CSSProperties;

  const dragHandlers = isMobile
    ? { onPointerDown, onPointerMove, onPointerUp: onPointerEnd, onPointerCancel: onPointerEnd }
    : {};

  return createPortal(
    <div
      className={cx(styles.root, isMobile ? styles.mobile : styles.desktop)}
      data-state={phase === 'open' ? 'open' : 'closed'}
      data-dragging={dragging || undefined}
      style={style}
      onTransitionEnd={(e) => {
        if (phase === 'exiting' && e.target === panelRef.current) setPhase('closed');
      }}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(styles.panel, className)}
      >
        <div className={styles.dragArea} {...dragHandlers}>
          {isMobile && <div className={styles.grabber} aria-hidden="true" />}
          <header className={styles.header}>
            <div className={styles.titles}>
              <h2 id={titleId} className={isMobile ? 'text-heading-md' : 'text-heading-xl'}>
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className={cx(styles.description, 'text-body-md')}>
                  {description}
                </p>
              )}
            </div>
            {showDismissButton && <IconButton label="닫기" icon={<X />} size="md" onClick={onClose} />}
          </header>
        </div>
        <ScrollArea className={styles.scroll}>
          <div className={styles.body}>{children}</div>
        </ScrollArea>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
