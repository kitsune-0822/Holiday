import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './ButtonGroup.module.css';

export interface ButtonGroupProps {
  /** horizontal: 같은 폭으로 나란히 / vertical: 위아래로 쌓기 */
  direction?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
}

export function ButtonGroup({ direction = 'horizontal', children, className }: ButtonGroupProps) {
  return <div className={cx(styles.group, styles[direction], className)}>{children}</div>;
}
