import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Figma의 `hasSubtitle`. 값이 있으면 보인다. */
  description?: ReactNode;
  /** 제목 오른쪽 영역 (버튼, 아이콘 등) */
  action?: ReactNode;
  /** 본문. Figma의 빈 76px frame 자리에 들어가는 slot. */
  children?: ReactNode;
  headingLevel?: 2 | 3;
}

/** 높이는 내용에 맞추고(min-height 200), 폭은 부모를 채운다. */
export function Card({ title, description, action, children, headingLevel = 2, className, ...rest }: CardProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <section data-component="Card" className={cx(styles.card, className)} {...rest}>
      {(title || action) && (
        <header className={styles.header}>
          <div className={styles.titles}>
            {title && <Heading className="text-heading-md">{title}</Heading>}
            {description && <p className={cx(styles.description, 'text-body-lg')}>{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
