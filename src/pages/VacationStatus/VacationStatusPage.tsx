import { ChevronDown, RotateCcw } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CheckboxGroup,
  DataTable,
  FilterDateRange,
  FilterField,
  FilterGrid,
  FilterRow,
  FilterTextInput,
  PageHeader,
  StatGroup,
  Text,
  type DataTableColumn,
} from '@/components';
import { upcomingGrant } from '@/data/mock';
import { dayPeriods, vacationTypes, vacationUnits, type VacationRequest } from '@/features/vacation/types';
import { useVacation } from '@/features/vacation/VacationContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { daysBetween } from '@/features/vacation/calc';
import { useI18n, type Formatters, type Messages } from '@/i18n';
import { todayISO } from '@/lib/date';
import { useRequestFilters } from './useRequestFilters';
import styles from './VacationStatusPage.module.css';

const RECENT_DAYS = 7;

function columnsFor(m: Messages, f: Formatters): DataTableColumn<VacationRequest>[] {
  const c = m.status.columns;
  return [
    { key: 'id', header: c.id, align: 'end', render: (r) => r.id },
    { key: 'type', header: c.type, align: 'start', render: (r) => m.vacation.types[r.type] },
    { key: 'unit', header: c.unit, align: 'start', render: (r) => m.vacation.units[r.unit] },
    { key: 'period', header: c.period, align: 'start', render: (r) => (r.period ? m.vacation.periods[r.period] : '-') },
    { key: 'requestedAt', header: c.requestedAt, align: 'start', render: (r) => f.date(r.requestedAt) },
    { key: 'startDate', header: c.startDate, align: 'start', render: (r) => f.date(r.startDate) },
    { key: 'endDate', header: c.endDate, align: 'start', render: (r) => f.date(r.endDate) },
    { key: 'status', header: c.status, render: (r) => <Badge status={r.status} /> },
    { key: 'reason', header: c.reason, align: 'start', width: 'var(--semantic-size-layout-column-md)', render: (r) => r.reason || '-' },
  ];
}

const options = <K extends string>(keys: readonly K[], labels: Record<K, string>) => keys.map((value) => ({ value, label: labels[value] }));
const statuses = ['pending', 'approved', 'rejected'] as const;

export function VacationStatusPage() {
  const { m, f } = useI18n();
  useDocumentTitle(m.status.title);
  const c = m.status.columns;
  const { requests, balance, pendingDays } = useVacation();
  const pendingTotal = vacationTypes.reduce((sum, t) => sum + pendingDays[t], 0);
  const { filters, rows, update, reset, activeCount } = useRequestFilters(requests);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const ids = { id: useId(), reason: useId(), filters: useId(), results: useId() };

  const recent = useMemo(() => {
    const today = todayISO();
    const list = requests.filter((r) => {
      const ago = daysBetween(r.requestedAt, today);
      return ago >= 0 && ago < RECENT_DAYS;
    });
    return statuses.map((s) => ({ label: m.vacation.status[s], value: m.common.count(list.filter((r) => r.status === s).length) }));
  }, [requests, m]);

  return (
    <div className={styles.page}>
      <PageHeader title={m.status.title} />

      <div className={styles.cards}>
        <Card title={m.status.requested} description={m.status.recent(RECENT_DAYS)}>
          <StatGroup items={recent} />
        </Card>
        <Card
          id="balance"
          title={m.status.balance}
          description={pendingTotal > 0 ? m.status.balancePending(f.days(pendingTotal)) : undefined}
        >
          <StatGroup items={vacationTypes.map((t) => ({ label: m.vacation.types[t], value: f.days(balance[t]) }))} />
        </Card>
        <Card title={m.status.upcoming}>
          <StatGroup items={vacationTypes.map((t) => ({ label: m.vacation.types[t], value: f.days(upcomingGrant[t]) }))} />
        </Card>
      </div>

      <section className={styles.history} aria-labelledby={ids.results}>
        <div className={styles.historyHeader}>
          <h2 id={ids.results} className="text-heading-sm">
            {m.status.history} <Text tone="tertiary" variant="title-lg">{m.common.count(rows.length)}</Text>
          </h2>
          <div className={styles.historyActions}>
            {/* 기본은 접어서 첫 화면에 표가 보이게 한다. 조건을 바꾸면 버튼에 개수가 남는다 */}
            <Button
              hierarchy="tertiary"
              size="sm"
              aria-expanded={filtersOpen}
              aria-controls={ids.filters}
              onClick={() => setFiltersOpen((o) => !o)}
              icon={<ChevronDown className={filtersOpen ? styles.flip : undefined} />}
            >
              {activeCount ? m.status.filtersCount(activeCount) : m.status.filters}
            </Button>
            {activeCount > 0 && (
              <Button hierarchy="tertiary" size="sm" icon={<RotateCcw />} onClick={reset}>
                {m.common.reset}
              </Button>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div id={ids.filters}>
            <FilterGrid>
              <FilterRow>
                <FilterField label={c.id} htmlFor={ids.id}>
                  <FilterTextInput id={ids.id} value={filters.id} onChange={update('id')} />
                </FilterField>
              </FilterRow>
              <FilterRow>
                <FilterField label={c.type}>
                  <CheckboxGroup legend={c.type} hideLegend options={options(vacationTypes, m.vacation.types)} value={filters.types} onChange={update('types')} />
                </FilterField>
                <FilterField label={c.unit}>
                  <CheckboxGroup legend={c.unit} hideLegend options={options(vacationUnits, m.vacation.units)} value={filters.units} onChange={update('units')} />
                </FilterField>
                <FilterField label={c.period}>
                  <CheckboxGroup legend={c.period} hideLegend options={options(dayPeriods, m.vacation.periods)} value={filters.periods} onChange={update('periods')} />
                </FilterField>
              </FilterRow>
              <FilterRow>
                <FilterField label={c.requestedAt}>
                  <FilterDateRange label={c.requestedAt} value={filters.requestedAt} onChange={update('requestedAt')} />
                </FilterField>
                <FilterField label={c.startDate}>
                  <FilterDateRange label={c.startDate} value={filters.startDate} onChange={update('startDate')} />
                </FilterField>
                <FilterField label={c.endDate}>
                  <FilterDateRange label={c.endDate} value={filters.endDate} onChange={update('endDate')} />
                </FilterField>
              </FilterRow>
              <FilterRow>
                <FilterField label={c.status}>
                  <CheckboxGroup legend={c.status} hideLegend options={options(statuses, m.vacation.status)} value={filters.statuses} onChange={update('statuses')} />
                </FilterField>
                <FilterField label={c.reason} htmlFor={ids.reason}>
                  <FilterTextInput id={ids.reason} value={filters.reason} onChange={update('reason')} />
                </FilterField>
              </FilterRow>
            </FilterGrid>
          </div>
        )}

        <DataTable
          caption={m.status.caption}
          columns={columnsFor(m, f)}
          rows={rows}
          getRowKey={(r) => r.id}
          mobileTitleKey="type"
          emptyMessage={
            <span className={styles.empty}>
              {m.status.empty}
              {activeCount > 0 && (
                <Button hierarchy="secondary" size="sm" onClick={reset}>
                  {m.status.resetFilters}
                </Button>
              )}
            </span>
          }
        />
      </section>
    </div>
  );
}
