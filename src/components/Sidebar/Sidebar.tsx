import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Logo } from '../Logo/Logo';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { SidebarCollapsedContext } from './SidebarContext';
import styles from './Sidebar.module.css';

export interface SidebarAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface SidebarProps {
  /**
   * 고정된 접힘 상태. 접혀 있어도 마우스를 올리거나 누르면 잠깐 펼쳐진다(peek).
   * (Figma에서 헤더 `state=minimized`와 본문 `isMinimized`로 나뉘어 있던 것을 합쳤다.)
   */
  collapsed: boolean;
  /** 없으면 접기/고정 버튼을 숨긴다 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 상단 주요 행동 (휴가 신청하기). 접히면 아이콘 버튼으로 바뀐다. */
  primaryAction?: SidebarAction;
  /** 위쪽 메뉴 그룹들 */
  children: ReactNode;
  /** 아래쪽에 붙는 메뉴 그룹 (내 정보, 설정, 로그아웃) */
  footer?: ReactNode;
  className?: string;
}

/**
 * 접힘(collapsed) 상태에서
 * - 마우스를 올리면 펼쳐지고, 벗어나면 다시 접힌다
 * - 터치·클릭하면 펼쳐지고(첫 탭은 메뉴를 실행하지 않음), 바깥을 누르거나 메뉴를 고르면 접힌다
 * - 키보드로 들어오면 펼쳐진다
 * 펼쳐진 패널은 본문 위에 겹쳐 그려 본문 레이아웃이 움직이지 않는다.
 */
export function Sidebar({ collapsed, onCollapsedChange, primaryAction, children, footer, className }: SidebarProps) {
  const [peek, setPeek] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const pointerType = useRef<string>('mouse');
  const visuallyCollapsed = collapsed && !peek;

  useEffect(() => {
    if (!collapsed) setPeek(false);
  }, [collapsed]);

  // 펼쳐 둔 동안 바깥을 누르거나 Esc를 누르면 접는다
  useEffect(() => {
    if (!peek) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPeek(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPeek(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [peek]);

  const handlers = collapsed
    ? {
        onPointerEnter: (e: React.PointerEvent) => {
          pointerType.current = e.pointerType;
          if (e.pointerType === 'mouse') setPeek(true);
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType === 'mouse') setPeek(false);
        },
        onPointerDown: (e: React.PointerEvent) => {
          pointerType.current = e.pointerType;
        },
        onClickCapture: (e: React.MouseEvent) => {
          if (!peek) {
            // 접혀 보일 때의 첫 클릭은 펼치기만 한다
            e.preventDefault();
            e.stopPropagation();
            setPeek(true);
          } else if (pointerType.current !== 'mouse' && (e.target as HTMLElement).closest('a, button:not([data-sidebar-pin])')) {
            // 터치로 메뉴를 고르면 다시 접는다
            setPeek(false);
          }
        },
        // 키보드로 들어온 경우만 펼친다 (클릭으로 생긴 포커스는 위의 클릭 처리에 맡긴다)
        onFocus: (e: React.FocusEvent) => {
          if ((e.target as HTMLElement).matches(':focus-visible')) setPeek(true);
        },
        onBlur: (e: React.FocusEvent) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node) && pointerType.current !== 'mouse') setPeek(false);
        },
      }
    : {};

  return (
    <SidebarCollapsedContext.Provider value={visuallyCollapsed}>
      <aside
        ref={rootRef}
        className={cx(styles.sidebar, collapsed && styles.collapsedSlot, className)}
        aria-label="주 메뉴"
        {...handlers}
      >
        <div className={cx(styles.panel, visuallyCollapsed && styles.collapsed, peek && styles.peek)}>
          <div className={styles.header}>
            <Logo size={visuallyCollapsed ? 'sm' : 'md'} showName={!visuallyCollapsed} />
            {onCollapsedChange && !visuallyCollapsed && (
              <IconButton
                data-sidebar-pin=""
                variant="ghost"
                size="xs"
                label={collapsed ? '메뉴 펼친 채로 고정' : '메뉴 접기'}
                icon={collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
                onClick={() => {
                  setPeek(false);
                  onCollapsedChange(!collapsed);
                }}
              />
            )}
          </div>
          <ScrollArea className={styles.scroll}>
            <nav className={styles.body}>
              <div className={styles.top}>
                {primaryAction && (
                  <div className={styles.action}>
                    {visuallyCollapsed ? (
                      <IconButton variant="primary" size="sm" label={primaryAction.label} icon={primaryAction.icon} onClick={primaryAction.onClick} />
                    ) : (
                      <Button icon={primaryAction.icon} fullWidth onClick={primaryAction.onClick}>
                        {primaryAction.label}
                      </Button>
                    )}
                  </div>
                )}
                {children}
              </div>
              {footer && <div className={styles.footer}>{footer}</div>}
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </SidebarCollapsedContext.Provider>
  );
}
