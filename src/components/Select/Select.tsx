import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import { Field, type FieldProps } from '../Field/Field';
import control from '../Field/control.module.css';

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'>,
    Pick<FieldProps, 'label' | 'hideLabel' | 'required' | 'description' | 'error'> {
  options: { value: string; label: string }[];
  /** 높이 sm 40 · lg 56(기본) */
  size?: 'sm' | 'lg';
  className?: string;
}

/** 브라우저 기본 select. 모바일에서 OS 선택기가 열린다. */
export function Select({ label, hideLabel, required, description, error, options, size = 'lg', disabled, className, ...rest }: SelectProps) {
  return (
    <Field data-component="Select" id={rest.id} label={label} hideLabel={hideLabel} required={required} description={description} error={error} className={className}>
      {(fieldProps) => (
        <div className={cx(control.box, size === 'sm' && control.sm, error ? control.invalid : undefined, disabled && control.disabled)}>
          <select className={cx(control.input, control.select, 'text-body-lg')} disabled={disabled} required={required} {...fieldProps} {...rest}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className={control.icon} aria-hidden="true" />
        </div>
      )}
    </Field>
  );
}
