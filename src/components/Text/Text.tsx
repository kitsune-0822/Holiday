import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cx } from '@/lib/cx';
import type { TypographyVariant } from '@/styles/tokens';
import styles from './Text.module.css';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'brand'
  | 'danger'
  | 'success'
  | 'inherit';

type TextProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  tone?: TextTone;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/** 타이포그래피 토큰(semantic.typography)을 적용하는 텍스트. */
export function Text<T extends ElementType = 'span'>({
  as,
  variant = 'body-lg',
  tone = 'inherit',
  className,
  ...rest
}: TextProps<T>) {
  const Component: ElementType = as ?? 'span';
  return <Component className={cx(`text-${variant}`, styles[tone], className)} {...rest} />;
}
