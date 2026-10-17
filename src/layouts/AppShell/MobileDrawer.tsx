import { X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@/components';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { lockBodyScroll } from '@/lib/scrollbars';
import styles from './MobileDrawer.module.css';

const EXIT_MS = 300;

/** 모바일 메뉴. 왼쪽에서 밀려 나오는 패널. */
export function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useFocusTrap(panelRef, mounted);
  useEffect(() => {
    if (mounted) return lockBodyScroll();
  }, [mounted]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className={styles.root} data-state={shown ? 'open' : 'closed'}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-label="메뉴" tabIndex={-1}>
        <IconButton className={styles.close} variant="ghost" size="xs" label="메뉴 닫기" icon={<X />} onClick={onClose} />
        {children}
      </div>
    </div>,
    document.body,
  );
}
