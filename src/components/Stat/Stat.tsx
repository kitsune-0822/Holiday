import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Stat.module.css';

export interface StatItem {
  label: ReactNode;
  value: ReactNode;
}

export interface StatGroupProps {
  items: StatItem[];
  className?: string;
}

/** 요약 카드의 '라벨 / 숫자' 묶음. 항목은 같은 폭으로 나란히 놓인다. */
export function StatGroup({ items, className }: StatGroupProps) {
  return (
    <dl className={cx(styles.group, className)}>
      {items.map((item, i) => (
        <div key={i} className={styles.item}>
          <dt className={cx(styles.label, 'text-body-lg')}>{item.label}</dt>
          <dd className="text-numeric-lg">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
