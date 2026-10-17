import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Tag.module.css';

export type TagTone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning';

export interface TagProps {
  tone?: TagTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** 휴가 종류, '내일 시작' 같은 짧은 꼬리표. 상태(대기/승인/반려)는 Badge를 쓴다. */
export function Tag({ tone = 'neutral', icon, children, className }: TagProps) {
  return (
    <span data-component="Tag" className={cx(styles.tag, styles[tone], 'text-label-sm', className)}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
