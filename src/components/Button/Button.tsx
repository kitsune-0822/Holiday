import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Button.module.css';

export type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: 주요 행동 / secondary: 브랜드 색 보조 / tertiary: 중립 보조 */
  hierarchy?: ButtonHierarchy;
  /** danger: 반려·삭제처럼 되돌리기 어려운 행동. primary는 빨간 배경, 나머지는 빨간 글자. */
  tone?: 'default' | 'danger';
  /** 높이 sm 40 · md 48 · lg 56 */
  size?: ButtonSize;
  /** 라벨 앞 아이콘 (24px) */
  icon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * 상태(hover/pressed/disabled)는 CSS 의사 클래스로만 표현한다.
 * pressed에서 크기를 줄이지 않고 배경색만 바꿔 폭이 변하지 않는다.
 * 아이콘만 있는 버튼은 IconButton을 쓴다.
 */
export function Button({
  hierarchy = 'primary',
  tone = 'default',
  size = 'md',
  icon,
  fullWidth = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button data-component="Button"
      type={type}
      className={cx(styles.button, styles[hierarchy], tone === 'danger' && styles.danger, styles[size], fullWidth && styles.fullWidth, className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="text-label-lg">{children}</span>
    </button>
  );
}
