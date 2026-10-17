import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { VacationProvider, useVacation } from './VacationContext';

const wrapper = ({ children }: { children: ReactNode }) => <VacationProvider>{children}</VacationProvider>;

describe('결재 되돌리기', () => {
  it('결재한 신청만 되돌리고, 그사이 낸 신청과 읽음 처리는 남긴다', () => {
    const { result } = renderHook(() => useVacation(), { wrapper });
    const balance = result.current.balance;

    let undo = () => {};
    act(() => {
      undo = result.current.decideRequests(['3'], 'approved');
    });
    let created = { id: '' };
    act(() => {
      created = result.current.submitRequest({
        type: 'comp', unit: 'full', period: null, startDate: '2026-11-02', endDate: '2026-11-02', days: 1, reason: '',
      });
      result.current.markAlertsRead();
    });
    act(() => undo());

    expect(result.current.requests.find((r) => r.id === '3')?.status).toBe('pending');
    expect(result.current.requests.some((r) => r.id === created.id)).toBe(true);
    expect(result.current.balance).toEqual(balance);
    expect(result.current.unreadAlertCount).toBe(0);
  });
});
