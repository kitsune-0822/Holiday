import { cx } from '@/lib/cx';
import { LogoMark } from './LogoMark';
import styles from './Logo.module.css';

export interface LogoProps {
  /** 글자 크기: md(사이드바) · sm(모바일 상단 바). 마크는 어느 쪽이든 24px. */
  size?: 'sm' | 'md';
  /** 'Holiday' 글자 표시 */
  showName?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showName = true, className }: LogoProps) {
  return (
    <span data-component="Logo" className={cx(styles.logo, className)}>
      <LogoMark className={styles.mark} />
      {showName ? (
        <span className={cx(styles.name, size === 'md' ? 'text-heading-sm' : 'text-title-lg')}>Holiday</span>
      ) : (
        <span className="visually-hidden">Holiday</span>
      )}
    </span>
  );
}
