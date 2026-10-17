import { describe, expect, it } from 'vitest';
import { decide, overlaps, pendingDaysByType } from './requests';
import type { VacationRequest } from './types';

const base = { unit: 'full', period: null, requestedAt: '2026-10-16', startDate: '2026-11-02', endDate: '2026-11-04', reason: '' } as const;
const requests: VacationRequest[] = [
  { ...base, id: '1', type: 'annual', days: 3, status: 'pending' },
  { ...base, id: '2', type: 'annual', days: 0.5, status: 'pending' },
  { ...base, id: '3', type: 'sick', days: 2, status: 'approved' },
];
const balance = { annual: 13.25, sick: 30, comp: 3 };

describe('결재와 잔여 휴가', () => {
  it('대기 중인 일수만 종류별로 더한다', () => {
    expect(pendingDaysByType(requests)).toEqual({ annual: 3.5, sick: 0, comp: 0 });
  });

  it('승인하면 차감한다', () => {
    const r = decide(requests, balance, '1', 'approved');
    expect(r.balance.annual).toBe(10.25);
    expect(r.requests.find((x) => x.id === '1')?.status).toBe('approved');
  });

  it('반려하면 차감하지 않는다', () => {
    const r = decide(requests, balance, '1', 'rejected');
    expect(r.balance).toEqual(balance);
    expect(r.requests.find((x) => x.id === '1')?.status).toBe('rejected');
  });

  it('이미 결정된 신청은 다시 차감하지 않는다', () => {
    const r = decide(requests, balance, '3', 'approved');
    expect(r.balance).toEqual(balance);
    expect(r.requests).toBe(requests);
  });
});

describe('기간 겹침', () => {
  const day = (period: 'am' | 'pm' | null) => ({ startDate: '2026-10-28', endDate: '2026-10-28', period });

  it('같은 날 오전·오후 반차는 겹치지 않는다', () => {
    expect(overlaps(day('am'), day('pm'))).toBe(false);
  });

  it('같은 반나절이거나 종일이 끼면 겹친다', () => {
    expect(overlaps(day('pm'), day('pm'))).toBe(true);
    expect(overlaps(day(null), day('am'))).toBe(true);
  });

  it('날짜가 다르면 겹치지 않는다', () => {
    expect(overlaps(day(null), { startDate: '2026-10-29', endDate: '2026-10-30', period: null })).toBe(false);
  });
});
