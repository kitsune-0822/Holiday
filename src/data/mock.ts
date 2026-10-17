import type { Balance, VacationAlert, VacationRequest } from '@/features/vacation/types';

/** 서버 연동 전 목업 데이터 */
export const currentUser = { name: '윤호' };

export const initialBalance: Balance = { annual: 13.25, sick: 30, comp: 3 };
/** 다음 지급일에 받을 휴가 */
export const upcomingGrant: Balance = { annual: 20, sick: 30, comp: 0 };
/** 관리자 메뉴: 결재를 기다리는 다른 사람의 신청 수 */
export const pendingApprovalCount = 4;

export const initialRequests: VacationRequest[] = [
  { id: '1', type: 'annual', unit: 'full', period: null, requestedAt: '2026-10-16', startDate: '2026-10-19', endDate: '2026-10-23', days: 5, status: 'approved', reason: '가족 여행' },
  { id: '2', type: 'annual', unit: 'full', period: null, requestedAt: '2026-10-15', startDate: '2026-10-26', endDate: '2026-10-26', days: 1, status: 'rejected', reason: '개인 일정' },
  { id: '3', type: 'annual', unit: 'half', period: 'pm', requestedAt: '2026-10-14', startDate: '2026-10-28', endDate: '2026-10-28', days: 0.5, status: 'pending', reason: '병원 진료' },
  { id: '4', type: 'comp', unit: 'full', period: null, requestedAt: '2026-10-12', startDate: '2026-10-30', endDate: '2026-10-30', days: 1, status: 'rejected', reason: '주말 근무 대체' },
  { id: '5', type: 'sick', unit: 'full', period: null, requestedAt: '2026-09-21', startDate: '2026-09-22', endDate: '2026-09-23', days: 2, status: 'approved', reason: '감기' },
  { id: '6', type: 'annual', unit: 'quarter', period: 'am', requestedAt: '2026-09-12', startDate: '2026-09-15', endDate: '2026-09-15', days: 0.25, status: 'approved', reason: '은행 업무' },
];

export const initialAlerts: VacationAlert[] = [
  {
    id: 'a1',
    tone: 'success',
    title: '10월 19일(월) ~ 10월 23일(금) 연차가 승인되었습니다.',
    message: '윤호님, 여행 잘 다녀오세요!',
    createdAt: '2026-10-17T09:00:00+09:00',
    read: false,
  },
  {
    id: 'a2',
    tone: 'danger',
    title: '10월 26일(월) 연차가 반려되었습니다.',
    message: '윤호님, 이 날은 반드시 부탁드리고 싶은 일이 있어요.',
    createdAt: '2026-10-17T09:00:00+09:00',
    read: false,
  },
  {
    id: 'a3',
    tone: 'danger',
    title: '10월 30일(금) 대휴가 반려되었습니다.',
    message: '대체할 근무일을 다시 확인해 주세요.',
    createdAt: '2026-10-15T14:00:00+09:00',
    read: false,
  },
  {
    id: 'a4',
    tone: 'success',
    title: '9월 22일(화) ~ 9월 23일(수) 병가가 승인되었습니다.',
    message: '푹 쉬고 오세요.',
    createdAt: '2026-09-21T16:00:00+09:00',
    read: true,
  },
];
