import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '@/app/App';
import { localeList } from '@/i18n';
import { pseudoString } from '@/i18n/pseudo';
import { buildRows, coverage } from './l10n';

beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-10-21T10:00:00+09:00'), shouldAdvanceTime: true });
  return () => vi.useRealTimers();
});

describe('다국어', () => {
  it('설정에서 언어를 바꾸면 화면과 html lang이 바뀌고, 다시 열어도 유지된다', async () => {
    window.history.pushState({}, '', '/settings');
    const { unmount } = render(<App />);
    expect(await screen.findByRole('heading', { name: '설정', level: 1 })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'English' }));
    expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en');
    expect(screen.getByText('Wednesday, October 21, 2026')).toBeInTheDocument();
    unmount();

    window.history.pushState({}, '', '/approvals');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Pending approvals', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve 신우진’s request' })).toBeInTheDocument();
  });

  it('모든 언어에 같은 메시지가 있다 (번역 누락 없음)', () => {
    const rows = buildRows();
    for (const l of localeList) expect(rows.every((r) => r.values[l] !== undefined)).toBe(true);
    expect(coverage(rows, 'ko').percent).toBe(100);
  });

  it('의사 번역은 글자를 늘리고 괄호로 감싼다', () => {
    expect(pseudoString('Save')).toBe('⟦Šáṽé··⟧');
  });
});

describe('포트폴리오 도구', () => {
  it('? 키로 열고, 이 페이지 소스·쇼케이스·저장소 링크를 보여준다', async () => {
    window.history.pushState({}, '', '/approvals');
    render(<App />);
    await screen.findByRole('heading', { name: '결재 대기 신청', level: 1 });
    await userEvent.keyboard('?');
    const panel = screen.getByRole('dialog', { name: '이 프로젝트에 대해' });
    expect(within(panel).getByRole('link', { name: /이 페이지 소스 보기/ })).toHaveAttribute(
      'href',
      'https://github.com/kitsune-0822/Holiday/blob/main/src/pages/Approvals/ApprovalsPage.tsx',
    );
    expect(within(panel).getByRole('link', { name: /컴포넌트 쇼케이스/ })).toHaveAttribute('href', '/showcase/');
    expect(within(panel).getByRole('link', { name: /GitHub 저장소/ })).toHaveAttribute('target', '_blank');
  });

  it('번역 관리에서 의사 번역을 켜면 화면 문구가 바뀐다', async () => {
    window.history.pushState({}, '', '/vacations');
    render(<App />);
    await screen.findByRole('heading', { name: '휴가 현황', level: 1 });
    await userEvent.click(screen.getByRole('button', { name: '포트폴리오 도구 열기' }));
    await userEvent.click(screen.getByRole('button', { name: '번역 관리' }));
    const sheet = await screen.findByRole('dialog', { name: '번역 관리' });
    await userEvent.click(within(sheet).getByLabelText('의사 번역 모드'));
    expect(screen.getByRole('heading', { level: 1, hidden: true })).toHaveTextContent('⟦휴가 현황');
  });

  it('설정에서 버튼을 끄면 떠 있는 버튼이 사라진다', async () => {
    window.history.pushState({}, '', '/settings');
    render(<App />);
    await screen.findByRole('heading', { name: '설정', level: 1 });
    expect(screen.getByRole('button', { name: '포트폴리오 도구 열기' })).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('포트폴리오 도구 버튼 보이기'));
    expect(screen.queryByRole('button', { name: '포트폴리오 도구 열기' })).not.toBeInTheDocument();
  });
});
