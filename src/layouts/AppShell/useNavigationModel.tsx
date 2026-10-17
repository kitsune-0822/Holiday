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
import { Link, useLocation, useNavigate, type Location } from 'react-router';
import {
  CalendarCheckFilled,
  ClipboardCheckFilled,
  NavGroup,
  NavGroupItem,
  NavItem,
  SettingsFilled,
  useToast,
  type SidebarAction,
} from '@/components';
import { useApprovals } from '@/features/approvals/ApprovalsContext';
import { useVacation } from '@/features/vacation/VacationContext';
import { useI18n } from '@/i18n';

export interface SheetLocationState {
  /** 시트를 열 때 뒤에 깔려 있던 화면 */
  background?: Location;
}

/** 사이드바(데스크탑·태블릿)와 드로어(모바일)가 같이 쓰는 메뉴 */
export function useNavigationModel() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { m } = useI18n();
  const n = m.nav;
  const { unreadAlertCount } = useVacation();
  const { pending } = useApprovals();

  // 시트가 열려 있으면 뒤 화면 기준으로 선택 상태를 정한다
  const base = (location.state as SheetLocationState | null)?.background ?? location;
  const background = base;
  const sheetState: SheetLocationState = { background };

  const isStatus = base.pathname === '/vacations';

  const primaryAction: SidebarAction = {
    label: n.request,
    icon: <Plus />,
    onClick: () => navigate('/vacation-request', { state: sheetState }),
  };

  const menu = (
    <>
      <NavGroup>
        <NavGroupItem>
          <NavItem as={Link} to="/alerts" state={sheetState} icon={<Bell />} label={n.alerts} count={unreadAlertCount} />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem icon={<LayoutDashboard />} label={n.dashboard} disabled />
        </NavGroupItem>
      </NavGroup>
      <NavGroup title={n.vacationGroup}>
        <NavGroupItem>
          <NavItem as={Link} to="/vacations" icon={<CalendarCheck />} selectedIcon={<CalendarCheckFilled />} label={n.status} selected={isStatus} />
        </NavGroupItem>
      </NavGroup>
      <NavGroup title={n.adminGroup}>
        <NavGroupItem>
          <NavItem
            as={Link}
            to="/approvals"
            icon={<ClipboardCheck />}
            selectedIcon={<ClipboardCheckFilled />}
            label={n.approvals}
            count={pending.length}
            selected={base.pathname === '/approvals'}
          />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem icon={<Users />} label={n.members} disabled />
        </NavGroupItem>
      </NavGroup>
    </>
  );

  const footer = (
    <NavGroup>
      <NavGroupItem>
        <NavItem icon={<User />} label={n.profile} disabled />
      </NavGroupItem>
      <NavGroupItem>
        <NavItem as={Link} to="/settings" icon={<Settings />} selectedIcon={<SettingsFilled />} label={n.settings} selected={base.pathname === '/settings'} />
      </NavGroupItem>
      <NavGroupItem>
        <NavItem
          icon={<LogOut />}
          label={n.logout}
          tone="danger"
          onClick={() => toast({ tone: 'danger', message: n.logoutUnavailable })}
        />
      </NavGroupItem>
    </NavGroup>
  );

  return { primaryAction, menu, footer, sheetState, unreadAlertCount };
}
