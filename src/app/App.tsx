import { BrowserRouter, Navigate, Route, Routes, useLocation, type Location } from 'react-router';
import { ToastProvider } from '@/components';
import { VacationProvider } from '@/features/vacation/VacationContext';
import { AppShell } from '@/layouts/AppShell/AppShell';
import type { SheetLocationState } from '@/layouts/AppShell/useNavigationModel';
import { AlertsSheet } from '@/pages/Alerts/AlertsSheet';
import { ComingSoonPage } from '@/pages/ComingSoon/ComingSoonPage';
import { VacationRequestSheet } from '@/pages/VacationRequest/VacationRequestSheet';
import { VacationStatusPage } from '@/pages/VacationStatus/VacationStatusPage';

/** 시트로 열리는 주소. 주소로 바로 들어와도 휴가 현황 위에 시트가 열린다. */
const SHEET_PATHS = ['/vacation-request', '/alerts'];

function AppRoutes() {
  const location = useLocation();
  const isSheet = SHEET_PATHS.includes(location.pathname);
  const background: Location | undefined =
    (location.state as SheetLocationState | null)?.background ??
    (isSheet ? { ...location, pathname: '/vacations', search: '', hash: '', state: null } : undefined);

  return (
    <>
      <Routes location={background ?? location}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/vacations" replace />} />
          <Route path="vacations" element={<VacationStatusPage />} />
          <Route path="approvals" element={<ComingSoonPage title="결재 대기 신청" />} />
          <Route path="settings" element={<ComingSoonPage title="설정" />} />
          <Route path="*" element={<ComingSoonPage title="페이지를 찾을 수 없어요" message="주소를 다시 확인해 주세요." />} />
        </Route>
      </Routes>
      {isSheet && (
        <Routes>
          <Route path="/vacation-request" element={<VacationRequestSheet />} />
          <Route path="/alerts" element={<AlertsSheet />} />
        </Routes>
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <VacationProvider>
          <AppRoutes />
        </VacationProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
