import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { currentUser } from '@/data/mock';
import { createTeamLeaves, teamMembers } from '@/data/team';
import { useVacation } from '@/features/vacation/VacationContext';
import { vacationTypes, type Balance, type VacationRequest } from '@/features/vacation/types';
import { todayISO } from '@/lib/date';
import { applyDecision, pendingSorted, type Decision, type DecisionResult } from './logic';
import type { Member, TeamLeave } from './types';

/** 내 신청은 팀 목록에서 이 접두어가 붙은 id로 쓴다 */
const MY_PREFIX = 'me-';
export const MY_MEMBER_ID = 'me';

function toTeamLeave(r: VacationRequest): TeamLeave {
  return {
    id: MY_PREFIX + r.id,
    memberId: MY_MEMBER_ID,
    type: r.type,
    unit: r.unit,
    period: r.period,
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason,
    requestedAt: r.requestedAt,
    status: r.status,
  };
}

interface ApprovalsState {
  today: string;
  members: Record<string, Member>;
  leaves: TeamLeave[];
  pending: TeamLeave[];
  /** 승인·반려하고, 되돌리는 함수를 돌려준다 */
  decide: (ids: string[], decision: Decision, rejectReason?: string) => () => void;
}

const ApprovalsContext = createContext<ApprovalsState | null>(null);

/**
 * 팀장(나)의 결재 상태. 팀원 신청과 내가 낸 신청(VacationContext)을 한 목록으로 합친다.
 * 내 신청을 결재하면 내 잔여 휴가·신청 내역·알림에 반영된다.
 */
export function ApprovalsProvider({ children, today = todayISO() }: { children: ReactNode; today?: string }) {
  const vacation = useVacation();
  const [team, setTeam] = useState<DecisionResult>(() => ({
    leaves: createTeamLeaves(today),
    members: Object.fromEntries(teamMembers.map((m) => [m.id, m])),
  }));

  const decide = useCallback(
    (ids: string[], decision: Decision, rejectReason?: string) => {
      const mine = ids.filter((id) => id.startsWith(MY_PREFIX)).map((id) => id.slice(MY_PREFIX.length));
      const others = ids.filter((id) => !id.startsWith(MY_PREFIX));
      let before: DecisionResult | null = null;
      if (others.length) {
        setTeam((s) => {
          before = s;
          return applyDecision(s, others, decision, rejectReason);
        });
      }
      const undoMine = mine.length ? vacation.decideRequests(mine, decision, rejectReason) : undefined;
      return () => {
        if (before) setTeam(before);
        undoMine?.();
      };
    },
    [vacation],
  );

  const value = useMemo(() => {
    // 사용량은 승인된 신청의 합, 부여일수는 잔여 + 사용량
    const used = Object.fromEntries(vacationTypes.map((t) => [t, 0])) as Balance;
    for (const r of vacation.requests) if (r.status === 'approved') used[r.type] += r.days;
    const granted = Object.fromEntries(vacationTypes.map((t) => [t, vacation.balance[t] + used[t]])) as Balance;
    const me: Member = { id: MY_MEMBER_ID, name: currentUser.name, role: currentUser.role, granted, used };
    const leaves = [...team.leaves, ...vacation.requests.map(toTeamLeave)];
    return { today, members: { ...team.members, [MY_MEMBER_ID]: me }, leaves, pending: pendingSorted(leaves), decide };
  }, [today, team, vacation.requests, vacation.balance, decide]);

  return <ApprovalsContext.Provider value={value}>{children}</ApprovalsContext.Provider>;
}

export function useApprovals() {
  const ctx = useContext(ApprovalsContext);
  if (!ctx) throw new Error('useApprovals는 ApprovalsProvider 안에서 써야 합니다.');
  return ctx;
}
