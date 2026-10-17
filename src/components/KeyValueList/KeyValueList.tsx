import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './KeyValueList.module.css';

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
}

export interface KeyValueListProps {
  items: KeyValueItem[];
  className?: string;
}

/** '연차 ··· 13.25일' 같은 좌우 정렬 목록 */
export function KeyValueList({ items, className }: KeyValueListProps) {
  return (
    <dl data-component="KeyValueList" className={cx(styles.list, className)}>
      {items.map((item, i) => (
        <div key={i} className={styles.row}>
          <dt className={cx(styles.label, 'text-body-list')}>{item.label}</dt>
          <dd className={cx(styles.value, 'text-body-list')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
