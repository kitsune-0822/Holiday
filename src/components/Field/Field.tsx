import { CircleAlert } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useId, type ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Dot } from '../Dot/Dot';
import styles from './Field.module.css';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export interface FieldProps {
  /** 입력 요소의 id. 비우면 자동으로 만든다. */
  id?: string;
  /** Figma의 `hasTitle`. 값이 있으면 보인다. */
  label?: ReactNode;
  /** Figma의 `showRequiredBadge` */
  required?: boolean;
  /** 라벨을 화면에서 숨기고 스크린 리더에만 읽힌다 (검색창처럼 맥락이 분명할 때) */
  hideLabel?: boolean;
  /** Figma의 `hasCaption`. 오류가 없을 때 보이는 안내 문구. */
  description?: ReactNode;
  /** 값이 있으면 오류 상태(Figma `isInvalid`)가 되고 안내 문구를 대신한다. */
  error?: ReactNode;
  className?: string;
  /** 컴포넌트 검사 모드에 보일 이름 (TextField 등이 넘긴다) */
  'data-component'?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/** 라벨, 필수 표시, 안내/오류 문구를 입력 컨트롤과 접근성 속성으로 연결한다. */
export function Field({
  id: idProp,
  label,
  hideLabel,
  required,
  description,
  error,
  className,
  'data-component': component = 'Field',
  children,
}: FieldProps) {
  const generatedId = useId();
  const { m } = useI18n();
  const id = idProp ?? generatedId;
  const messageId = `${id}-message`;
  const message = error ?? description;

  return (
    <div data-component={component} className={cx(styles.field, className)}>
      {label && (
        <label htmlFor={id} className={cx(hideLabel ? 'visually-hidden' : styles.label, 'text-body-lg')}>
          {label}
          {required && (
            <>
              <Dot size="sm" tone="danger" />
              <span className="visually-hidden">{m.common.required}</span>
            </>
          )}
        </label>
      )}
      {children({
        id,
        'aria-describedby': message ? messageId : undefined,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}
      {message && (
        <p id={messageId} className={cx(styles.message, error ? styles.error : undefined, 'text-body-md')}>
          {error && <CircleAlert className={styles.errorIcon} aria-hidden="true" />}
          {message}
        </p>
      )}
    </div>
  );
}
