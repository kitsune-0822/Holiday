import type { VacationStatus } from '@/components';

export interface SampleRequest {
  id: string;
  type: '연차' | '병가' | '대휴';
  unit: '종일' | '반차' | '반반차';
  period: '오전' | '오후' | '-';
  requestedAt: string;
  startDate: string;
  endDate: string;
  status: VacationStatus;
  reason: string;
}

export const sampleRequests: SampleRequest[] = [
  { id: '1', type: '연차', unit: '종일', period: '-', requestedAt: '2026-09-12', startDate: '2026-09-21', endDate: '2026-09-23', status: 'pending', reason: '가족 행사' },
  { id: '2', type: '연차', unit: '반차', period: '오후', requestedAt: '2026-09-10', startDate: '2026-09-15', endDate: '2026-09-15', status: 'approved', reason: '병원 진료' },
  { id: '3', type: '대휴', unit: '종일', period: '-', requestedAt: '2026-09-08', startDate: '2026-09-11', endDate: '2026-09-11', status: 'rejected', reason: '주말 근무 대체' },
];
