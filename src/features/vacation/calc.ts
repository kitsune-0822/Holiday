import { unitDays, type Balance, type VacationType, type VacationUnit } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

function parse(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** 시작일~종료일(포함) 사이 평일 수. 날짜가 비었거나 순서가 뒤집히면 0. (공휴일은 아직 반영하지 않는다) */
export function countWeekdays(start: string, end: string): number {
  if (!start || !end || end < start) return 0;
  let count = 0;
  for (let t = parse(start).getTime(); t <= parse(end).getTime(); t += DAY_MS) {
    const day = new Date(t).getUTCDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

/** 신청으로 차감되는 일수 */
export function requestedDays(start: string, end: string, unit: VacationUnit): number {
  return countWeekdays(start, end) * unitDays[unit];
}

export function remainingAfter(balance: Balance, type: VacationType, days: number): Balance {
  return { ...balance, [type]: balance[type] - days };
}

/** 13.25 → '13.25일', 3 → '3일' */
export function formatDays(days: number): string {
  return `${Number(days.toFixed(2))}일`;
}

/** 'YYYY-MM-DD' 두 날짜의 차이(일) */
export function daysBetween(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / DAY_MS);
}

const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

/** '3시간 전', '어제' 같은 상대 시간 */
export function relativeTime(iso: string, now = new Date()): string {
  const diffSec = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return '방금 전';
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), 'day');
  return new Date(iso).toLocaleDateString('ko-KR');
}
