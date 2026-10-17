import { Check } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './SelectableCard.module.css';

export interface SelectableCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  isSelected: boolean;
  children?: ReactNode;
}

/** 선택 가능한 카드. 선택되면 2px 테두리와 체크 아이콘이 함께 나타난다. */
export function SelectableCard({ title, description, isSelected, children, className, ...rest }: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={cx(styles.card, isSelected && styles.selected, className)}
      {...rest}
    >
      <span className={styles.header}>
        <span className={styles.titles}>
          <span className="text-heading-md">{title}</span>
          {description && <span className={cx(styles.description, 'text-body-lg')}>{description}</span>}
        </span>
        {isSelected && <Check className={styles.check} aria-hidden="true" />}
      </span>
      {children}
    </button>
  );
}
