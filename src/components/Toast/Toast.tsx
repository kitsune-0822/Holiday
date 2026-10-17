import { CircleCheck, CircleX } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/lib/cx';
import styles from './Toast.module.css';

export interface ToastMessage {
  tone?: 'success' | 'danger';
  message: string;
}

type ShowToast = (toast: ToastMessage) => void;

const ToastContext = createContext<ShowToast | null>(null);

const DURATION_MS = 3000;

/** 화면 아래에 잠깐 뜨는 알림. 스크린 리더에는 바로 읽힌다(aria-live). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastMessage & { key: number }) | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ShowToast>((t) => {
    window.clearTimeout(timer.current);
    setToast({ ...t, key: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const Icon = toast?.tone === 'danger' ? CircleX : CircleCheck;
  return (
    <ToastContext.Provider value={show}>
      {children}
      {createPortal(
        <div className={styles.region} role="status" aria-live="polite">
          {toast && (
            <div key={toast.key} className={cx(styles.toast, 'text-body-lg')}>
              <Icon className={cx(styles.icon, styles[toast.tone ?? 'success'])} aria-hidden="true" />
              {toast.message}
            </div>
          )}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast는 ToastProvider 안에서 써야 합니다.');
  return show;
}
