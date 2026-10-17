import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app/App';

beforeEach(() => {
  window.history.pushState({}, '', '/approvals');
  // 수요일로 고정
  vi.useFakeTimers({ now: new Date('2026-10-21T10:00:00+09:00'), shouldAdvanceTime: true });
  return () => vi.useRealTimers();
});

const navCount = () => within(screen.getByRole('link', { name: /결재 대기 신청/ })).getByText(/\d+/);

describe('결재 대기 신청', () => {
  it('승인하면 목록에서 빠지고, 되돌리기로 돌아온다', async () => {
    render(<App />);
    const table = await screen.findByRole('table', { name: '결재 대기 신청' });
    expect(within(table).getAllByRole('row')).toHaveLength(9); // 머리글 + 8건
    expect(navCount()).toHaveTextContent('8');

    await userEvent.click(within(table).getByRole('button', { name: '신우진 신청 승인' }));
    expect(await screen.findByText('신우진님 신청을 승인했어요.')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText('신우진')).not.toBeInTheDocument();
    expect(navCount()).toHaveTextContent('7');

    await userEvent.click(screen.getByRole('button', { name: '되돌리기' }));
    expect(within(screen.getByRole('table')).getByText('신우진')).toBeInTheDocument();
  });

  it('반려는 사유가 있어야 하고, 자주 쓰는 사유를 눌러 채울 수 있다', async () => {
    render(<App />);
    const table = await screen.findByRole('table', { name: '결재 대기 신청' });
    await userEvent.click(within(table).getByRole('button', { name: '홍수아 신청 반려' }));
    const dialog = await screen.findByRole('dialog', { name: '휴가 신청 반려' });
    await userEvent.click(within(dialog).getByRole('button', { name: '반려하기' }));
    expect(within(dialog).getByText('반려 사유를 입력해야 반려할 수 있어요.')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: '같은 기간 팀 인원 부족' }));
    expect(within(dialog).getByLabelText(/반려 사유/)).toHaveValue('같은 기간 팀 인원 부족');
    await userEvent.click(within(dialog).getByRole('button', { name: '반려하기' }));
    expect(await screen.findByText('홍수아님 신청을 반려했어요.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('여러 건을 골라 한 번에 승인한다', async () => {
    render(<App />);
    const table = await screen.findByRole('table', { name: '결재 대기 신청' });
    await userEvent.click(within(table).getByLabelText('신우진 신청 선택'));
    await userEvent.click(within(table).getByLabelText('윤서준 신청 선택'));
    expect(screen.getByText('2건 선택됨')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '선택 승인' }));
    expect(await screen.findByText(/외 1건을 승인했어요/)).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(7);
  });

  it('행을 누르면 상세가 열리고 같은 팀 일정을 보여준다', async () => {
    render(<App />);
    const table = await screen.findByRole('table', { name: '결재 대기 신청' });
    await userEvent.click(within(table).getByRole('button', { name: '윤서준 신청 상세 보기' }));
    const dialog = await screen.findByRole('dialog', { name: '휴가 신청 상세' });
    expect(within(dialog).getByText(/개발팀에서 \d명이 자리를 비워요/)).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: /15일 중 5.5일 사용, 이번 신청 3일/ })).toBeInTheDocument();
  });

  it('유형과 검색으로 거른다', async () => {
    render(<App />);
    await screen.findByRole('table', { name: '결재 대기 신청' });
    await userEvent.click(screen.getByRole('button', { name: /^병가/ }));
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: /^전체/ }));
    await userEvent.type(screen.getByRole('searchbox', { name: '이름 또는 사유 검색' }), '제주');
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
  });
});

describe('주간 휴가 일정', () => {
  it('크게 보기로 넓은 시트가 열리고, 다음 주로 넘겨 볼 수 있다', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: '이번 주 휴가자 크게 보기' }));
    const dialog = await screen.findByRole('dialog', { name: '주간 휴가 일정' });
    expect(dialog).toHaveAccessibleDescription(/10\/19\(월\) – 10\/25\(일\)/);
    await userEvent.click(within(dialog).getByRole('button', { name: '다음 주' }));
    expect(dialog).toHaveAccessibleDescription(/10\/26\(월\) – 11\/1\(일\)/);
    await userEvent.click(within(dialog).getByRole('button', { name: '오늘' }));
    expect(dialog).toHaveAccessibleDescription(/10\/19\(월\)/);
  });

  it('크게 본 상태에서 결재 대기 막대를 누르면 상세가 위에 열리고, Esc는 위의 시트만 닫는다', async () => {
    render(<App />);
    await userEvent.click(await screen.findByRole('button', { name: '이번 주 휴가자 크게 보기' }));
    const week = await screen.findByRole('dialog', { name: '주간 휴가 일정' });
    await userEvent.click(within(week).getByRole('button', { name: /신우진 · 연차 .* 상세 보기/ }));
    expect(await screen.findByRole('dialog', { name: '휴가 신청 상세' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: '휴가 신청 상세' })).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: '주간 휴가 일정' })).toBeInTheDocument();
  });
});
