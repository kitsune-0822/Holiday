import { useMemo, useState } from 'react';
import type { DateRange, VacationStatus } from '@/components';
import { dayPeriods, vacationTypes, vacationUnits, type DayPeriod, type VacationRequest, type VacationType, type VacationUnit } from '@/features/vacation/types';

export interface RequestFilters {
  id: string;
  types: VacationType[];
  units: VacationUnit[];
  periods: DayPeriod[];
  requestedAt: DateRange;
  startDate: DateRange;
  endDate: DateRange;
  statuses: VacationStatus[];
  reason: string;
}

const emptyRange: DateRange = { from: '', to: '' };
export const allStatuses: VacationStatus[] = ['approved', 'pending', 'rejected'];

export const defaultFilters: RequestFilters = {
  id: '',
  types: vacationTypes,
  units: vacationUnits,
  periods: dayPeriods,
  requestedAt: emptyRange,
  startDate: emptyRange,
  endDate: emptyRange,
  statuses: allStatuses,
  reason: '',
};

const inRange = (date: string, { from, to }: DateRange) => (!from || date >= from) && (!to || date <= to);

export function matches(r: VacationRequest, f: RequestFilters): boolean {
  return (
    (!f.id || r.id.includes(f.id.trim())) &&
    f.types.includes(r.type) &&
    f.units.includes(r.unit) &&
    // 종일은 시간대가 없으므로 시간대 조건에 걸리지 않는다
    (r.period === null || f.periods.includes(r.period)) &&
    inRange(r.requestedAt, f.requestedAt) &&
    inRange(r.startDate, f.startDate) &&
    inRange(r.endDate, f.endDate) &&
    f.statuses.includes(r.status) &&
    (!f.reason || r.reason.includes(f.reason.trim()))
  );
}

/** 기본값과 다른 조건 수 */
export function countActive(f: RequestFilters): number {
  const changedList = <T,>(a: T[], b: T[]) => a.length !== b.length;
  const changedRange = (r: DateRange) => Boolean(r.from || r.to);
  return [
    Boolean(f.id),
    changedList(f.types, defaultFilters.types),
    changedList(f.units, defaultFilters.units),
    changedList(f.periods, defaultFilters.periods),
    changedRange(f.requestedAt),
    changedRange(f.startDate),
    changedRange(f.endDate),
    changedList(f.statuses, defaultFilters.statuses),
    Boolean(f.reason),
  ].filter(Boolean).length;
}

export function useRequestFilters(requests: VacationRequest[]) {
  const [filters, setFilters] = useState(defaultFilters);
  const rows = useMemo(
    () => requests.filter((r) => matches(r, filters)).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt) || Number(b.id) - Number(a.id)),
    [requests, filters],
  );
  const update = <K extends keyof RequestFilters>(key: K) => (value: RequestFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  return { filters, rows, update, reset: () => setFilters(defaultFilters), activeCount: countActive(filters) };
}
