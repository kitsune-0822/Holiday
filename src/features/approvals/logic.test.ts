import { describe, expect, it } from 'vitest';
import { createTeamLeaves, teamMembers } from '@/data/team';
import { createFormatters } from '@/i18n';
import { ko as m } from '@/i18n/messages/ko';
import { addBusinessDaysISO, mondayOf } from '@/lib/date';

const f = createFormatters(m);
import {
  applyDecision,
  focusWeekStart,
  leaveLabel,
  onLeaveToday,
  pendingSorted,
  returnText,
  startsInText,
  teamOverlaps,
  toCsv,
  weekRows,
} from './logic';

const today = '2026-10-21'; // 수요일
const members = Object.fromEntries(teamMembers.map((m) => [m.id, m]));
const leaves = createTeamLeaves(today);
const byMember = (id: string) => leaves.find((l) => l.memberId === id)!;

describe('날짜 도우미', () => {
  it('평일 기준 더하기와 그 주 월요일', () => {
    expect(addBusinessDaysISO('2026-10-23', 1)).toBe('2026-10-26'); // 금 → 월
    expect(addBusinessDaysISO('2026-10-26', -1)).toBe('2026-10-23');
    expect(addBusinessDaysISO('2026-10-18', 0)).toBe('2026-10-19'); // 일요일은 다음 평일부터
    expect(mondayOf('2026-10-21')).toBe('2026-10-19');
    expect(mondayOf('2026-10-25')).toBe('2026-10-19');
  });
  it('주말에는 다가오는 주를 보여준다', () => {
    expect(focusWeekStart('2026-10-21')).toEqual({ start: '2026-10-19', isNextWeek: false });
    expect(focusWeekStart('2026-10-24')).toEqual({ start: '2026-10-26', isNextWeek: true });
    expect(focusWeekStart('2026-10-25')).toEqual({ start: '2026-10-26', isNextWeek: true });
  });
});

describe('결재 목록', () => {
  it('대기 중인 신청만, 시작일이 가까운 순', () => {
    const list = pendingSorted(leaves);
    expect(list.every((l) => l.status === 'pending')).toBe(true);
    expect(list.map((l) => l.startDate)).toEqual([...list.map((l) => l.startDate)].sort());
    expect(list).toHaveLength(8);
  });

  it('같은 부서에서 겹치는 휴가만 찾는다', () => {
    const m8 = byMember('m8'); // 개발팀, T3~T5
    const names = teamOverlaps(m8, leaves, members).map((l) => members[l.memberId].name);
    expect(names).toContain('조예린'); // 개발팀 T4 반반차
    expect(names).not.toContain('홍수아'); // CS팀
  });

  it('표시 문구', () => {
    expect(leaveLabel(byMember('m13'), m)).toBe('오전 반반차');
    expect(leaveLabel(byMember('m11'), m)).toBe('병가');
    expect(startsInText(byMember('m11'), today, m)).toBe('오늘 시작');
    expect(startsInText(byMember('m9'), today, m)).toBe('내일 시작');
    expect(returnText(byMember('m2'), today, m, f)).toBe('오후 출근');
    expect(returnText(byMember('m1'), today, m, f)).toBe('10/23(금) 복귀');
  });

  it('오늘 휴가자와 주간 행', () => {
    expect(onLeaveToday(leaves, today).map((l) => l.memberId).sort()).toEqual(['m1', 'm2', 'm3', 'm4', 'm5']); // m5는 화~수 연차
    const rows = weekRows(leaves, members, '2026-10-19');
    expect(rows[0].member.id).toBe('m3'); // 어제 시작
  });
});

describe('승인·반려', () => {
  const state = { leaves, members };

  it('연차를 승인하면 사용량에 더한다', () => {
    const l = byMember('m12');
    const next = applyDecision(state, [l.id], 'approved');
    expect(next.leaves.find((x) => x.id === l.id)?.status).toBe('approved');
    expect(next.members.m12.used).toBe(members.m12.used + 1);
  });

  it('병가·대휴는 연차에서 빼지 않는다', () => {
    const next = applyDecision(state, [byMember('m11').id], 'approved');
    expect(next.members.m11.used).toBe(members.m11.used);
  });

  it('반려하면 사유를 남기고 사용량은 그대로', () => {
    const l = byMember('m15');
    const next = applyDecision(state, [l.id], 'rejected', '같은 기간 팀 인원 부족');
    expect(next.leaves.find((x) => x.id === l.id)).toMatchObject({ status: 'rejected', rejectReason: '같은 기간 팀 인원 부족' });
    expect(next.members.m15.used).toBe(members.m15.used);
  });

  it('이미 결정된 신청은 다시 바꾸지 않는다', () => {
    const approved = byMember('m1');
    const next = applyDecision(state, [approved.id], 'rejected', 'x');
    expect(next.leaves.find((x) => x.id === approved.id)?.status).toBe('approved');
  });

  it('CSV는 BOM과 머리글로 시작한다', () => {
    const csv = toCsv(pendingSorted(leaves).slice(0, 1), members, m);
    expect(csv.startsWith('﻿"신청자","부서"')).toBe(true);
    expect(csv.split('\n')).toHaveLength(2);
  });
});
