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
  /**
   * 결재: 승인하면 잔여 휴가에서 차감하고, 반려하면 그대로 둔다.
   * 결과는 알림으로 남고, 돌려받은 함수를 부르면 이 결재만 되돌린다.
   */
  decideRequests: (ids: string[], decision: Decision, message?: string) => () => void;
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

  const decideRequests = useCallback(
    (ids: string[], decision: Decision, message = '') => {
      let next = { requests, balance };
      const decided: VacationRequest[] = [];
      for (const id of ids) {
        const target = next.requests.find((r) => r.id === id);
        if (!target || target.status !== 'pending') continue;
        next = decide(next.requests, next.balance, id, decision);
        decided.push(target);
      }
      const now = new Date().toISOString();
      const newAlerts: VacationAlert[] = decided.map((r) => ({
        id: `alert-${r.id}-${now}`,
        decision,
        type: r.type,
        startDate: r.startDate,
        endDate: r.endDate,
        message,
        createdAt: now,
        read: false,
      }));
      setRequests(next.requests);
      setBalance(next.balance);
      setAlerts((list) => [...newAlerts, ...list]);
      // 결재한 신청만 되돌린다 (그사이 생긴 신청·읽음 처리는 그대로 둔다)
      const decidedIds = new Set(decided.map((r) => r.id));
      const alertIds = new Set(newAlerts.map((a) => a.id));
      return () => {
        setRequests((list) => list.map((r) => (decidedIds.has(r.id) ? { ...r, status: 'pending' } : r)));
        if (decision === 'approved') {
          setBalance((b) => {
            const restored = { ...b };
            for (const r of decided) restored[r.type] += r.days;
            return restored;
          });
        }
        setAlerts((list) => list.filter((a) => !alertIds.has(a.id)));
      };
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
      decideRequests,
      markAlertsRead,
    }),
    [balance, requests, alerts, submitRequest, decideRequests, markAlertsRead],
  );

  return <VacationContext.Provider value={value}>{children}</VacationContext.Provider>;
}

export function useVacation() {
  const ctx = useContext(VacationContext);
  if (!ctx) throw new Error('useVacation은 VacationProvider 안에서 써야 합니다.');
  return ctx;
}
