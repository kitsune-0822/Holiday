import { ChevronLeft, ChevronRight, Download, Maximize2, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  Chip,
  DataTable,
  IconButton,
  PageHeader,
  Sheet,
  Tag,
  Text,
  TextField,
  useToast,
  type DataTableColumn,
} from '@/components';
import { useApprovals } from '@/features/approvals/ApprovalsContext';
import {
  covers,
  focusWeekStart,
  kindOf,
  kindTone,
  leaveLabel,
  onLeaveToday,
  periodText,
  remainingOf,
  requestedText,
  returnText,
  teamOverlaps,
  toCsv,
  weekRows,
  type Decision,
  type LeaveKind,
} from '@/features/approvals/logic';
import type { TeamLeave } from '@/features/approvals/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useOverflow } from '@/hooks/useOverflow';
import { cx } from '@/lib/cx';
import { useI18n } from '@/i18n';
import { addDaysISO, isWeekend, mondayOf } from '@/lib/date';
import { ApprovalDetailSheet } from './ApprovalDetailSheet';
import { RejectSheet } from './RejectSheet';
import { WeekTimeline } from './WeekTimeline';
import styles from './ApprovalsPage.module.css';

type KindFilter = 'all' | LeaveKind;
const kindFilters: KindFilter[] = ['all', 'annual', 'half', 'sick', 'comp'];
const LOW_BALANCE = 2;

