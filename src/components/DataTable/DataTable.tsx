import type { CSSProperties, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import styles from './DataTable.module.css';

export interface DataTableColumn<R> {
  key: string;
  header: string;
  render: (row: R) => ReactNode;
  /** CSS 폭. 비우면 남은 폭을 나눠 갖는다. */
  width?: CSSProperties['width'];
  align?: 'start' | 'center';
}

export interface DataTableProps<R> {
  /** 표의 이름. 스크린 리더가 읽는다. */
  caption: string;
  columns: DataTableColumn<R>[];
  rows: R[];
  getRowKey: (row: R) => string;
  emptyMessage?: ReactNode;
  /** 모바일 카드의 제목으로 쓸 열. 나머지 열은 '라벨 · 값' 목록이 된다. */
  mobileTitleKey?: string;
  className?: string;
}

/**
 * 태블릿·데스크탑: 표 (넘치면 가로 스크롤)
 * 모바일: 행마다 카드 한 장
 */
export function DataTable<R>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = '표시할 내역이 없어요.',
  mobileTitleKey,
  className,
}: DataTableProps<R>) {
  const isMobile = useIsMobile();

  if (rows.length === 0) {
    return (
      <div className={cx(styles.empty, 'text-body-lg', className)} role="status">
        {emptyMessage}
      </div>
    );
  }

  if (isMobile) {
    const titleColumn = columns.find((c) => c.key === mobileTitleKey);
    const rest = columns.filter((c) => c !== titleColumn);
    return (
      <ul className={cx(styles.cards, className)} aria-label={caption}>
        {rows.map((row) => (
          <li key={getRowKey(row)} className={styles.card}>
            {titleColumn && <div className={cx(styles.cardTitle, 'text-title-md')}>{titleColumn.render(row)}</div>}
            <dl className={styles.cardList}>
              {rest.map((col) => (
                <div key={col.key} className={styles.cardRow}>
                  <dt className={cx(styles.cardLabel, 'text-body-md')}>{col.header}</dt>
                  <dd className="text-body-md">{col.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ScrollArea
      axis="x"
      className={cx(styles.scroll, className)}
      viewportProps={{ tabIndex: 0, role: 'region', 'aria-label': caption }}
    >
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cx(styles.th, styles[col.align ?? 'center'], 'text-body-lg')}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((col) => (
                <td key={col.key} className={cx(styles.td, styles[col.align ?? 'center'], 'text-body-lg')}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
