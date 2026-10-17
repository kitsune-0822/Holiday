import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Badge.module.css';

export type VacationStatus = 'pending' | 'approved' | 'rejected';

export const statusLabel: Record<VacationStatus, string> = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
};

export interface BadgeProps {
  /** Figma의 `type`. 의미 기반 이름으로 바꿨다. */
  status: VacationStatus;
  /** 기본값은 상태 이름(대기/승인/반려) */
  children?: ReactNode;
  className?: string;
}

/** 휴가 신청 상태 뱃지. 색만이 아니라 글자로도 상태를 알린다. */
export function Badge({ status, children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[status], 'text-label-sm', className)}>
      {children ?? statusLabel[status]}
    </span>
  );
}
