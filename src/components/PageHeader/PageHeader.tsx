import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: ReactNode;
  /** 제목 위 작은 경로 표시 (예: 휴가 › 결재) */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** 오른쪽 버튼 영역 */
  actions?: ReactNode;
  className?: string;
}

/** 페이지 제목 영역. 제목은 모든 화면 크기에서 32px(heading-xl). */
export function PageHeader({ title, eyebrow, description, actions, className }: PageHeaderProps) {
  return (
    <header data-component="PageHeader" className={cx(styles.header, className)}>
      <div className={styles.titles}>
        {eyebrow && <p className={cx(styles.eyebrow, 'text-body-sm')}>{eyebrow}</p>}
        <h1 className="text-heading-xl">{title}</h1>
        {description && <p className={cx(styles.description, 'text-body-lg')}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
