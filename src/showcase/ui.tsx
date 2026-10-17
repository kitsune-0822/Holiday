import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './showcase.module.css';

export function Section({ id, title, description, children }: { id: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.sectionHeader}>
        <h2 id={`${id}-title`} className="text-heading-lg">
          {title}
        </h2>
        {description && <p className={cx(styles.muted, 'text-body-lg')}>{description}</p>}
      </header>
      {children}
    </section>
  );
}

/** 한 가지 상태/변형을 보여주는 칸 */
export function Demo({ label, children, wide, className }: { label: string; children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <figure className={cx(styles.demo, wide && styles.wide, className)}>
      <div className={styles.demoStage}>{children}</div>
      <figcaption className={cx(styles.demoLabel, 'text-caption-md')}>{label}</figcaption>
    </figure>
  );
}

export function DemoGrid({ children, columns }: { children: ReactNode; columns?: number }) {
  return (
    <div className={styles.grid} style={columns ? { gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${Math.floor(960 / columns)}px), 1fr))` } : undefined}>
      {children}
    </div>
  );
}

/** 직접 조작해 보는 영역: 왼쪽 미리보기, 오른쪽 컨트롤 */
export function Playground({ preview, controls }: { preview: ReactNode; controls: ReactNode }) {
  return (
    <div className={styles.playground}>
      <div className={styles.playStage}>{preview}</div>
      <div className={styles.playControls}>{controls}</div>
    </div>
  );
}

export function Control({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={styles.control}>
      <span className="text-label-md">{label}</span>
      {children}
    </label>
  );
}

export function SelectControl<V extends string>({ label, value, options, onChange }: { label: string; value: V; options: readonly V[]; onChange: (v: V) => void }) {
  return (
    <Control label={label}>
      <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value as V)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Control>
  );
}

export function ToggleControl({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-label-md">{label}</span>
    </label>
  );
}

export function TextControl({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Control label={label}>
      <input className={styles.select} value={value} onChange={(e) => onChange(e.target.value)} />
    </Control>
  );
}

/** Figma property → React prop 대응표 */
export function PropMap({ rows }: { rows: Array<[figma: string, react: string, note?: string]> }) {
  return (
    <details className={styles.propMap}>
      <summary className="text-label-md">Figma property → React prop</summary>
      <table className="text-body-md">
        <thead>
          <tr>
            <th scope="col">Figma</th>
            <th scope="col">React</th>
            <th scope="col">변경 이유</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([figma, react, note]) => (
            <tr key={figma + react}>
              <td>
                <code>{figma}</code>
              </td>
              <td>
                <code>{react}</code>
              </td>
              <td>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
