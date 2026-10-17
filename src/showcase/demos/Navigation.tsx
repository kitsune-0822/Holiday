import {
  Bell,
  CalendarCheck,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { NavGroup, NavGroupItem, NavItem, Sidebar } from '@/components';
import styles from '../showcase.module.css';
import { Demo, DemoGrid, PropMap, Section, ToggleControl } from '../ui';

type MenuKey = 'alerts' | 'history' | 'approvals' | 'settings';

/** 사이드바 전체 예시. 쇼케이스와 반응형 미리보기에서 같이 쓴다. */
export function SidebarExample({ collapsed, onCollapsedChange }: { collapsed: boolean; onCollapsedChange?: (v: boolean) => void }) {
  const [current, setCurrent] = useState<MenuKey>('history');
  const item = (key: MenuKey) => ({ selected: current === key, onClick: () => setCurrent(key) });

  return (
    <Sidebar
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      primaryAction={{ label: '휴가 신청하기', icon: <Plus /> }}
      footer={
        <NavGroup>
          <NavGroupItem>
            <NavItem icon={<User />} label="내 정보" disabled />
          </NavGroupItem>
          <NavGroupItem>
            <NavItem icon={<Settings />} label="설정" {...item('settings')} />
          </NavGroupItem>
          <NavGroupItem>
            <NavItem icon={<LogOut />} label="로그아웃" tone="danger" />
          </NavGroupItem>
        </NavGroup>
      }
    >
      <NavGroup>
        <NavGroupItem>
          <NavItem icon={<Bell />} label="알림" count={4} {...item('alerts')} />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem icon={<LayoutDashboard />} label="대시보드" disabled />
        </NavGroupItem>
      </NavGroup>
      <NavGroup title="휴가">
        <NavGroupItem>
          <NavItem icon={<CalendarCheck />} label="휴가 현황" {...item('history')} />
        </NavGroupItem>
      </NavGroup>
      <NavGroup title="관리자 메뉴">
        <NavGroupItem>
          <NavItem icon={<ClipboardCheck />} label="결재 대기 신청" count={12} {...item('approvals')} />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem icon={<Users />} label="구성원 관리" disabled />
        </NavGroupItem>
      </NavGroup>
    </Sidebar>
  );
}

export function Navigation() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Section
      id="sidebar"
      title="NavItem · NavGroup · Sidebar"
      description="접힘 상태 하나로 헤더·버튼·메뉴가 같이 바뀝니다. 접힌 사이드바에 마우스를 올리거나 누르면 본문 위로 펼쳐지고, 벗어나면 다시 접힙니다. 펼쳐진 상태의 고정 버튼으로 계속 펼쳐 둘 수 있습니다."
    >
      <ToggleControl label="collapsed" checked={collapsed} onChange={setCollapsed} />
      <div className={styles.sidebarStage}>
        <SidebarExample collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <div className={styles.sidebarFill}>
          <p className="text-body-md" style={{ color: 'var(--semantic-color-text-secondary)' }}>
            메뉴를 눌러 선택 상태를, 선택된 메뉴에 마우스를 올려 선택+hover 상태를 확인해 보세요.
          </p>
        </div>
      </div>
      <DemoGrid>
        <Demo label="NavItem 상태">
          <div style={{ width: 'min(100%, 268px)', display: 'grid', gap: 'var(--semantic-spacing-2xs)' }}>
            <NavItem icon={<CalendarCheck />} label="기본" />
            <NavItem icon={<CalendarCheck />} label="선택됨" selected />
            <NavItem icon={<Bell />} label="알림 있음" count={4} />
            <NavItem icon={<Users />} label="disabled" disabled />
            <NavItem icon={<LogOut />} label="danger" tone="danger" />
          </div>
        </Demo>
        <Demo label="collapsed NavItem">
          <NavItem icon={<Bell />} label="알림" count={4} collapsed />
          <NavItem icon={<CalendarCheck />} label="휴가 현황" collapsed selected />
        </Demo>
      </DemoGrid>
      <PropMap
        rows={[
          ['헤더 state=maximized/minimized + 본문 isMinimized', 'Sidebar collapsed', '같은 개념을 하나로'],
          ['hasNotifications (+ 접힘에서는 값과 무관하게 점)', 'NavItem count', '펼침=숫자, 접힘=점. 같은 값으로 제어'],
          ['state + isDisabled + isSelected', 'selected · disabled (hover/pressed는 CSS)', '무의미한 조합 제거'],
          ['선택+hover = 선택보다 연한 색', 'bg.selected-hover (한 단계 진하게)', '선택 표시 유지'],
          ['메뉴 그룹 width 284 고정', '폭 100%', '사이드바 안쪽(268)을 넘치던 문제 해결'],
          ['(접힘 해제 버튼)', '마우스 올림·클릭 시 펼침', '접힌 상태에서는 버튼 없이 펼친다. 펼쳐진 동안 고정 버튼으로 계속 펼쳐 둘 수 있다'],
          ['hasTitle', 'NavGroup title?: string', '접히면 제목 대신 구분선'],
        ]}
      />
    </Section>
  );
}
