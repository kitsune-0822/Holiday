import { cx } from '@/lib/cx';
import styles from './Dot.module.css';

export interface DotProps {
  /** Figma의 `tone=red`를 의미 기반으로 바꿨다. */
  tone?: 'danger' | 'primary';
  /** sm 4px · md 8px */
  size?: 'sm' | 'md';
  /** 의미가 있는 점이면 읽을 이름을 준다. 장식이면 비워 둔다. */
  label?: string;
  className?: string;
}

export function Dot({ tone = 'danger', size = 'md', label, className }: DotProps) {
  return (
    <span
      className={cx(styles.dot, styles[tone], styles[size], className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
