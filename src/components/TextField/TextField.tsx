import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Field, type FieldProps } from '../Field/Field';
import control from '../Field/control.module.css';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'children'>,
    Pick<FieldProps, 'label' | 'required' | 'description' | 'error'> {
  /** 입력 상자 오른쪽 아이콘 */
  trailingIcon?: ReactNode;
  className?: string;
}

/**
 * 상태는 Figma의 boolean 4개 대신 실제 입력 상태에서 나온다.
 * focused → :focus-within, filled → value, invalid → error, disabled → disabled
 */
export function TextField({ label, required, description, error, trailingIcon, disabled, className, ...rest }: TextFieldProps) {
  return (
    <Field label={label} required={required} description={description} error={error} className={className}>
      {(fieldProps) => (
        <div className={cx(control.box, error ? control.invalid : undefined, disabled && control.disabled)}>
          <input className={cx(control.input, 'text-body-lg')} disabled={disabled} required={required} {...fieldProps} {...rest} />
          {trailingIcon && (
            <span className={control.icon} aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>
      )}
    </Field>
  );
}
