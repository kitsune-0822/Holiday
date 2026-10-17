import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'holiday.tweaks.visible';

interface TweaksState {
  /** 오른쪽 아래 버튼 표시 (설정에서 끌 수 있다) */
  buttonVisible: boolean;
  setButtonVisible: (v: boolean) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  /** 컴포넌트 검사 모드 */
  inspect: boolean;
  setInspect: (v: boolean) => void;
  /** 4px 그리드 겹쳐 보기 */
  grid: boolean;
  setGrid: (v: boolean) => void;
  /** 번역 관리 창 */
  l10nOpen: boolean;
  setL10nOpen: (v: boolean) => void;
}

const TweaksContext = createContext<TweaksState | null>(null);

function readVisible() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [buttonVisible, setVisibleState] = useState(readVisible);
  const [open, setOpen] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [grid, setGrid] = useState(false);
  const [l10nOpen, setL10nOpen] = useState(false);

  const setButtonVisible = useCallback((v: boolean) => {
    setVisibleState(v);
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      // 이번 방문 동안만 유지
    }
  }, []);

  // '?' 키로 열고 닫는다 (입력 중에는 무시)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === '?') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(
    () => ({ buttonVisible, setButtonVisible, open, setOpen, inspect, setInspect, grid, setGrid, l10nOpen, setL10nOpen }),
    [buttonVisible, setButtonVisible, open, inspect, grid, l10nOpen],
  );
  return <TweaksContext.Provider value={value}>{children}</TweaksContext.Provider>;
}

export function useTweaks() {
  const ctx = useContext(TweaksContext);
  if (!ctx) throw new Error('useTweaks는 TweaksProvider 안에서 써야 합니다.');
  return ctx;
}
