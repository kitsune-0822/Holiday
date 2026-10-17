import type { TextareaHTMLAttributes } from 'react';
import { cx } from '@/lib/cx';
import { Field, type FieldProps } from '../Field/Field';
import control from '../Field/control.module.css';

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'>,
    Pick<FieldProps, 'label' | 'required' | 'description' | 'error'> {
  className?: string;
}

export function TextArea({ label, required, description, error, disabled, rows = 4, className, ...rest }: TextAreaProps) {
  return (
    <Field label={label} required={required} description={description} error={error} className={className}>
      {(fieldProps) => (
        <div className={cx(control.box, control.textarea, error ? control.invalid : undefined, disabled && control.disabled)}>
          <textarea className={cx(control.input, 'text-body-lg')} rows={rows} disabled={disabled} required={required} {...fieldProps} {...rest} />
        </div>
      )}
    </Field>
  );
}
