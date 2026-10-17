import { vacationTypes, type Balance, type VacationRequest } from './types';

export type Decision = 'approved' | 'rejected';

/** 결재 대기 중인 신청의 종류별 일수 합 */
export function pendingDaysByType(requests: VacationRequest[]): Balance {
  const sum = Object.fromEntries(vacationTypes.map((t) => [t, 0])) as Balance;
  for (const r of requests) if (r.status === 'pending') sum[r.type] += r.days;
  return sum;
}

/**
 * 대기 중인 신청을 승인·반려한다. 승인할 때만 잔여 휴가에서 차감한다.
 * 이미 결정된 신청이나 없는 ID는 바꾸지 않는다.
 */
export function decide(
  requests: VacationRequest[],
  balance: Balance,
  id: string,
  decision: Decision,
): { requests: VacationRequest[]; balance: Balance } {
  const target = requests.find((r) => r.id === id);
  if (!target || target.status !== 'pending') return { requests, balance };
  return {
    requests: requests.map((r) => (r.id === id ? { ...r, status: decision } : r)),
    balance: decision === 'approved' ? { ...balance, [target.type]: balance[target.type] - target.days } : balance,
  };
}
