import { CircleAlert, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Callout.module.css';

export interface CalloutProps {
  tone?: 'info' | 'warning' | 'danger';
  children: ReactNode;
  className?: string;
}

const icons = { info: Info, warning: TriangleAlert, danger: CircleAlert };

/** 본문 안의 짧은 안내·주의 문구 */
export function Callout({ tone = 'info', children, className }: CalloutProps) {
  const Icon = icons[tone];
  return (
    <div data-component="Callout" className={cx(styles.callout, styles[tone], 'text-body-md', className)}>
      <Icon className={styles.icon} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
