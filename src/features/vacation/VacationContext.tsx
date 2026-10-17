import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialAlerts, initialBalance, initialRequests } from '@/data/mock';
import { todayISO } from '@/lib/date';
import { decide, pendingDaysByType, type Decision } from './requests';
import type { Balance, VacationAlert, VacationRequest } from './types';

export type NewVacationRequest = Omit<VacationRequest, 'id' | 'requestedAt' | 'status'>;

interface VacationState {
  /** 승인된 휴가만 뺀 잔여 휴가 */
  balance: Balance;
  /** 결재를 기다리는 신청의 종류별 일수 (아직 잔여에서 빠지지 않음) */
  pendingDays: Balance;
  requests: VacationRequest[];
  alerts: VacationAlert[];
  unreadAlertCount: number;
  /** 대기 상태로 추가한다. 잔여 휴가는 승인될 때 차감된다. */
  submitRequest: (request: NewVacationRequest) => VacationRequest;
  /** 결재: 승인하면 잔여 휴가에서 차감하고, 반려하면 그대로 둔다. */
  decideRequest: (id: string, decision: Decision) => void;
  markAlertsRead: () => void;
}

const VacationContext = createContext<VacationState | null>(null);

/** 서버 연동 전까지 메모리에서 상태를 관리한다. */
export function VacationProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(initialBalance);
  const [requests, setRequests] = useState(initialRequests);
  const [alerts, setAlerts] = useState(initialAlerts);

  const submitRequest = useCallback(
    (input: NewVacationRequest) => {
      const created: VacationRequest = {
        ...input,
        // 기존 최댓값 + 1 (서버 연동 후에는 서버가 정한다)
        id: String(Math.max(0, ...requests.map((r) => Number(r.id))) + 1),
        requestedAt: todayISO(),
        status: 'pending',
      };
      setRequests((list) => [created, ...list]);
      return created;
    },
    [requests],
  );

  const decideRequest = useCallback(
    (id: string, decision: Decision) => {
      const result = decide(requests, balance, id, decision);
      setRequests(result.requests);
      setBalance(result.balance);
    },
    [requests, balance],
  );

  const markAlertsRead = useCallback(() => {
    setAlerts((list) => (list.some((a) => !a.read) ? list.map((a) => ({ ...a, read: true })) : list));
  }, []);

  const value = useMemo(
    () => ({
      balance,
      pendingDays: pendingDaysByType(requests),
      requests,
      alerts,
      unreadAlertCount: alerts.filter((a) => !a.read).length,
      submitRequest,
      decideRequest,
      markAlertsRead,
    }),
    [balance, requests, alerts, submitRequest, decideRequest, markAlertsRead],
  );

  return <VacationContext.Provider value={value}>{children}</VacationContext.Provider>;
}

export function useVacation() {
  const ctx = useContext(VacationContext);
  if (!ctx) throw new Error('useVacation은 VacationProvider 안에서 써야 합니다.');
  return ctx;
}
