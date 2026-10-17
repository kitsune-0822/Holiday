import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Bell } from 'lucide-react';
import { setViewport } from '@/test/setup';
import { CountBadge, DataTable, NavItem, SegmentedControl, Sheet, TextField } from '.';

afterEach(() => setViewport(1280));

describe('CountBadge', () => {
  it('99를 넘으면 99+로 줄이고, 0이면 그리지 않는다', () => {
    const { rerender, container } = render(<CountBadge count={120} />);
    expect(screen.getByText('99+')).toHaveAccessibleName('120건');
    rerender(<CountBadge count={0} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('NavItem', () => {
  it('펼침에서는 숫자, 접힘에서는 점으로 같은 count를 보여준다', () => {
    const { rerender } = render(<NavItem icon={<Bell />} label="알림" count={4} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    rerender(<NavItem icon={<Bell />} label="알림" count={4} collapsed />);
    expect(screen.queryByText('4')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '알림, 새 항목 4건' })).toBeInTheDocument();
  });

  it('count가 0이면 접혀도 점이 없다', () => {
    const { container } = render(<NavItem icon={<Bell />} label="알림" collapsed />);
    expect(container.querySelector('.dot')).toBeNull();
  });
});

describe('TextField', () => {
  it('오류 문구를 입력과 연결하고 aria-invalid를 건다', () => {
    render(<TextField label="사유" error="사유를 입력해 주세요." />);
    const input = screen.getByLabelText('사유');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('사유를 입력해 주세요.');
  });
});

describe('SegmentedControl', () => {
  function Demo({ disabled = false }) {
    const [value, setValue] = useState<'full' | 'half'>('full');
    return (
      <SegmentedControl
        label="휴가 단위"
        value={value}
        onChange={setValue}
        disabled={disabled}
        options={[
          { value: 'full', label: '종일' },
          { value: 'half', label: '반차' },
        ]}
      />
    );
  }

  it('하나만 선택된다', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('반차'));
    expect(screen.getByRole('radio', { name: '반차' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '종일' })).not.toBeChecked();
  });

  it('비활성 그룹은 바꿀 수 없다', async () => {
    render(<Demo disabled />);
    await userEvent.click(screen.getByText('반차'));
    expect(screen.getByRole('radio', { name: '종일' })).toBeChecked();
  });
});

describe('Sheet', () => {
  function Demo({ onClose = () => {} }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>열기</button>
        <Sheet
          open={open}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
          title="휴가 신청하기"
          description="설명"
          footer={<button>신청</button>}
        >
          <input aria-label="사유" />
        </Sheet>
      </>
    );
  }

  it('열리면 이름 있는 모달 다이얼로그가 되고, Esc로 닫으면 여는 버튼으로 포커스가 돌아온다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const onClose = vi.fn();
    render(<Demo onClose={onClose} />);
    const opener = screen.getByText('열기');
    await userEvent.click(opener);

    const dialog = screen.getByRole('dialog', { name: '휴가 신청하기' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('설명');
    expect(dialog).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    vi.useRealTimers();
  });

  it('Tab 포커스가 시트 밖으로 나가지 않는다', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByText('열기'));
    const close = screen.getByRole('button', { name: '닫기' });
    const submit = screen.getByRole('button', { name: '신청' });
    close.focus();
    await userEvent.tab({ shift: true });
    expect(submit).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
  });

  it('모바일에서는 손잡이가 있는 bottom sheet로 그린다', async () => {
    setViewport(390);
    render(<Demo />);
    await userEvent.click(screen.getByText('열기'));
    const root = screen.getByRole('dialog').parentElement!;
    expect(root.className).toContain('mobile');
    expect(root.querySelector('.grabber')).not.toBeNull();
  });
});

describe('DataTable', () => {
  const columns = [
    { key: 'type', header: '휴가 유형', render: (r: { id: string; type: string }) => r.type },
    { key: 'id', header: 'ID', render: (r: { id: string; type: string }) => r.id },
  ];
  const rows = [{ id: '1', type: '연차' }];

  it('데스크탑은 표, 모바일은 카드 목록', () => {
    const { rerender } = render(<DataTable caption="내역" columns={columns} rows={rows} getRowKey={(r) => r.id} mobileTitleKey="type" />);
    expect(screen.getByRole('table', { name: '내역' })).toBeInTheDocument();
    act(() => setViewport(390));
    rerender(<DataTable caption="내역" columns={columns} rows={rows} getRowKey={(r) => r.id} mobileTitleKey="type" />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: '내역' })).toBeInTheDocument();
  });

  it('행이 없으면 안내 문구를 보여준다', () => {
    render(<DataTable caption="내역" columns={columns} rows={[]} getRowKey={(r) => r.id} emptyMessage="없어요" />);
    expect(screen.getByRole('status')).toHaveTextContent('없어요');
  });
});
