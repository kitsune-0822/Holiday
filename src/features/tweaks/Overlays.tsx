import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';
import { componentSource, sourceUrl } from '@/site.config';
import { useTweaks } from './TweaksContext';
import styles from './Tweaks.module.css';

interface Target {
  name: string;
  rect: DOMRect;
}

/**
 * 컴포넌트 검사: 마우스 아래 가장 가까운 [data-component]의 테두리와 이름을 보여준다.
 * ⌥(Alt)+클릭하면 그 컴포넌트의 소스를 새 탭에서 연다. Esc로 끈다.
 */
export function InspectOverlay() {
  const { inspect, setInspect } = useTweaks();
  const { m } = useI18n();
  const [target, setTarget] = useState<Target | null>(null);

  useEffect(() => {
    if (!inspect) {
      setTarget(null);
      return;
    }
    const find = (el: EventTarget | null) => {
      const node = el instanceof Element ? el : null;
      if (!node || node.closest('[data-tweaks]')) return null;
      return node.closest<HTMLElement>('[data-component]');
    };
    const onMove = (e: PointerEvent) => {
      const el = find(e.target);
      setTarget(el ? { name: el.dataset.component!, rect: el.getBoundingClientRect() } : null);
    };
    const onClick = (e: MouseEvent) => {
      if (!e.altKey) return;
      const el = find(e.target);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      window.open(sourceUrl(componentSource(el.dataset.component!)), '_blank', 'noopener');
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setInspect(false);
    const clear = () => setTarget(null);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', clear, true);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', clear, true);
    };
  }, [inspect, setInspect]);

  if (!inspect || !target) return null;
  const { rect } = target;
  const labelBelow = rect.top < 28;
  return createPortal(
    <div className={styles.inspectLayer} aria-hidden="true">
      <div className={styles.inspectBox} style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      <div
        className={`${styles.inspectLabel} text-label-sm`}
        style={{ top: labelBelow ? rect.bottom + 4 : rect.top - 24, left: Math.max(4, rect.left) }}
      >
        {m.tweaks.inspectLabel(target.name)}
      </div>
    </div>,
    document.body,
  );
}

/** 4px 기준선 (16px마다 진하게) */
export function GridOverlay() {
  const { grid } = useTweaks();
  if (!grid) return null;
  return createPortal(<div className={styles.grid} aria-hidden="true" />, document.body);
}
