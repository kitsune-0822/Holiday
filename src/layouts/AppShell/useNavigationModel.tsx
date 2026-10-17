import {
  Bell,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { Link, useLocation, useNavigate, type Location } from 'react-router';
import { NavGroup, NavGroupItem, NavItem, useToast, type SidebarAction } from '@/components';
import { pendingApprovalCount } from '@/data/mock';
import { useVacation } from '@/features/vacation/VacationContext';

export interface SheetLocationState {
  /** 시트를 열 때 뒤에 깔려 있던 화면 */
  background?: Location;
}

/** 사이드바(데스크탑·태블릿)와 드로어(모바일)가 같이 쓰는 메뉴 */
export function useNavigationModel() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { unreadAlertCount } = useVacation();

  // 시트가 열려 있으면 뒤 화면 기준으로 선택 상태를 정한다
  const base = (location.state as SheetLocationState | null)?.background ?? location;
  const background = base;
  const sheetState: SheetLocationState = { background };

  const isStatus = base.pathname === '/vacations';
  const isBalance = isStatus && base.hash === '#balance';

  const primaryAction: SidebarAction = {
    label: '휴가 신청하기',
    icon: <Plus />,
    onClick: () => navigate('/vacation-request', { state: sheetState }),
  };

  const menu = (
    <>
      <NavGroup>
        <NavGroupItem>
          <NavItem as={Link} to="/alerts" state={sheetState} icon={<Bell />} label="알림" count={unreadAlertCount} />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem icon={<LayoutDashboard />} label="대시보드" disabled />
        </NavGroupItem>
      </NavGroup>
      <NavGroup title="휴가">
        <NavGroupItem>
          <NavItem as={Link} to="/vacations" icon={<CalendarCheck />} label="휴가 신청 내역" selected={isStatus && !isBalance} />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem as={Link} to="/vacations#balance" icon={<CalendarClock />} label="남은 휴가" selected={isBalance} />
        </NavGroupItem>
      </NavGroup>
      <NavGroup title="관리자 메뉴">
        <NavGroupItem>
          <NavItem
            as={Link}
            to="/approvals"
            icon={<ClipboardCheck />}
            label="결재 대기 신청"
            count={pendingApprovalCount}
            selected={base.pathname === '/approvals'}
          />
        </NavGroupItem>
        <NavGroupItem>
          <NavItem icon={<Users />} label="구성원 관리" disabled />
        </NavGroupItem>
      </NavGroup>
    </>
  );

  const footer = (
    <NavGroup>
      <NavGroupItem>
        <NavItem icon={<User />} label="내 정보" disabled />
      </NavGroupItem>
      <NavGroupItem>
        <NavItem as={Link} to="/settings" icon={<Settings />} label="설정" selected={base.pathname === '/settings'} />
      </NavGroupItem>
      <NavGroupItem>
        <NavItem
          icon={<LogOut />}
          label="로그아웃"
          tone="danger"
          onClick={() => toast({ tone: 'danger', message: '로그인 기능이 아직 연결되지 않았어요.' })}
        />
      </NavGroupItem>
    </NavGroup>
  );

  return { primaryAction, menu, footer, sheetState, unreadAlertCount };
}
