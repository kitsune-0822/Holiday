import { CircleCheck, CircleX, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './AlertItem.module.css';

export interface AlertItemProps {
  /** success: 승인 / danger: 반려 / info: 기타 안내 */
  tone: 'success' | 'danger' | 'info';
  title: ReactNode;
  message?: ReactNode;
  /** 화면에 보일 상대 시간 ('3시간 전') */
  time: string;
  /** 기계가 읽을 시각 (ISO 8601) */
  dateTime?: string;
}

const icons = { success: CircleCheck, danger: CircleX, info: Info };

export function AlertItem({ tone, title, message, time, dateTime }: AlertItemProps) {
  const Icon = icons[tone];
  return (
    <article data-component="AlertItem" className={styles.item}>
      <Icon className={cx(styles.icon, styles[tone])} aria-hidden="true" />
      <div className={styles.content}>
        <h3 className="text-title-xl">{title}</h3>
        {message && <p className={cx(styles.message, 'text-body-lg')}>{message}</p>}
      </div>
      <time className={cx(styles.time, 'text-body-lg')} dateTime={dateTime}>
        {time}
      </time>
    </article>
  );
}
