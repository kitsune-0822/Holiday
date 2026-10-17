import { useState, type FormEvent } from 'react';
import { Button, ButtonGroup, DateField, KeyValueList, SegmentedControl, Sheet, Text, TextArea, useToast } from '@/components';
import { formatDays, remainingAfter, requestedDays } from '@/features/vacation/calc';
import {
  dayPeriods,
  periodLabel,
  typeLabel,
  unitLabel,
  vacationTypes,
  vacationUnits,
  type DayPeriod,
  type VacationType,
  type VacationUnit,
} from '@/features/vacation/types';
import { useVacation } from '@/features/vacation/VacationContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
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
  useDocumentTitle('휴가 신청하기');
  const sheet = useRouteSheet();
  const toast = useToast();
  const { balance, pendingDays, submitRequest } = useVacation();

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
  if (!start) errors.start = '휴가 시작일을 골라 주세요.';
  else if (start < todayISO()) errors.start = '오늘 이후 날짜를 골라 주세요.';
  if (isFullDay && !end) errors.end = '휴가 종료일을 골라 주세요.';
  else if (isFullDay && end < start) errors.end = '종료일은 시작일과 같거나 뒤여야 해요.';
  if (!isFullDay && !period) errors.period = '시간대를 골라 주세요.';
  if (start && endDate && !errors.end && days === 0) errors.days = '고른 기간에 평일이 없어요.';
  else if (days > balance[type] - pendingDays[type]) {
    // 잔여 휴가는 승인될 때 빠지므로, 결재 대기 중인 일수까지 합쳐 넘지 않게 한다
    const available = Math.max(0, balance[type] - pendingDays[type]);
    errors.days =
      pendingDays[type] > 0
        ? `결재 대기 중인 ${formatDays(pendingDays[type])}을 빼면 ${typeLabel[type]}는 ${formatDays(available)}까지 신청할 수 있어요.`
        : `${typeLabel[type]}가 ${formatDays(days - balance[type])} 부족해요.`;
  }
  const valid = Object.keys(errors).length === 0;
  // 입력 중에는 잔소리하지 않고, 값을 넣었거나 신청을 눌렀을 때만 보인다
  const show = (key: keyof Errors, touched: boolean) => (submitted || touched ? errors[key] : undefined);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    submitRequest({ type, unit, period: isFullDay ? null : period, startDate: start, endDate, days, reason: reason.trim() });
    toast({ message: `${typeLabel[type]} ${formatDays(days)}을 신청했어요. 승인되면 잔여 휴가에서 빠져요.` });
    sheet.onClose();
  };

  return (
    <Sheet
      {...sheet}
      title="휴가 신청하기"
      showDismissButton={false}
      footer={
        <ButtonGroup>
          <Button hierarchy="tertiary" onClick={sheet.onClose}>
            닫기
          </Button>
          <Button type="submit" form={FORM_ID} disabled={submitted && !valid}>
            {days > 0 ? `${formatDays(days)} 신청하기` : '신청하기'}
          </Button>
        </ButtonGroup>
      }
    >
      <form id={FORM_ID} className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.columns}>
          <section className={styles.column} aria-labelledby="request-type-title">
            <Text as="h3" id="request-type-title" variant="heading-sm">
              휴가 종류 선택
            </Text>
            <div className={styles.group}>
              <Text as="h4" variant="label-lg">
                잔여 휴가
              </Text>
              <KeyValueList
                items={vacationTypes.map((t) => ({
                  label: typeLabel[t],
                  value:
                    pendingDays[t] > 0 ? (
                      <>
                        {formatDays(balance[t])} <Text tone="tertiary">(결재 대기 {formatDays(pendingDays[t])})</Text>
                      </>
                    ) : (
                      formatDays(balance[t])
                    ),
                }))}
              />
            </div>
            <SegmentedControl
              label="휴가 유형"
              required
              value={type}
              onChange={setType}
              options={vacationTypes.map((t) => ({ value: t, label: typeLabel[t], disabled: balance[t] - pendingDays[t] <= 0 }))}
            />
            <SegmentedControl
              label="휴가 단위"
              required
              value={unit}
              onChange={(u) => {
                setUnit(u);
                if (u === 'full') setPeriod(null);
              }}
              options={vacationUnits.map((u) => ({ value: u, label: unitLabel[u] }))}
            />
            <SegmentedControl
              label="시간대"
              required={!isFullDay}
              disabled={isFullDay}
              value={isFullDay ? null : period}
              onChange={setPeriod}
              error={show('period', false)}
              options={dayPeriods.map((p) => ({ value: p, label: periodLabel[p] }))}
            />
          </section>

          <section className={styles.column} aria-labelledby="request-period-title">
            <Text as="h3" id="request-period-title" variant="heading-sm">
              휴가 기간 및 사유 입력
            </Text>
            <DateField
              label="휴가 시작일"
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
              label="휴가 종료일"
              required={isFullDay}
              value={endDate}
              min={start || todayISO()}
              disabled={!isFullDay}
              description={isFullDay ? undefined : `${unitLabel[unit]}는 하루만 신청할 수 있어요.`}
              onChange={setEnd}
              error={isFullDay ? show('end', Boolean(end)) : undefined}
            />
            <TextArea
              label="사유"
              placeholder="사유를 간단히 입력해 주세요."
              value={reason}
              maxLength={REASON_MAX}
              description={`${reason.length}/${REASON_MAX}`}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className={styles.group} aria-live="polite">
              <Text as="h4" variant="label-lg">
                승인 후 잔여 휴가
              </Text>
              <KeyValueList
                items={vacationTypes.map((t) => ({
                  label: typeLabel[t],
                  value:
                    t === type && days > 0 ? (
                      <>
                        {formatDays(after[t])}
                        <Text tone="danger">(-{formatDays(days)})</Text>
                      </>
                    ) : (
                      formatDays(balance[t])
                    ),
                }))}
              />
              {show('days', Boolean(start && endDate)) && (
                <Text as="p" role="alert" variant="body-md" tone="danger">
                  {errors.days}
                </Text>
              )}
            </div>
          </section>
        </div>
      </form>
    </Sheet>
  );
}
