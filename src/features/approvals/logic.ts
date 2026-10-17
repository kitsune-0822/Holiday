import type { TagTone } from '@/components';
import { daysBetween } from '@/features/vacation/calc';
import type { Formatters, Messages } from '@/i18n';
import { addDaysISO, isWeekend, mondayOf } from '@/lib/date';
import type { Member, TeamLeave } from './types';

/** 이 일수 안에 시작하면 '급함'으로 표시한다 */
export const URGENT_WITHIN_DAYS = 2;

export type LeaveKind = 'annual' | 'half' | 'sick' | 'comp';

/** 화면에서 묶어 보는 종류: 반차·반반차는 종류와 상관없이 '반차'로 */
export function kindOf(l: TeamLeave): LeaveKind {
  if (l.unit !== 'full') return 'half';
  return l.type;
}

export const kindTone: Record<LeaveKind, TagTone> = { annual: 'primary', half: 'neutral', sick: 'danger', comp: 'success' };

/** '연차', '오전 반차', '오후 반반차', '병가' */
export function leaveLabel(l: TeamLeave, m: Messages): string {
  if (l.unit === 'full') return m.vacation.types[l.type];
  const unit = m.vacation.units[l.unit];
  return l.period ? m.vacation.partial(m.vacation.periods[l.period], unit) : unit;
}

/** 연차만 연차 잔여에서 차감한다 */
export function deductsAnnual(l: TeamLeave): boolean {
  return l.type === 'annual';
}

export function remainingOf(m: Member): number {
  return m.granted - m.used;
}

export function periodText(l: TeamLeave, m: Messages, f: Formatters): string {
  return l.startDate === l.endDate ? f.monthDay(l.startDate) : m.date.range(f.monthDay(l.startDate), f.monthDay(l.endDate));
}

export function startsInText(l: TeamLeave, today: string, m: Messages): string {
  const n = daysBetween(today, l.startDate);
  if (n < 0) return m.approvals.started;
  if (n === 0) return m.approvals.startsToday;
  if (n === 1) return m.approvals.startsTomorrow;
  return m.approvals.startsIn(n);
}

export function isUrgent(l: TeamLeave, today: string): boolean {
  return daysBetween(today, l.startDate) <= URGENT_WITHIN_DAYS;
}

export function requestedText(iso: string, today: string, m: Messages): string {
  const n = daysBetween(iso, today);
  return n <= 0 ? m.approvals.requestedToday : n === 1 ? m.approvals.requestedYesterday : m.approvals.requestedAgo(n);
}

const overlaps = (l: TeamLeave, from: string, to: string) => l.startDate <= to && l.endDate >= from;
export const covers = (l: TeamLeave, day: string) => l.startDate <= day && l.endDate >= day;

/** 결재 대기 목록: 시작일이 가까운 순, 같으면 먼저 신청한 순 */
export function pendingSorted(leaves: TeamLeave[]): TeamLeave[] {
  return leaves
    .filter((l) => l.status === 'pending')
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.requestedAt.localeCompare(b.requestedAt));
}

/** 같은 부서에서 기간이 겹치는 다른 휴가 (반려 제외) */
export function teamOverlaps(l: TeamLeave, leaves: TeamLeave[], members: Record<string, Member>): TeamLeave[] {
  const dept = members[l.memberId].dept;
  return leaves.filter(
    (o) => o.id !== l.id && o.status !== 'rejected' && members[o.memberId].dept === dept && overlaps(o, l.startDate, l.endDate),
  );
}

/** 오늘 승인된 휴가 중인 사람 */
export function onLeaveToday(leaves: TeamLeave[], today: string): TeamLeave[] {
  return leaves.filter((l) => l.status === 'approved' && covers(l, today));
}

/** 오늘 휴가자가 언제 돌아오는지 */
export function returnText(l: TeamLeave, today: string, m: Messages, f: Formatters): string {
  if (l.endDate === today) {
    if (l.unit !== 'full') return l.period === 'am' ? m.approvals.afternoonIn : m.approvals.afternoonOff;
    return m.approvals.returnTomorrow;
  }
  return m.approvals.returnOn(f.monthDay(addDaysISO(l.endDate, 1)));
}

/** 보여줄 주의 월요일. 주말에는 다가오는 주를 보여준다. */
export function focusWeekStart(today: string): { start: string; isNextWeek: boolean } {
  if (isWeekend(today)) return { start: mondayOf(addDaysISO(today, 2)), isNextWeek: true };
  return { start: mondayOf(today), isNextWeek: false };
}

export interface WeekRow {
  member: Member;
  leaves: TeamLeave[];
}

/** 그 주에 걸친 휴가(반려 제외)를 사람별로, 가장 먼저 시작하는 사람부터 */
export function weekRows(leaves: TeamLeave[], members: Record<string, Member>, weekStart: string): WeekRow[] {
  const weekEnd = addDaysISO(weekStart, 6);
  const byMember = new Map<string, TeamLeave[]>();
  for (const l of leaves) {
    if (l.status === 'rejected' || !overlaps(l, weekStart, weekEnd)) continue;
    byMember.set(l.memberId, [...(byMember.get(l.memberId) ?? []), l]);
  }
  return [...byMember.entries()]
    .map(([id, ls]) => ({ member: members[id], leaves: ls }))
    .sort((a, b) => minStart(a.leaves).localeCompare(minStart(b.leaves)));
}
const minStart = (ls: TeamLeave[]) => ls.map((l) => l.startDate).sort()[0];

export type Decision = 'approved' | 'rejected';

export interface DecisionResult {
  leaves: TeamLeave[];
  members: Record<string, Member>;
}

/**
 * 대기 중인 신청을 한꺼번에 승인·반려한다.
 * 승인한 연차만 사용량에 더하고, 이미 결정된 신청은 건너뛴다.
 */
export function applyDecision(
  state: DecisionResult,
  ids: string[],
  decision: Decision,
  rejectReason?: string,
): DecisionResult {
  const target = new Set(ids);
  const members = { ...state.members };
  const leaves = state.leaves.map((l) => {
    if (!target.has(l.id) || l.status !== 'pending') return l;
    if (decision === 'approved' && deductsAnnual(l)) {
      const m = members[l.memberId];
      members[l.memberId] = { ...m, used: m.used + l.days };
    }
    return { ...l, status: decision, rejectReason: decision === 'rejected' ? rejectReason : undefined };
  });
  return { leaves, members };
}

/** CSV (엑셀에서 한글이 깨지지 않도록 BOM을 붙인다) */
export function toCsv(rows: TeamLeave[], members: Record<string, Member>, m: Messages): string {
  const header = m.approvals.csv;
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = rows.map((l) => {
    const member = members[l.memberId];
    return [member.name, member.dept, leaveLabel(l, m), l.startDate, l.endDate, l.days, l.reason, l.requestedAt].map(esc).join(',');
  });
  return '﻿' + [header.map(esc).join(','), ...lines].join('\n');
}
