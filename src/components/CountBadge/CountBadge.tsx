import { cx } from '@/lib/cx';
import styles from './CountBadge.module.css';

export interface CountBadgeProps {
  count: number;
  /** 이 값을 넘으면 `{max}+`로 줄여 보여준다. */
  max?: number;
  className?: string;
}

/** 알림 개수. 폭을 고정하지 않아 두 자리 이상도 넘치지 않는다. */
export function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  if (count <= 0) return null;
  const text = count > max ? `${max}+` : String(count);
  return (
    <span className={cx(styles.badge, 'text-label-sm', className)} aria-label={`${count}건`}>
      {text}
    </span>
  );
}
