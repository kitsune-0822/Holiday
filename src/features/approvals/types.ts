import type { VacationStatus } from '@/components';
import type { Balance, DayPeriod, VacationType, VacationUnit } from '@/features/vacation/types';

export interface Member {
  id: string;
  name: string;
  role: string;
  /** 휴가 종류별로 올해 받은 일수 */
  granted: Balance;
  /** 휴가 종류별로 승인되어 쓴 일수 */
  used: Balance;
}

export interface TeamLeave {
  id: string;
  memberId: string;
  type: VacationType;
  unit: VacationUnit;
  period: DayPeriod | null;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  requestedAt: string;
  status: VacationStatus;
  rejectReason?: string;
}
