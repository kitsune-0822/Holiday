import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Member, TeamLeave } from '@/features/approvals/types';
import { WeekTimeline } from './WeekTimeline';

const member: Member = {
  id: 'x',
  name: '김민준',
  role: '',
  granted: { annual: 15, sick: 10, comp: 0 },
  used: { annual: 0, sick: 0, comp: 0 },
};
const leave = (id: string, startDate: string, endDate: string, status: TeamLeave['status'] = 'approved'): TeamLeave => ({
  id,
  memberId: 'x',
  type: 'annual',
  unit: 'full',
  period: null,
  startDate,
  endDate,
  days: 1,
  reason: '',
  requestedAt: startDate,
  status,
});

describe('WeekTimeline', () => {
  it('주 밖으로 이어지는 휴가는 이 주 안에서만 그리고, 이어지는 쪽 모서리를 표시한다', () => {
    const { container } = render(
      <WeekTimeline weekStart="2026-10-19" today="2026-10-21" rows={[{ member, leaves: [leave('a', '2026-10-14', '2026-11-04')] }]} countOn={() => 0} onOpen={() => {}} />,
    );
    const bar = container.querySelector<HTMLElement>('[title^="김민준"]')!;
    expect(bar.style.gridColumn).toBe('1 / 15');
    expect(bar.className).toMatch(/continuesBefore/);
    expect(bar.className).toMatch(/continuesAfter/);
  });

  it('한 사람의 휴가가 겹치면 같은 칸에 포개지 않고 줄을 나눈다', () => {
    const { container } = render(
      <WeekTimeline
        weekStart="2026-10-19"
        today="2026-10-21"
        rows={[{ member, leaves: [leave('a', '2026-10-19', '2026-10-23'), leave('b', '2026-10-21', '2026-11-03', 'pending')] }]}
        countOn={() => 0}
        onOpen={() => {}}
      />,
    );
    const bars = [...container.querySelectorAll<HTMLElement>('[title^="김민준"]')];
    expect(bars.map((b) => b.style.gridRow)).toEqual(['1', '2']);
    expect(container.querySelector<HTMLElement>('[class*="track"]')!.style.gridTemplateRows).toContain('repeat(2');
  });
});
