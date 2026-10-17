import { useRef } from 'react';
import {
  Avatar,
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
  deductsAnnual,
  isUrgent,
  kindOf,
  kindTone,
  leaveLabel,
  periodText,
  remainingOf,
  requestedText,
  startsInText,
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
  const overlaps = teamOverlaps(leave, leaves, members);
  const deduct = deductsAnnual(leave);
  const remaining = remainingOf(m);
  const after = remaining - (deduct ? leave.days : 0);

  return (
    <div className={styles.detail}>
      <div className={styles.detailPerson}>
        <Avatar name={m.name} colorKey={m.id} size="xl" />
        <div>
          <Text as="p" variant="title-lg">
            {m.name}
          </Text>
          <Text as="p" variant="body-md" tone="tertiary">
            {m.dept} · {m.role}
          </Text>
        </div>
      </div>

      <dl className={styles.detailList}>
        <dt>{t.type}</dt>
        <dd>
          <Tag tone={kindTone[kindOf(leave)]}>{leaveLabel(leave, tx)}</Tag>
        </dd>
        <dt>{t.period}</dt>
        <dd>
          {periodText(leave, tx, f)}{' '}
          <Text tone={isUrgent(leave, today) ? 'danger' : 'tertiary'} variant="body-md">
            {t.periodNote(f.days(leave.days), startsInText(leave, today, tx))}
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
          {t.balance}
        </Text>
        <div className={styles.balanceBox}>
          {!deduct && (
            <Text as="p" variant="body-md" tone="tertiary">
              {t.notDeducted(leaveLabel(leave, tx))}
            </Text>
          )}
          <KeyValueList
            items={[
              { label: t.granted, value: f.days(m.granted) },
              { label: t.used, value: f.days(m.used) },
              { label: t.thisRequest, value: deduct ? `−${f.days(leave.days)}` : f.days(0) },
            ]}
          />
          <Meter
            max={m.granted}
            label={t.meter(f.days(m.granted), f.days(m.used), deduct ? f.days(leave.days) : null)}
            segments={[
              { value: m.used, tone: 'strong' },
              { value: deduct ? leave.days : 0, tone: 'light' },
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
          {t.team(m.dept)}
        </Text>
        {overlaps.length ? (
          <>
            <Callout tone="warning">
              {t.teamWarning(m.dept, overlaps.length + 1)}
            </Callout>
            <ul className={styles.overlapList}>
              {overlaps.map((o) => {
                const om = members[o.memberId];
                return (
                  <li key={o.id}>
                    <Avatar name={om.name} colorKey={om.id} size="sm" />
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
