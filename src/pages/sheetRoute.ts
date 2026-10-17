import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { SheetLocationState } from '@/layouts/AppShell/useNavigationModel';

/**
 * 라우트로 열린 시트의 열림 상태.
 * 닫으면 애니메이션을 보여준 뒤(onExited) 이전 화면으로 돌아간다.
 */
export function useRouteSheet() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasBackground = Boolean((location.state as SheetLocationState | null)?.background);

  const onClose = useCallback(() => setOpen(false), []);
  const onExited = useCallback(() => {
    if (hasBackground) navigate(-1);
    else navigate('/vacations', { replace: true });
  }, [hasBackground, navigate]);

  return { open, onClose, onExited };
}
