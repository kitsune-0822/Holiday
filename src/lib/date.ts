/** 로컬 시간대 기준 오늘 날짜 (YYYY-MM-DD) */
export function todayISO(now = new Date()): string {
  return toISO(now);
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** 0 = 일요일 */
export function weekdayOf(iso: string): number {
  return fromISO(iso).getDay();
}

export function isWeekend(iso: string): boolean {
  const w = weekdayOf(iso);
  return w === 0 || w === 6;
}

/** 그 날이 속한 주의 월요일 */
export function mondayOf(iso: string): string {
  return addDaysISO(iso, -((weekdayOf(iso) + 6) % 7));
}

/** 평일 기준으로 n일 뒤 (n이 음수면 앞). 시작일이 주말이면 다음 평일부터 센다. */
export function addBusinessDaysISO(iso: string, n: number): string {
  let d = iso;
  while (isWeekend(d)) d = addDaysISO(d, 1);
  const step = n < 0 ? -1 : 1;
  for (let left = Math.abs(n); left > 0; ) {
    d = addDaysISO(d, step);
    if (!isWeekend(d)) left -= 1;
  }
  return d;
}

// 요일·날짜 표기는 언어마다 달라서 i18n의 Formatters(f.monthDay, f.longDate)를 쓴다.
