import type { VacationStatus } from '@/components';
import type { DayPeriod, VacationType, VacationUnit } from '@/features/vacation/types';

export interface Member {
  id: string;
  name: string;
  dept: string;
  role: string;
  /** 올해 받은 연차 */
  granted: number;
  /** 승인되어 쓴 연차 */
  used: number;
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
