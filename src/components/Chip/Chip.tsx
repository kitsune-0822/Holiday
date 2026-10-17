import { Check } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Chip.module.css';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma에 없던 선택 property를 추가했다. 선택되면 체크 아이콘이 붙는다. */
  isSelected: boolean;
  children: ReactNode;
}

export function Chip({ isSelected, children, className, ...rest }: ChipProps) {
  return (
    <button type="button" aria-pressed={isSelected} className={cx(styles.chip, isSelected && styles.selected, className)} {...rest}>
      {isSelected && <Check className={styles.icon} aria-hidden="true" />}
      <span className="text-body-lg">{children}</span>
    </button>
  );
}
