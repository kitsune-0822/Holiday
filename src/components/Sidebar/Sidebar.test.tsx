import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell, Plus } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { NavGroup, NavGroupItem, NavItem, Sidebar } from '..';

function setup(onSelect = vi.fn()) {
  render(
    <>
      <Sidebar collapsed onCollapsedChange={() => {}} primaryAction={{ label: '휴가 신청하기', icon: <Plus /> }}>
        <NavGroup title="휴가">
          <NavGroupItem>
            <NavItem icon={<Bell />} label="알림" count={4} onClick={onSelect} />
          </NavGroupItem>
        </NavGroup>
      </Sidebar>
      <button>바깥</button>
    </>,
  );
  return { aside: screen.getByRole('complementary', { name: '주 메뉴' }), onSelect };
}

describe('Sidebar (collapsed)', () => {
  it('접혀 보일 때는 펼치기 버튼이 없다', () => {
    setup();
    expect(screen.queryByRole('button', { name: /고정|펼치기/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '휴가 신청하기' })).toHaveClass('sm');
  });

  it('마우스를 올리면 펼쳐지고 벗어나면 접힌다', () => {
    const { aside } = setup();
    fireEvent.pointerEnter(aside, { pointerType: 'mouse' });
    expect(screen.getByText('알림')).not.toHaveClass('visually-hidden');
    expect(screen.getByRole('button', { name: '메뉴 펼친 채로 고정' })).toBeInTheDocument();
    fireEvent.pointerLeave(aside, { pointerType: 'mouse' });
    expect(screen.queryByRole('button', { name: '메뉴 펼친 채로 고정' })).not.toBeInTheDocument();
  });

  it('터치 첫 탭은 펼치기만 하고 메뉴를 실행하지 않는다. 바깥을 누르면 접힌다', async () => {
    const { onSelect } = setup();
    const item = screen.getByRole('button', { name: /알림/ });
    fireEvent.pointerDown(item, { pointerType: 'touch' });
    fireEvent.click(item);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '메뉴 펼친 채로 고정' })).toBeInTheDocument();
    fireEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByText('바깥'));
  });
});
