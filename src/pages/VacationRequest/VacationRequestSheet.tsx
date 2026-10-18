import { useState, type FormEvent } from 'react';
import { Button, ButtonGroup, DateField, SegmentedControl, Sheet, Text, TextArea, useToast } from '@/components';
import { cx } from '@/lib/cx';
import { remainingAfter, requestedDays } from '@/features/vacation/calc';
import { overlaps } from '@/features/vacation/requests';
import {
  dayPeriods,
  vacationTypes,
  vacationUnits,
  type DayPeriod,
  type VacationType,
  type VacationUnit,
} from '@/features/vacation/types';
import { useVacation } from '@/features/vacation/VacationContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useI18n } from '@/i18n';
import { todayISO } from '@/lib/date';
import { useRouteSheet } from '../sheetRoute';
import styles from './VacationRequestSheet.module.css';

const FORM_ID = 'vacation-request-form';
const REASON_MAX = 200;

interface Errors {
  start?: string;
  end?: string;
  period?: string;
  days?: string;
}

export function VacationRequestSheet() {
  const { m, f } = useI18n();
  const t = m.request;
  useDocumentTitle(t.title);
  const sheet = useRouteSheet();
  const toast = useToast();
  const { balance, pendingDays, requests, submitRequest } = useVacation();

  const [type, setType] = useState<VacationType>('annual');
  const [unit, setUnit] = useState<VacationUnit>('full');
  const [period, setPeriod] = useState<DayPeriod | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isFullDay = unit === 'full';
  // 반차·반반차는 하루만 신청할 수 있어 종료일이 시작일을 따라간다
  const endDate = isFullDay ? end : start;
  const days = requestedDays(start, endDate, unit);
  const after = remainingAfter(balance, type, days);

  const errors: Errors = {};
  if (!start) errors.start = t.errors.start;
  else if (start < todayISO()) errors.start = t.errors.past;
  if (isFullDay && !end) errors.end = t.errors.end;
  else if (isFullDay && end < start) errors.end = t.errors.order;
  if (!isFullDay && !period) errors.period = t.errors.period;
  // 이미 낸 신청(반려 제외)과 기간이 겹치면 막는다
  const clash =
    start && endDate && !errors.start && !errors.end
      ? requests.find(
          (r) =>
            r.status !== 'rejected' &&
            overlaps(r, { startDate: start, endDate, period: isFullDay ? null : period }),
        )
      : undefined;
  if (clash) errors.start = t.errors.overlap(f.dateSpan(clash.startDate, clash.endDate));
  if (start && endDate && !errors.end && days === 0) errors.days = t.errors.noWeekday;
  else if (days > balance[type] - pendingDays[type]) {
    // 잔여 휴가는 승인될 때 빠지므로, 결재 대기 중인 일수까지 합쳐 넘지 않게 한다
    const available = Math.max(0, balance[type] - pendingDays[type]);
    errors.days =
      pendingDays[type] > 0
        ? t.errors.overPending(f.days(pendingDays[type]), m.vacation.types[type], f.days(available))
        : t.errors.short(m.vacation.types[type], f.days(days - balance[type]));
  }
  const valid = Object.keys(errors).length === 0;
  // 입력 중에는 잔소리하지 않고, 값을 넣었거나 신청을 눌렀을 때만 보인다
  const show = (key: keyof Errors, touched: boolean) => (submitted || touched ? errors[key] : undefined);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    submitRequest({ type, unit, period: isFullDay ? null : period, startDate: start, endDate, days, reason: reason.trim() });
    toast({ message: t.toast(m.vacation.types[type], f.days(days)) });
    sheet.onClose();
  };

  return (
    <Sheet
      {...sheet}
      title={t.title}
      showDismissButton={false}
      footer={
        <ButtonGroup>
          <Button hierarchy="tertiary" onClick={sheet.onClose}>
            {m.common.close}
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitted && !valid}>
            {days > 0 ? t.submitDays(f.days(days)) : t.submit}
          </Button>
        </ButtonGroup>
      }
    >
      <form id={FORM_ID} className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.columns}>
          <section className={styles.column} aria-labelledby="request-type-title">
            <Text as="h3" id="request-type-title" variant="heading-sm">
              {t.typeSection}
            </Text>
            <SegmentedControl
              label={t.type}
              required
              value={type}
              onChange={setType}
              options={vacationTypes.map((v) => ({ value: v, label: m.vacation.types[v], disabled: balance[v] - pendingDays[v] <= 0 }))}
            />
            <SegmentedControl
              label={t.unit}
              required
              value={unit}
              onChange={(u) => {
                setUnit(u);
                if (u === 'full') setPeriod(null);
              }}
              options={vacationUnits.map((u) => ({ value: u, label: m.vacation.units[u] }))}
            />
            <SegmentedControl
              label={t.period}
              required={!isFullDay}
              disabled={isFullDay}
              value={isFullDay ? null : period}
              onChange={setPeriod}
              error={show('period', false)}
              options={dayPeriods.map((p) => ({ value: p, label: m.vacation.periods[p] }))}
            />
          </section>

          <section className={cx(styles.column, styles.periodSection)} aria-labelledby="request-period-title">
            <Text as="h3" id="request-period-title" variant="heading-sm">
              {t.periodSection}
            </Text>
            <DateField
              label={t.start}
              required
              value={start}
              min={todayISO()}
              onChange={(v) => {
                setStart(v);
                if (end && v > end) setEnd('');
              }}
              error={show('start', Boolean(start))}
            />
            <DateField
              label={t.end}
              required={isFullDay}
              value={endDate}
              min={start || todayISO()}
              disabled={!isFullDay}
              description={isFullDay ? undefined : t.oneDayOnly(m.vacation.units[unit])}
              onChange={setEnd}
              error={isFullDay ? show('end', Boolean(end)) : undefined}
            />
            <TextArea
              label={t.reason}
              placeholder={t.reasonPlaceholder}
              value={reason}
              maxLength={REASON_MAX}
              description={`${reason.length}/${REASON_MAX}`}
              onChange={(e) => setReason(e.target.value)}
            />
          </section>

          {/* 지금 잔여와 승인 후 잔여를 한 표로 비교한다. 1열에선 맨 아래, 2열에선 시간대 아래 */}
          <section className={cx(styles.group, styles.balanceSection)} aria-labelledby="request-balance-title" aria-live="polite">
          <Text as="h3" id="request-balance-title" variant="label-lg">
            {t.balance}
          </Text>
          <table className={styles.balance}>
            <thead className="text-caption-md">
              <tr>
                <th scope="col">{t.balanceCols.type}</th>
                <th scope="col">{t.balanceCols.now}</th>
                <th scope="col">{t.balanceCols.after}</th>
              </tr>
            </thead>
            <tbody className="text-body-md">
              {vacationTypes.map((v) => (
                <tr key={v} className={v === type ? styles.current : undefined}>
                  <th scope="row">{m.vacation.types[v]}</th>
                  <td>
                    {f.days(balance[v])}
                    {pendingDays[v] > 0 && <Text tone="tertiary"> {t.pendingNote(f.days(pendingDays[v]))}</Text>}
                  </td>
                  <td>
                    {v === type && days > 0 ? (
                      <>
                        {f.days(after[v])} <Text tone="danger">(-{f.days(days)})</Text>
                      </>
                    ) : (
                      f.days(balance[v])
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {show('days', Boolean(start && endDate)) && (
            <Text as="p" role="alert" variant="body-md" tone="danger">
              {errors.days}
            </Text>
          )}
        </section>
        </div>
      </form>
    </Sheet>
  );
}
