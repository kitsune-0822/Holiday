import { useRef } from 'react';
import {
  Button,
  ButtonGroup,
  Callout,
  KeyValueList,
  Meter,
  Sheet,
  Tag,
  Text,
} from '@/components';
import { currentUser } from '@/data/mock';
import {
  kindOf,
  kindTone,
  leaveLabel,
  periodText,
  remainingOf,
  requestedText,
  teamOverlaps,
} from '@/features/approvals/logic';
import { useApprovals } from '@/features/approvals/ApprovalsContext';
import type { TeamLeave } from '@/features/approvals/types';
import { cx } from '@/lib/cx';
import { useI18n } from '@/i18n';
import styles from './ApprovalsPage.module.css';

/** 승인 후 잔여가 이보다 적으면 빨간색으로 경고한다 */
const LOW_BALANCE = 2;

interface ApprovalDetailSheetProps {
  leave: TeamLeave | null;
  onClose: () => void;
  onApprove: (leave: TeamLeave) => void;
  onReject: (leave: TeamLeave) => void;
}

export function ApprovalDetailSheet({ leave, onClose, onApprove, onReject }: ApprovalDetailSheetProps) {
  const { members, leaves, today } = useApprovals();
  const { m: tx } = useI18n();
  const open = Boolean(leave && leave.status === 'pending');
  // 닫히는 애니메이션 동안에도 내용을 보여주기 위해 마지막 신청을 기억한다
  const last = useRef(leave);
  if (leave) last.current = leave;
  const shown = leave ?? last.current;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tx.approvals.detail.title}
      footer={
        shown && (
          <ButtonGroup>
            <Button hierarchy="tertiary" tone="danger" onClick={() => onReject(shown)}>
              {tx.approvals.reject}
            </Button>
            <Button onClick={() => onApprove(shown)}>{tx.approvals.approve}</Button>
          </ButtonGroup>
        )
      }
    >
      {shown && <DetailBody leave={shown} members={members} leaves={leaves} today={today} />}
    </Sheet>
  );
}

function DetailBody({
  leave,
  members,
  leaves,
  today,
}: {
  leave: TeamLeave;
  members: ReturnType<typeof useApprovals>['members'];
  leaves: TeamLeave[];
  today: string;
}) {
  const { m: tx, f } = useI18n();
  const t = tx.approvals.detail;
  const m = members[leave.memberId];
  const overlaps = teamOverlaps(leave, leaves);
  const type = leave.type;
  const after = remainingOf(m, type) - leave.days;

  return (
    <div className={styles.detail}>
      <div className={styles.detailPerson}>
        <Text as="p" variant="title-lg">
          {m.name}
        </Text>
        <Text as="p" variant="body-md" tone="tertiary">
          {m.role}
        </Text>
      </div>

      <dl className={styles.detailList}>
        <dt>{t.type}</dt>
        <dd>
          <Tag tone={kindTone[kindOf(leave)]}>{leaveLabel(leave, tx)}</Tag>
        </dd>
        <dt>{t.period}</dt>
        <dd>
          {periodText(leave, tx, f)}{' '}
          <Text tone="tertiary" variant="body-md">
            {t.periodNote(f.days(leave.days))}
          </Text>
        </dd>
        <dt>{t.reason}</dt>
        <dd>{leave.reason}</dd>
        <dt>{t.requestedAt}</dt>
        <dd>
          {f.monthDay(leave.requestedAt)}{' '}
          <Text tone="tertiary" variant="body-md">
            {requestedText(leave.requestedAt, today, tx)}
          </Text>
        </dd>
      </dl>

      <section className={styles.detailSection} aria-labelledby="detail-balance">
        <Text as="h3" id="detail-balance" variant="title-md">
          {t.balance(tx.vacation.types[type])}
        </Text>
        <div className={styles.balanceBox}>
          <KeyValueList
            items={[
              { label: t.granted, value: f.days(m.granted[type]) },
              { label: t.used, value: f.days(m.used[type]) },
              { label: t.thisRequest, value: `−${f.days(leave.days)}` },
            ]}
          />
          <Meter
            max={Math.max(m.granted[type], m.used[type] + leave.days)}
            label={t.meter(f.days(m.granted[type]), f.days(m.used[type]), f.days(leave.days))}
            segments={[
              { value: m.used[type], tone: 'strong' },
              { value: leave.days, tone: 'light' },
            ]}
          />
          <div className={styles.balanceTotal}>
            <Text variant="title-md">{t.after}</Text>
            <Text variant="title-md" tone={after < LOW_BALANCE ? 'danger' : 'primary'}>
              {f.days(after)}
            </Text>
          </div>
        </div>
      </section>

      <section className={styles.detailSection} aria-labelledby="detail-team">
        <Text as="h3" id="detail-team" variant="title-md">
          {t.team}
        </Text>
        {overlaps.length ? (
          <>
            <Callout tone="warning">
              {t.teamWarning(new Set(overlaps.map((o) => o.memberId)).size + 1)}
            </Callout>
            <ul className={styles.overlapList}>
              {overlaps.map((o) => {
                const om = members[o.memberId];
                return (
                  <li key={o.id}>
                    <span className="text-body-md">{om.name}</span>
                    <Tag tone={kindTone[kindOf(o)]}>{leaveLabel(o, tx)}</Tag>
                    {o.status === 'pending' && <Tag>{tx.vacation.status.pending}</Tag>}
                    <Text className={styles.overlapWhen} variant="body-md" tone="tertiary">
                      {periodText(o, tx, f)}
                    </Text>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <Text as="p" variant="body-md" tone="tertiary">
            {t.teamNone}
          </Text>
        )}
      </section>

      <section className={styles.detailSection} aria-labelledby="detail-log">
        <Text as="h3" id="detail-log" variant="title-md">
          {t.log}
        </Text>
        <ol className={styles.log}>
          <li>
            <time className="text-caption-md">{f.monthDay(leave.requestedAt)}</time>
            <span className="text-body-md">{t.logRequested(m.name)}</span>
          </li>
          <li className={cx(styles.logNow)}>
            <time className="text-caption-md">{t.logNow}</time>
            <span className="text-body-md">{t.logWaiting(currentUser.name)}</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
