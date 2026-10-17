import { TreePalm } from 'lucide-react';
import { cx } from '@/lib/cx';
import styles from './Logo.module.css';

export interface LogoProps {
  /** sm 24px(접힌 사이드바, 모바일) · md 44px */
  size?: 'sm' | 'md';
  /** 'Holiday' 글자 표시 */
  showName?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showName = true, className }: LogoProps) {
  return (
    <span className={cx(styles.logo, styles[size], className)}>
      <TreePalm className={styles.mark} aria-hidden="true" strokeWidth={2.25} />
      {showName ? (
        <span className={cx(styles.name, size === 'md' ? 'text-heading-xl' : 'text-title-lg')}>Holiday</span>
      ) : (
        <span className="visually-hidden">Holiday</span>
      )}
    </span>
  );
}
