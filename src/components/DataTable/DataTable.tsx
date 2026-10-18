import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { useI18n } from '@/i18n';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { Checkbox } from '../Checkbox/Checkbox';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import styles from './DataTable.module.css';

export interface DataTableColumn<R> {
  key: string;
  header: string;
  render: (row: R) => ReactNode;
  /** CSS 폭. 비우면 남은 폭을 나눠 갖는다. */
  width?: CSSProperties['width'];
  align?: 'start' | 'center' | 'end';
  /** 모바일 카드에서 hidden: 숨김 / full: 라벨 없이 한 줄 전체 (버튼 묶음 등) */
  mobile?: 'hidden' | 'full';
  /** 가로로 스크롤해도 오른쪽 끝에 붙어 보이게 한다 (결재 버튼처럼 늘 보여야 하는 열) */
  sticky?: boolean;
}

export interface DataTableSelection<R> {
  selectedKeys: Set<string>;
  onSelectedKeysChange: (keys: Set<string>) => void;
  /** 선택 칸의 스크린 리더 이름 (예: '김민준 신청 선택') */
  getRowLabel: (row: R) => string;
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
  /** 행 선택 칸을 붙인다 */
  selection?: DataTableSelection<R>;
  /**
   * 행을 눌렀을 때 (상세 보기 등). 마우스 편의 기능이므로
   * 키보드 사용자를 위해 같은 행동을 하는 버튼을 열 안에도 둔다.
   */
  onRowClick?: (row: R) => void;
  className?: string;
}

/** 버튼·링크·입력 위에서 누른 것은 행 클릭으로 치지 않는다 */
function fromInteractive(e: MouseEvent) {
  return Boolean((e.target as HTMLElement).closest('button, a, input, label, select, textarea'));
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
  emptyMessage,
  mobileTitleKey,
  selection,
  onRowClick,
  className,
}: DataTableProps<R>) {
  const isMobile = useIsMobile();
  const { m } = useI18n();

  if (rows.length === 0) {
    return (
      <div data-component="DataTable" className={cx(styles.empty, 'text-body-lg', className)} role="status">
        {emptyMessage ?? m.components.tableEmpty}
      </div>
    );
  }

  const keys = rows.map(getRowKey);
  const selectedCount = selection ? keys.filter((k) => selection.selectedKeys.has(k)).length : 0;
  const toggle = (key: string, on: boolean) => {
    if (!selection) return;
    const next = new Set(selection.selectedKeys);
    if (on) next.add(key);
    else next.delete(key);
    selection.onSelectedKeysChange(next);
  };
  const toggleAll = (on: boolean) => {
    if (!selection) return;
    const next = new Set(selection.selectedKeys);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    selection.onSelectedKeysChange(next);
  };
  const rowClick = (row: R) => (e: MouseEvent) => {
    if (onRowClick && !fromInteractive(e)) onRowClick(row);
  };

  if (isMobile) {
    const titleColumn = columns.find((c) => c.key === mobileTitleKey);
    const rest = columns.filter((c) => c !== titleColumn && c.mobile !== 'hidden');
    return (
      <ul data-component="DataTable" className={cx(styles.cards, className)} aria-label={caption}>
        {rows.map((row) => {
          const key = getRowKey(row);
          const selected = selection?.selectedKeys.has(key) ?? false;
          return (
            <li
              key={key}
              className={cx(styles.card, selected && styles.selected, onRowClick && styles.clickable)}
              onClick={rowClick(row)}
            >
              {(titleColumn || selection) && (
                <div className={cx(styles.cardTitle, 'text-title-md')}>
                  {selection && (
                    <Checkbox label={selection.getRowLabel(row)} hideLabel checked={selected} onChange={(on) => toggle(key, on)} />
                  )}
                  {titleColumn?.render(row)}
                </div>
              )}
              <dl className={styles.cardList}>
                {rest.map((col) =>
                  col.mobile === 'full' ? (
                    <div key={col.key} className={styles.cardFull}>
                      <dt className="visually-hidden">{col.header}</dt>
                      <dd>{col.render(row)}</dd>
                    </div>
                  ) : (
                    <div key={col.key} className={styles.cardRow}>
                      <dt className={cx(styles.cardLabel, 'text-body-md')}>{col.header}</dt>
                      <dd className="text-body-md">{col.render(row)}</dd>
                    </div>
                  ),
                )}
              </dl>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ScrollArea data-component="DataTable"
      axis="x"
      className={cx(styles.scroll, className)}
      viewportProps={{ tabIndex: 0, role: 'region', 'aria-label': caption }}
    >
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <colgroup>
          {selection && <col className={styles.selectCol} />}
          {columns.map((col) => (
            <col key={col.key} style={{ width: col.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {selection && (
              <th scope="col" className={cx(styles.th, styles.center)}>
                <Checkbox
                  label={m.components.tableSelectAll}
                  hideLabel
                  checked={selectedCount === keys.length}
                  indeterminate={selectedCount > 0 && selectedCount < keys.length}
                  onChange={toggleAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cx(styles.th, styles[col.align ?? 'center'], col.sticky && styles.sticky, 'text-body-lg')}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = getRowKey(row);
            const selected = selection?.selectedKeys.has(key) ?? false;
            return (
              <tr
                key={key}
                className={cx(selected && styles.selected, onRowClick && styles.clickable)}
                aria-selected={selection ? selected : undefined}
                onClick={rowClick(row)}
              >
                {selection && (
                  <td className={cx(styles.td, styles.center)}>
                    <Checkbox label={selection.getRowLabel(row)} hideLabel checked={selected} onChange={(on) => toggle(key, on)} />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cx(styles.td, styles[col.align ?? 'center'], col.sticky && styles.sticky, 'text-body-lg')}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollArea>
  );
}
