import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { useSidebarCollapsed } from '../Sidebar/SidebarContext';
import styles from './NavGroup.module.css';

export interface NavGroupProps {
  /** Figma의 `hasTitle`. 값이 있으면 그룹 제목이 보인다. */
  title?: string;
  /** 비우면 Sidebar를 따른다 */
  collapsed?: boolean;
  children: ReactNode;
  className?: string;
}

/** 접힌 상태에서는 제목 대신 구분선을 보여주고, 제목은 스크린 리더용으로 남긴다. */
export function NavGroup({ title, collapsed: collapsedProp, children, className }: NavGroupProps) {
  const collapsed = useSidebarCollapsed(collapsedProp);
  const id = useId();
  return (
    <div data-component="NavGroup" role="group" aria-labelledby={title ? id : undefined} className={cx(styles.group, className)}>
      {title && (
        <div id={id} className={cx(collapsed ? 'visually-hidden' : styles.title, 'text-body-sm')}>
          {title}
        </div>
      )}
      {title && collapsed && <hr className={styles.divider} aria-hidden="true" />}
      <ul className={styles.list}>{children}</ul>
    </div>
  );
}

/** NavGroup 안에서 NavItem을 감싸는 목록 항목 */
export function NavGroupItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}
