import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './IconButton.module.css';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** 스크린 리더용 이름. 화면에 글자가 없으므로 필수. */
  label: string;
  icon: ReactNode;
  /** subtle: 회색 배경 / ghost: 배경 없음 / primary: 브랜드 배경 */
  variant?: 'subtle' | 'ghost' | 'primary';
  /** 정사각형 한 변 xs 32 · sm 40 · md 48 · lg 56 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function IconButton({
  label,
  icon,
  variant = 'subtle',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(styles.button, styles[variant], styles[size], className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
