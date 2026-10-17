import type { VacationStatus } from '@/components';

export type VacationType = 'annual' | 'sick' | 'comp';
export type VacationUnit = 'full' | 'half' | 'quarter';
export type DayPeriod = 'am' | 'pm';

/** 하루 단위로 환산한 값 (화면에 보일 이름은 i18n 메시지의 vacation.*) */
export const unitDays: Record<VacationUnit, number> = { full: 1, half: 0.5, quarter: 0.25 };

export const vacationTypes: VacationType[] = ['annual', 'sick', 'comp'];
export const vacationUnits: VacationUnit[] = ['full', 'half', 'quarter'];
export const dayPeriods: DayPeriod[] = ['am', 'pm'];

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
  /** 제목은 언어에 맞게 이 값들로 만든다 */
  decision: 'approved' | 'rejected';
  type: VacationType;
  startDate: string;
  endDate: string;
  /** 결재자가 남긴 말 (사용자가 쓴 글이라 번역하지 않는다) */
  message: string;
  /** ISO 8601 */
  createdAt: string;
  read: boolean;
}
