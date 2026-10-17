import { Bell, Menu, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Dot, IconButton, Logo, Sidebar } from '@/components';
import { mobileQuery, tabletQuery, useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileDrawer } from './MobileDrawer';
import { useNavigationModel } from './useNavigationModel';
import styles from './AppShell.module.css';

const STORAGE_KEY = 'holiday.sidebar.collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 데스크탑(≥1280): 펼친 사이드바 (접기 상태 기억)
 * 태블릿(768–1279): 접힌 사이드바. 마우스를 올리거나 누르면 본문 위로 펼쳐진다.
 * 모바일(<768): 상단 바 + 왼쪽 드로어 메뉴
 */
export function AppShell() {
  const isMobile = useMediaQuery(mobileQuery);
  const isTablet = useMediaQuery(tabletQuery);
  const location = useLocation();
  const { primaryAction, menu, footer, sheetState, unreadAlertCount } = useNavigationModel();
  const [desktopCollapsed, setDesktopCollapsed] = useState(readCollapsed);
  const [tabletPinned, setTabletPinned] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 페이지를 옮기면 드로어를 닫는다
  useEffect(() => setDrawerOpen(false), [location.pathname, location.hash]);

  const collapsed = isTablet ? !tabletPinned : desktopCollapsed;
  const setCollapsed = (value: boolean) => {
    if (isTablet) setTabletPinned(!value);
    else {
      setDesktopCollapsed(value);
      try {
        localStorage.setItem(STORAGE_KEY, String(value));
      } catch {
        // 저장할 수 없는 환경이면 이번 방문 동안만 기억한다
      }
    }
  };

  return (
    <div className={styles.shell} data-sheet-background>
      <a className={styles.skip} href="#main">
        본문으로 건너뛰기
      </a>
      {isMobile ? (
        <>
          <header className={styles.topBar}>
            <IconButton variant="ghost" size="sm" label="메뉴 열기" icon={<Menu />} onClick={() => setDrawerOpen(true)} />
            <Link to="/vacations" className={styles.topLogo} aria-label="Holiday 홈">
              <Logo size="sm" />
            </Link>
            <div className={styles.topActions}>
              <IconButton variant="ghost" size="sm" label="휴가 신청하기" icon={<Plus />} onClick={primaryAction.onClick} />
              <Link
                to="/alerts"
                state={sheetState}
                className={styles.bell}
                aria-label={unreadAlertCount ? `알림, 읽지 않은 알림 ${unreadAlertCount}건` : '알림'}
              >
                <Bell aria-hidden="true" />
                {unreadAlertCount > 0 && <Dot className={styles.bellDot} />}
              </Link>
            </div>
          </header>
          <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Sidebar collapsed={false} primaryAction={primaryAction} footer={footer}>
              {menu}
            </Sidebar>
          </MobileDrawer>
        </>
      ) : (
        <div className={styles.sidebar}>
          <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} primaryAction={primaryAction} footer={footer}>
            {menu}
          </Sidebar>
        </div>
      )}
      <main id="main" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
