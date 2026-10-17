import { Calendar } from 'lucide-react';
import { useRef, type InputHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import { Field, type FieldProps } from '../Field/Field';
import control from '../Field/control.module.css';
import styles from './DateField.module.css';

export interface DateFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children' | 'type' | 'value' | 'onChange'>,
    Pick<FieldProps, 'label' | 'required' | 'description' | 'error'> {
  /** YYYY-MM-DD, 비어 있으면 '' */
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** 브라우저 기본 날짜 선택기를 쓴다. 모바일에서는 OS 휠·캘린더가 열린다. */
export function DateField({ label, required, description, error, disabled, value, onChange, className, ...rest }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const openPicker = () => {
    const input = inputRef.current;
    if (!input || disabled) return;
    try {
      input.showPicker();
    } catch {
      input.focus();
    }
  };

  return (
    <Field data-component="DateField" id={rest.id} label={label} required={required} description={description} error={error} className={className}>
      {(fieldProps) => (
        <div
          className={cx(control.box, error ? control.invalid : undefined, disabled && control.disabled)}
          onClick={openPicker}
        >
          <input
            ref={inputRef}
            type="date"
            className={cx(control.input, styles.input, !value && styles.empty, 'text-body-lg')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            {...fieldProps}
            {...rest}
          />
          <Calendar className={control.icon} aria-hidden="true" />
        </div>
      )}
    </Field>
  );
}
