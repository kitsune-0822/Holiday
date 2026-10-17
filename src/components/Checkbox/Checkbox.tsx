import { Check, Minus } from 'lucide-react';
import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: ReactNode;
  /** Figma의 `isSelected` */
  checked: boolean;
  /** 일부만 선택됨 (표의 전체 선택 칸) */
  indeterminate?: boolean;
  /** 라벨을 화면에서 숨긴다 (표 안의 선택 칸처럼 맥락이 분명할 때) */
  hideLabel?: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, indeterminate = false, hideLabel = false, onChange, disabled, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label data-component="Checkbox" className={cx(styles.checkbox, disabled && styles.disabled, className)} onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        type="checkbox"
        className="visually-hidden"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true">
        {indeterminate ? <Minus className={styles.mark} strokeWidth={3} /> : <Check className={styles.mark} strokeWidth={3} />}
      </span>
      <span className={cx(hideLabel && 'visually-hidden', 'text-body-lg')}>{label}</span>
    </label>
  );
}

export interface CheckboxGroupProps<V extends string> {
  legend: ReactNode;
  /** 화면에서 legend를 숨기고 스크린 리더에만 읽힌다 (표의 라벨 칸이 이미 있을 때) */
  hideLegend?: boolean;
  options: { value: V; label: ReactNode }[];
  value: V[];
  onChange: (value: V[]) => void;
  className?: string;
}

export function CheckboxGroup<V extends string>({ legend, hideLegend, options, value, onChange, className }: CheckboxGroupProps<V>) {
  const toggle = (v: V, on: boolean) => onChange(on ? [...value, v] : value.filter((x) => x !== v));
  return (
    <fieldset data-component="CheckboxGroup" className={cx(styles.group, className)}>
      <legend className={cx(hideLegend ? 'visually-hidden' : styles.legend, 'text-body-lg')}>{legend}</legend>
      <div className={styles.options}>
        {options.map((o) => (
          <Checkbox key={o.value} label={o.label} checked={value.includes(o.value)} onChange={(on) => toggle(o.value, on)} />
        ))}
      </div>
    </fieldset>
  );
}