export function ApprovalsPage() {
  const { m: tx, f } = useI18n();
  const t = tx.approvals;
  useDocumentTitle(t.title);
  const { today, members, leaves, pending, decide } = useApprovals();
  const toast = useToast();
  const ids = { search: useId(), list: useId() };

  const [kind, setKind] = useState<KindFilter>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [rejectIds, setRejectIds] = useState<string[]>([]);

  const rows = useMemo(() => {
    const q = query.trim();
    return pending.filter((l) => {
      const m = members[l.memberId];
      return (
        (kind === 'all' || kindOf(l) === kind) &&
        (!q || m.name.includes(q) || l.reason.includes(q))
      );
    });
  }, [pending, members, kind, query]);

  const detailLeave = leaves.find((l) => l.id === detailId) ?? null;
  // 선택은 지금 보이는 대기 목록 안에서만 유지한다
  const visibleSelected = new Set([...selected].filter((id) => pending.some((l) => l.id === id)));

  const runDecision = (targetIds: string[], decision: Decision, reason?: string) => {
    const first = members[leaves.find((l) => l.id === targetIds[0])!.memberId].name;
    const undo = decide(targetIds, decision, reason);
    setSelected((s) => new Set([...s].filter((id) => !targetIds.includes(id))));
    const who = t.who(first, targetIds.length - 1);
    toast({
      message: decision === 'approved' ? t.approvedToast(who) : t.rejectedToast(who),
      action: { label: t.undo, onClick: undo },
    });
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows, members, tx)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = t.exportFile(today);
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<TeamLeave>[] = [
    {
      key: 'member',
      header: t.columns.member,
      align: 'start',
      render: (l) => {
        const m = members[l.memberId];
        return (
          <button
            type="button"
            className={cx(styles.nameButton, 'text-title-sm')}
            aria-label={t.detailLabel(m.name)}
            onClick={() => setDetailId(l.id)}
          >
            {m.name}
          </button>
        );
      },
    },
    { key: 'kind', header: t.columns.kind, render: (l) => <Tag tone={kindTone[kindOf(l)]}>{leaveLabel(l, tx)}</Tag> },
    {
      key: 'period',
      header: t.columns.period,
      align: 'start',
      render: (l) => periodText(l, tx, f),
    },
    { key: 'days', header: t.columns.days, align: 'end', render: (l) => f.days(l.days) },
    {
      key: 'reason',
      header: t.columns.reason,
      align: 'start',
      render: (l) => (
        <span className={styles.reason} title={l.reason}>
          {l.reason}
        </span>
      ),
    },
    {
      key: 'team',
      header: t.columns.team,
      align: 'start',
      render: (l) => {
        // 같은 사람이 여러 번 쉬어도 한 번만 센다
        const names = [...new Set(teamOverlaps(l, leaves).map((o) => members[o.memberId].name))];
        return names.length ? (
          <Text tone="danger" variant="label-md" title={names.join(', ')}>
            {t.overlapNames(names[0], names.length - 1)}
          </Text>
        ) : (
          <span className={cx(styles.sub, 'text-caption-md')}>{t.noOverlap}</span>
        );
      },
    },
    {
      key: 'balance',
      header: t.columns.balance,
      align: 'end',
      render: (l) => {
        // 신청한 휴가 종류의 잔여 (병가면 남은 병가)
        const after = remainingOf(members[l.memberId], l.type) - l.days;
        return <Text tone={after < LOW_BALANCE ? 'danger' : 'inherit'}>{f.days(after)}</Text>;
      },
    },
    { key: 'requested', header: t.columns.requested, mobile: 'hidden', render: (l) => <span className={styles.sub}>{requestedText(l.requestedAt, today, tx)}</span> },
    {
      key: 'actions',
      header: t.columns.actions,
      align: 'end',
      mobile: 'full',
      render: (l) => {
        const name = members[l.memberId].name;
        return (
          <span className={styles.rowActions}>
            <Button hierarchy="tertiary" tone="danger" size="xs" aria-label={t.rejectLabel(name)} onClick={() => setRejectIds([l.id])}>
              {t.reject}
            </Button>
            <Button size="xs" aria-label={t.approveLabel(name)} onClick={() => runDecision([l.id], 'approved')}>
              {t.approve}
            </Button>
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title={t.title}
        actions={
          <Button hierarchy="tertiary" size="sm" icon={<Download />} onClick={exportCsv} disabled={!rows.length}>
            {t.export}
          </Button>
        }
      />

      <div className={styles.overview}>
        <TodayCard />
        <WeekCard onOpen={(l) => setDetailId(l.id)} />
      </div>

      <section className={styles.pendingPanel} aria-labelledby={ids.list}>
        <header className={styles.panelHead}>
          <h2 id={ids.list} className={cx(styles.panelTitle, 'text-heading-sm')}>
            {t.pending} <span className={styles.count}>{pending.length}</span>
          </h2>
          <Text variant="body-md" tone="tertiary">
            {t.sortHint}
          </Text>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.kinds} role="group" aria-label={t.kindGroup}>
            {kindFilters.map((k) => {
              const count = k === 'all' ? pending.length : pending.filter((l) => kindOf(l) === k).length;
              return (
                <Chip key={k} isSelected={kind === k} onClick={() => setKind(k)}>
                  {t.kinds[k]} <span className={styles.chipCount}>{count}</span>
                </Chip>
              );
            })}
          </div>
          <div className={styles.toolbarFields}>
            <TextField
              id={ids.search}
              type="search"
              label={t.search}
              hideLabel
              size="sm"
              placeholder={t.search}
              leadingIcon={<Search />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {visibleSelected.size > 0 && (
          <div className={styles.bulkbar} role="region" aria-label={t.bulkRegion}>
            <Text variant="label-lg" aria-live="polite">
              {t.selected(visibleSelected.size)}
            </Text>
            <div className={styles.bulkActions}>
              <Button hierarchy="tertiary" size="sm" onClick={() => setSelected(new Set())}>
                {t.clearSelection}
              </Button>
              <Button hierarchy="tertiary" tone="danger" size="sm" onClick={() => setRejectIds([...visibleSelected])}>
                {t.rejectSelected}
              </Button>
              <Button size="sm" onClick={() => runDecision([...visibleSelected], 'approved')}>
                {t.approveSelected}
              </Button>
            </div>
          </div>
        )}

        <DataTable
          caption={t.caption}
          columns={columns}
          rows={rows}
          getRowKey={(l) => l.id}
          mobileTitleKey="member"
          selection={{
            selectedKeys: visibleSelected,
            onSelectedKeysChange: setSelected,
            getRowLabel: (l) => t.selectLabel(members[l.memberId].name),
          }}
          onRowClick={(l) => setDetailId(l.id)}
          emptyMessage={pending.length ? t.emptyFiltered : t.allDone}
        />
        {rows.length > 0 && (
          <Text as="p" variant="body-md" tone="tertiary">
            {t.total(rows.length, f.days(rows.reduce((s, l) => s + l.days, 0)))}
          </Text>
        )}
      </section>

      <ApprovalDetailSheet
        leave={detailLeave}
        onClose={() => setDetailId(null)}
        onApprove={(l) => runDecision([l.id], 'approved')}
        onReject={(l) => setRejectIds([l.id])}
      />
      <RejectSheet
        names={rejectIds.map((id) => members[leaves.find((l) => l.id === id)!.memberId].name)}
        onClose={() => setRejectIds([])}
        onConfirm={(reason) => {
          runDecision(rejectIds, 'rejected', reason);
          setRejectIds([]);
          setDetailId(null);
        }}
      />
    </div>
  );
}

function TodayCard() {
  const { today, leaves } = useApprovals();
  const { m: tx, f } = useI18n();
  const t = tx.approvals;
  const list = onLeaveToday(leaves, today);
  const listRef = useRef<HTMLDivElement>(null);
  const overflowing = useOverflow(listRef);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card
        title={
          <>
            {t.today} <span className={styles.count}>{list.length}</span>
          </>
        }
        description={f.longDate(today)}
        compact
        action={
          list.length > 0 && (
            <IconButton variant="ghost" size="xs" label={t.expand(t.today)} icon={<Maximize2 />} onClick={() => setExpanded(true)} />
          )
        }
        className={cx(styles.overviewCard, styles.previewCard)}
      >
        <TodaySplit list={list} />
        {/* 명단이 넘치면 주간 카드처럼 아래를 흐리게 하고 '모두 보기'를 둔다 */}
        <div className={styles.preview}>
          <div ref={listRef} className={styles.previewInner}>
            {list.length ? (
              <TodayList list={list} />
            ) : (
              <Text as="p" variant="body-md" tone="tertiary" className={styles.emptyText}>
                {isWeekend(today) ? t.weekend : t.todayEmpty}
              </Text>
            )}
          </div>
          {overflowing && (
            <div className={styles.previewFade}>
              <Button hierarchy="secondary" size="sm" icon={<Maximize2 />} onClick={() => setExpanded(true)}>
                {t.showAll(list.length)}
              </Button>
            </div>
          )}
        </div>
      </Card>
      <Sheet open={expanded} onClose={() => setExpanded(false)} title={t.today} description={f.longDate(today)}>
        <div className={styles.todaySheet}>
          <TodaySplit list={list} />
          <TodayList list={list} />
        </div>
      </Sheet>
    </>
  );
}

/** 종일 · 오전 부재 · 오후 부재 인원 */
function TodaySplit({ list }: { list: TeamLeave[] }) {
  const { m } = useI18n();
  const t = m.approvals;
  const full = list.filter((l) => l.unit === 'full').length;
  const am = list.filter((l) => l.unit !== 'full' && l.period === 'am').length;
  const pm = list.filter((l) => l.unit !== 'full' && l.period === 'pm').length;
  return (
    <dl className={styles.split}>
      <div>
        <dt className="text-caption-md">{t.split.full}</dt>
        <dd className="text-title-lg">{full}</dd>
      </div>
      <div>
        <dt className="text-caption-md">{t.split.am}</dt>
        <dd className="text-title-lg">{am}</dd>
      </div>
      <div>
        <dt className="text-caption-md">{t.split.pm}</dt>
        <dd className="text-title-lg">{pm}</dd>
      </div>
    </dl>
  );
}

function TodayList({ list }: { list: TeamLeave[] }) {
  const { today, members } = useApprovals();
  const { m: tx, f } = useI18n();
  return (
    <ul className={styles.todayList}>
      {list.map((l) => (
        <li key={l.id}>
          <span className={styles.personText}>
            <span className="text-title-sm">{members[l.memberId].name}</span>
            <span className={cx(styles.sub, 'text-caption-md')}>{returnText(l, today, tx, f)}</span>
          </span>
          <Tag tone={kindTone[kindOf(l)]}>{leaveLabel(l, tx)}</Tag>
        </li>
      ))}
    </ul>
  );
}

function WeekCard({ onOpen }: { onOpen: (l: TeamLeave) => void }) {
  const { today, members, leaves } = useApprovals();
  const { start, isNextWeek } = focusWeekStart(today);
  const rows = weekRows(leaves, members, start);
  const previewRef = useRef<HTMLDivElement>(null);
  const overflowing = useOverflow(previewRef);
  const [expanded, setExpanded] = useState(false);
  const { m: tx } = useI18n();
  const title = isNextWeek ? tx.approvals.nextWeek : tx.approvals.thisWeek;

  return (
    <>
      <Card
        title={
          <>
            {title} <span className={styles.count}>{approvedPeopleIn(leaves, start)}</span>
          </>
        }
        action={
          <div className={styles.weekActions}>
            <Legend />
            <IconButton variant="ghost" size="xs" label={tx.approvals.expand(title)} icon={<Maximize2 />} onClick={() => setExpanded(true)} />
          </div>
        }
        className={cx(styles.overviewCard, styles.previewCard)}
      >
        {/* 미리보기: 옆 카드 높이에 맞춰 잘라 보여주고, 넘치면 아래를 흐리게 한 뒤 '모두 보기'를 둔다 */}
        <div className={styles.preview}>
          <div ref={previewRef} className={styles.previewInner}>
            <WeekTimeline
              weekStart={start}
              today={today}
              rows={rows}
              countOn={(d) => approvedOn(leaves, d)}
              onOpen={onOpen}
            />
          </div>
          {overflowing && (
            <div className={styles.previewFade}>
              <Button hierarchy="secondary" size="sm" icon={<Maximize2 />} onClick={() => setExpanded(true)}>
                {tx.approvals.showAll(rows.length)}
              </Button>
            </div>
          )}
        </div>
      </Card>
      <WeekSheet open={expanded} onClose={() => setExpanded(false)} initialStart={start} onOpen={onOpen} />
    </>
  );
}

const approvedOn = (leaves: TeamLeave[], day: string) => leaves.filter((l) => l.status === 'approved' && covers(l, day)).length;

function approvedPeopleIn(leaves: TeamLeave[], start: string) {
  const end = addDaysISO(start, 6);
  return new Set(leaves.filter((l) => l.status === 'approved' && l.startDate <= end && l.endDate >= start).map((l) => l.memberId)).size;
}

function Legend() {
  const { m } = useI18n();
  return (
    <div className={cx(styles.legend, 'text-caption-md')} aria-hidden="true">
      <span>
        <i className={styles.swatch} />
        {m.approvals.legendApproved}
      </span>
      <span>
        <i className={cx(styles.swatch, styles.swatchPending)} />
        {m.approvals.legendPending}
      </span>
    </div>
  );
}

/** 주간 일정을 크게 보는 시트. 앞뒤 주로 넘겨 볼 수 있다. */
function WeekSheet({
  open,
  onClose,
  initialStart,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  initialStart: string;
  onOpen: (l: TeamLeave) => void;
}) {
  const { today, members, leaves } = useApprovals();
  const { m: tx, f } = useI18n();
  const t = tx.approvals;
  const [start, setStart] = useState(initialStart);
  useEffect(() => {
    if (open) setStart(initialStart);
  }, [open, initialStart]);

  const rows = weekRows(leaves, members, start);
  const end = addDaysISO(start, 6);
  const pendingCount = rows.reduce((n, r) => n + r.leaves.filter((l) => l.status === 'pending').length, 0);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      size="wide"
      title={t.weekTitle}
      description={t.weekSummary(tx.date.range(f.monthDay(start), f.monthDay(end)), approvedPeopleIn(leaves, start), pendingCount)}
    >
      <div className={styles.weekSheet}>
        <div className={styles.weekNav}>
          <div className={styles.weekNavButtons}>
            <IconButton size="sm" label={t.prevWeek} icon={<ChevronLeft />} onClick={() => setStart(addDaysISO(start, -7))} />
            <IconButton size="sm" label={t.nextWeekButton} icon={<ChevronRight />} onClick={() => setStart(addDaysISO(start, 7))} />
            <Button hierarchy="tertiary" size="sm" onClick={() => setStart(mondayOf(today))} disabled={start === mondayOf(today)}>
              {t.thisWeekButton}
            </Button>
          </div>
          <Legend />
        </div>
        <Text as="p" variant="body-md" tone="tertiary">
          {t.weekHint}
        </Text>
        <WeekTimeline weekStart={start} today={today} rows={rows} countOn={(d) => approvedOn(leaves, d)} onOpen={onOpen} />
      </div>
    </Sheet>
  );
}
