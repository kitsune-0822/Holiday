import { BrowserRouter, Navigate, Route, Routes, useLocation, type Location } from 'react-router';
import { ToastProvider } from '@/components';
import { ApprovalsProvider } from '@/features/approvals/ApprovalsContext';
import { LocalizationManager } from '@/features/tweaks/LocalizationManager';
import { GridOverlay, InspectOverlay } from '@/features/tweaks/Overlays';
import { TweaksProvider } from '@/features/tweaks/TweaksContext';
import { TweaksPanel } from '@/features/tweaks/TweaksPanel';
import { VacationProvider } from '@/features/vacation/VacationContext';
import { I18nProvider } from '@/i18n';
import { AppShell } from '@/layouts/AppShell/AppShell';
import type { SheetLocationState } from '@/layouts/AppShell/useNavigationModel';
import { AlertsSheet } from '@/pages/Alerts/AlertsSheet';
import { ApprovalsPage } from '@/pages/Approvals/ApprovalsPage';
import { ComingSoonPage } from '@/pages/ComingSoon/ComingSoonPage';
import { VacationRequestSheet } from '@/pages/VacationRequest/VacationRequestSheet';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
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
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<ComingSoonPage variant="notFound" />} />
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
      <I18nProvider>
        <ToastProvider>
          <TweaksProvider>
            <VacationProvider>
              <ApprovalsProvider>
                <AppRoutes />
                {/* 포트폴리오 도구 */}
                <TweaksPanel />
                <LocalizationManager />
                <InspectOverlay />
                <GridOverlay />
              </ApprovalsProvider>
            </VacationProvider>
          </TweaksProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
