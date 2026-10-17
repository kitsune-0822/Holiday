import { describe, expect, it } from 'vitest';
import { countWeekdays, formatDays, relativeTime, remainingAfter, requestedDays } from './calc';

describe('휴가 일수 계산', () => {
  it('주말을 빼고 센다 (2026-10-19 월 ~ 10-25 일 → 5일)', () => {
    expect(countWeekdays('2026-10-19', '2026-10-25')).toBe(5);
  });
  it('하루, 주말 하루, 순서가 뒤집힌 경우', () => {
    expect(countWeekdays('2026-10-19', '2026-10-19')).toBe(1);
    expect(countWeekdays('2026-10-24', '2026-10-24')).toBe(0);
    expect(countWeekdays('2026-10-23', '2026-10-19')).toBe(0);
    expect(countWeekdays('', '2026-10-19')).toBe(0);
  });
  it('단위를 곱한다: 반차 0.5, 반반차 0.25', () => {
    expect(requestedDays('2026-10-19', '2026-10-21', 'full')).toBe(3);
    expect(requestedDays('2026-10-19', '2026-10-19', 'half')).toBe(0.5);
    expect(requestedDays('2026-10-19', '2026-10-19', 'quarter')).toBe(0.25);
  });
  it('선택한 종류만 차감한다', () => {
    expect(remainingAfter({ annual: 13.25, sick: 30, comp: 3 }, 'annual', 3)).toEqual({ annual: 10.25, sick: 30, comp: 3 });
  });
  it('일수 표기', () => {
    expect(formatDays(13.25)).toBe('13.25일');
    expect(formatDays(3)).toBe('3일');
    expect(formatDays(0.1 + 0.2)).toBe('0.3일');
  });
  it('상대 시간', () => {
    const now = new Date('2026-10-17T12:00:00+09:00');
    expect(relativeTime('2026-10-17T09:00:00+09:00', now)).toBe('3시간 전');
    expect(relativeTime('2026-10-16T12:00:00+09:00', now)).toBe('어제');
  });
});
