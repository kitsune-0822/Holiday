import type { Member, TeamLeave } from '@/features/approvals/types';
import { requestedDays } from '@/features/vacation/calc';
import type { DayPeriod, VacationType, VacationUnit } from '@/features/vacation/types';
import { addBusinessDaysISO, addDaysISO, mondayOf } from '@/lib/date';

/** 팀장(나)이 결재하는 팀원 목업. 날짜는 오늘을 기준으로 만든다. */
export const teamMembers: Member[] = [
  { id: 'm1', name: '김민준', role: '백엔드 엔지니어', granted: { annual: 15, sick: 10, comp: 2 }, used: { annual: 6, sick: 0, comp: 0 } },
  { id: 'm2', name: '이서연', role: '프로덕트 디자이너', granted: { annual: 15, sick: 10, comp: 0 }, used: { annual: 8.5, sick: 1, comp: 0 } },
  { id: 'm3', name: '박지호', role: '영업 매니저', granted: { annual: 17, sick: 10, comp: 1 }, used: { annual: 11, sick: 3, comp: 0 } },
  { id: 'm4', name: '최유나', role: '콘텐츠 마케터', granted: { annual: 15, sick: 10, comp: 0 }, used: { annual: 4, sick: 0, comp: 0 } },
  { id: 'm5', name: '정도윤', role: '프론트엔드 엔지니어', granted: { annual: 15, sick: 10, comp: 1 }, used: { annual: 9, sick: 0, comp: 0 } },
  { id: 'm6', name: '한지민', role: '고객 상담', granted: { annual: 16, sick: 10, comp: 3 }, used: { annual: 7, sick: 2, comp: 2 } },
  { id: 'm7', name: '강하준', role: '영업 담당', granted: { annual: 15, sick: 10, comp: 1 }, used: { annual: 10, sick: 0, comp: 0 } },
  { id: 'm8', name: '윤서준', role: 'iOS 엔지니어', granted: { annual: 15, sick: 10, comp: 0 }, used: { annual: 5.5, sick: 0, comp: 0 } },
  { id: 'm9', name: '임채원', role: 'UX 리서처', granted: { annual: 15, sick: 10, comp: 0 }, used: { annual: 12, sick: 1, comp: 0 } },
  { id: 'm10', name: '오태윤', role: '영업 팀장', granted: { annual: 20, sick: 10, comp: 2 }, used: { annual: 6, sick: 0, comp: 1 } },
  { id: 'm11', name: '서하은', role: '퍼포먼스 마케터', granted: { annual: 15, sick: 10, comp: 0 }, used: { annual: 3, sick: 2, comp: 0 } },
  { id: 'm12', name: '신우진', role: '고객 상담', granted: { annual: 15, sick: 10, comp: 1 }, used: { annual: 13.5, sick: 0, comp: 0 } },
  { id: 'm13', name: '조예린', role: 'QA 엔지니어', granted: { annual: 15, sick: 10, comp: 0 }, used: { annual: 7, sick: 0, comp: 0 } },
  { id: 'm14', name: '배준혁', role: '인사 담당', granted: { annual: 16, sick: 10, comp: 3 }, used: { annual: 5, sick: 0, comp: 0 } },
  { id: 'm15', name: '홍수아', role: 'CS 리드', granted: { annual: 18, sick: 10, comp: 1 }, used: { annual: 9, sick: 2, comp: 0 } },
];

export function createTeamLeaves(today: string): TeamLeave[] {
  // 평일 기준 오늘(T0)과 이번 주 월요일(W0)에서 떨어진 날
  const T = (n: number) => addBusinessDaysISO(today, n);
  const week = mondayOf(T(0));
  const W = (n: number) => addDaysISO(week, n);
  let seq = 0;
  const L = (
    memberId: string,
    type: VacationType,
    unit: VacationUnit,
    period: DayPeriod | null,
    startDate: string,
    endDate: string,
    reason: string,
    requestedAt: string,
    status: TeamLeave['status'],
  ): TeamLeave => ({
    id: `L${++seq}`,
    memberId,
    type,
    unit,
    period,
    startDate,
    endDate,
    days: requestedDays(startDate, endDate, unit),
    reason,
    requestedAt,
    status,
  });

  return [
    // 승인된 휴가
    L('m1', 'annual', 'full', null, T(0), T(1), '개인 일정', addDaysISO(today, -9), 'approved'),
    L('m2', 'annual', 'half', 'am', T(0), T(0), '병원 진료', addDaysISO(today, -3), 'approved'),
    L('m3', 'sick', 'full', null, T(-1), T(0), '독감', addDaysISO(today, -1), 'approved'),
    L('m4', 'annual', 'half', 'pm', T(0), T(0), '자녀 학교 행사', addDaysISO(today, -5), 'approved'),
    L('m5', 'annual', 'full', null, W(1), W(2), '이사', addDaysISO(today, -14), 'approved'),
    L('m6', 'comp', 'full', null, W(3), W(4), '주말 근무 대체', addDaysISO(today, -20), 'approved'),
    L('m7', 'annual', 'full', null, W(4), W(4), '여행', addDaysISO(today, -10), 'approved'),
    // 결재 대기
    L('m11', 'sick', 'full', null, T(0), T(0), '아침부터 고열이 있어 출근이 어렵습니다.', today, 'pending'),
    L('m9', 'annual', 'half', 'pm', T(1), T(1), '정기 검진 예약', addDaysISO(today, -2), 'pending'),
    L('m12', 'annual', 'full', null, T(2), T(2), '개인 용무', addDaysISO(today, -1), 'pending'),
    L('m15', 'annual', 'full', null, T(2), T(3), '가족 여행', addDaysISO(today, -4), 'pending'),
    L('m8', 'annual', 'full', null, T(3), T(5), '가족 여행 (제주)', addDaysISO(today, -1), 'pending'),
    L('m13', 'annual', 'quarter', 'am', T(4), T(4), '은행 업무', today, 'pending'),
    L('m14', 'comp', 'full', null, T(7), T(9), '주말 행사 지원 대체', today, 'pending'),
    L('m10', 'annual', 'full', null, T(10), T(14), '해외 출장 후 휴식', addDaysISO(today, -6), 'pending'),
  ];
}
