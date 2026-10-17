import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createTeamLeaves, teamMembers } from '@/data/team';
import { todayISO } from '@/lib/date';
import { applyDecision, pendingSorted, type Decision, type DecisionResult } from './logic';
import type { Member, TeamLeave } from './types';

interface ApprovalsState {
  today: string;
  members: Record<string, Member>;
  leaves: TeamLeave[];
  pending: TeamLeave[];
  /** 승인·반려하고, 되돌리는 함수를 돌려준다 */
  decide: (ids: string[], decision: Decision, rejectReason?: string) => () => void;
}

const ApprovalsContext = createContext<ApprovalsState | null>(null);

/** 관리자 결재 상태. 서버 연동 전까지 메모리에 둔다. */
export function ApprovalsProvider({ children, today = todayISO() }: { children: ReactNode; today?: string }) {
  const [state, setState] = useState<DecisionResult>(() => ({
    leaves: createTeamLeaves(today),
    members: Object.fromEntries(teamMembers.map((m) => [m.id, m])),
  }));

  const decide = useCallback((ids: string[], decision: Decision, rejectReason?: string) => {
    let before: DecisionResult | null = null;
    setState((s) => {
      before = s;
      return applyDecision(s, ids, decision, rejectReason);
    });
    return () => {
      if (before) setState(before);
    };
  }, []);

  const value = useMemo(
    () => ({ today, members: state.members, leaves: state.leaves, pending: pendingSorted(state.leaves), decide }),
    [today, state, decide],
  );
  return <ApprovalsContext.Provider value={value}>{children}</ApprovalsContext.Provider>;
}

export function useApprovals() {
  const ctx = useContext(ApprovalsContext);
  if (!ctx) throw new Error('useApprovals는 ApprovalsProvider 안에서 써야 합니다.');
  return ctx;
}
