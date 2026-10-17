import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Dot } from '../Dot/Dot';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<V extends string> {
  value: V;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string> {
  label: ReactNode;
  required?: boolean;
  options: SegmentOption<V>[];
  /** 선택된 값. Figma의 `isActive`는 이 값과 같은지로 정해진다. */
  value: V | null;
  onChange: (value: V) => void;
  /** 그룹 전체 비활성 */
  disabled?: boolean;
  error?: ReactNode;
  className?: string;
}

/** 하나만 고르는 버튼 묶음. 내부는 radio라서 방향키로 움직이고 스크린 리더가 '라디오 n/m'으로 읽는다. */
export function SegmentedControl<V extends string>({
  label,
  required,
  options,
  value,
  onChange,
  disabled = false,
  error,
  className,
}: SegmentedControlProps<V>) {
  const name = useId();
  const errorId = `${name}-error`;
  return (
    <fieldset
      className={cx(styles.fieldset, className)}
      disabled={disabled}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className={cx(styles.legend, 'text-body-lg')}>
        {label}
        {required && (
          <>
            <Dot size="sm" tone="danger" />
            <span className="visually-hidden">(필수)</span>
          </>
        )}
      </legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value} className={cx(styles.option, option.disabled && styles.optionDisabled)}>
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <span className={cx(styles.segment, 'text-body-lg')}>{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={cx(styles.error, 'text-body-md')}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
