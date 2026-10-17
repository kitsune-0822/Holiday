import { useId, type ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { cx } from '@/lib/cx';
import styles from './FilterGrid.module.css';

/** 검색 조건 표. 데스크탑은 Figma처럼 '라벨 칸 | 입력 칸'이 이어진 표, 모바일은 라벨 위·입력 아래로 쌓인다. */
export function FilterGrid({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const { m } = useI18n();
  return (
    <div data-component="FilterGrid" role="group" aria-label={label ?? m.components.filterGroup} className={cx(styles.grid, className)}>
      {children}
    </div>
  );
}

/** 데스크탑에서 한 줄에 놓일 필드 묶음. 좁아지면 필드가 한 줄에 하나씩 내려간다. */
export function FilterRow({ children }: { children: ReactNode }) {
  return <div data-component="FilterRow" className={styles.row}>{children}</div>;
}

export interface FilterFieldProps {
  label: string;
  /** label 요소를 쓸 수 없는 컨트롤(체크박스 묶음 등)은 false로 두고 컨트롤 안에서 이름을 준다. */
  htmlFor?: string;
  children: ReactNode;
}

export function FilterField({ label, htmlFor, children }: FilterFieldProps) {
  return (
    <div data-component="FilterField" className={styles.field}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={cx(styles.label, 'text-body-lg')}>
          {label}
        </label>
      ) : (
        <span className={cx(styles.label, 'text-body-lg')} aria-hidden="true">
          {label}
        </span>
      )}
      <div className={styles.control}>{children}</div>
    </div>
  );
}

/** 표 칸 안에 들어가는 테두리 없는 텍스트 입력 */
export function FilterTextInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { m } = useI18n();
  return (
    <input data-component="FilterTextInput"
      id={id}
      className={cx(styles.input, 'text-body-lg')}
      value={value}
      placeholder={placeholder ?? m.common.input}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export interface DateRange {
  from: string;
  to: string;
}

/** 'YYYY-MM-DD ~ YYYY-MM-DD' 기간 입력 */
export function FilterDateRange({ label, value, onChange }: { label: string; value: DateRange; onChange: (value: DateRange) => void }) {
  const id = useId();
  const { m } = useI18n();
  return (
    <div data-component="FilterDateRange" className={styles.range}>
      <input
        id={`${id}-from`}
        type="date"
        aria-label={m.components.rangeFrom(label)}
        className={cx(styles.input, styles.date, !value.from && styles.empty, 'text-body-lg')}
        value={value.from}
        max={value.to || undefined}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
      />
      <span className={styles.tilde} aria-hidden="true">
        ~
      </span>
      <input
        id={`${id}-to`}
        type="date"
        aria-label={m.components.rangeTo(label)}
        className={cx(styles.input, styles.date, !value.to && styles.empty, 'text-body-lg')}
        value={value.to}
        min={value.from || undefined}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
      />
    </div>
  );
}
