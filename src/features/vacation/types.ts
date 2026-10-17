import type { VacationStatus } from '@/components';

export type VacationType = 'annual' | 'sick' | 'comp';
export type VacationUnit = 'full' | 'half' | 'quarter';
export type DayPeriod = 'am' | 'pm';

export const typeLabel: Record<VacationType, string> = { annual: '연차', sick: '병가', comp: '대휴' };
export const unitLabel: Record<VacationUnit, string> = { full: '종일', half: '반차', quarter: '반반차' };
export const periodLabel: Record<DayPeriod, string> = { am: '오전', pm: '오후' };
/** 하루 단위로 환산한 값 */
export const unitDays: Record<VacationUnit, number> = { full: 1, half: 0.5, quarter: 0.25 };

export const vacationTypes = Object.keys(typeLabel) as VacationType[];
export const vacationUnits = Object.keys(unitLabel) as VacationUnit[];
export const dayPeriods = Object.keys(periodLabel) as DayPeriod[];

export type Balance = Record<VacationType, number>;

export interface VacationRequest {
  id: string;
  type: VacationType;
  unit: VacationUnit;
  /** 종일이면 null */
  period: DayPeriod | null;
  /** YYYY-MM-DD */
  requestedAt: string;
  startDate: string;
  endDate: string;
  /** 차감 일수 */
  days: number;
  status: VacationStatus;
  reason: string;
}

export interface VacationAlert {
  id: string;
  tone: 'success' | 'danger' | 'info';
  title: string;
  message: string;
  /** ISO 8601 */
  createdAt: string;
  read: boolean;
}
