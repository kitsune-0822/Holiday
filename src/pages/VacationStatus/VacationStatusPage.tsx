import { ChevronDown, RotateCcw } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
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
  StatGroup,
  statusLabel,
  Text,
  type DataTableColumn,
} from '@/components';
import { upcomingGrant } from '@/data/mock';
import { formatDays } from '@/features/vacation/calc';
import { periodLabel, typeLabel, unitLabel, vacationTypes, type VacationRequest } from '@/features/vacation/types';
import { useVacation } from '@/features/vacation/VacationContext';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { daysBetween } from '@/features/vacation/calc';
import { todayISO } from '@/lib/date';
import { useRequestFilters } from './useRequestFilters';
import styles from './VacationStatusPage.module.css';

const RECENT_DAYS = 7;

const columns: DataTableColumn<VacationRequest>[] = [
  { key: 'id', header: 'ID', render: (r) => r.id },
  { key: 'type', header: '휴가 유형', render: (r) => typeLabel[r.type] },
  { key: 'unit', header: '휴가 단위', render: (r) => unitLabel[r.unit] },
  { key: 'period', header: '시간대', render: (r) => (r.period ? periodLabel[r.period] : '-') },
  { key: 'requestedAt', header: '신청일', render: (r) => r.requestedAt },
  { key: 'startDate', header: '휴가 시작일', render: (r) => r.startDate },
  { key: 'endDate', header: '휴가 종료일', render: (r) => r.endDate },
  { key: 'status', header: '상태', render: (r) => <Badge status={r.status} /> },
  { key: 'reason', header: '사유', align: 'start', width: 'var(--semantic-size-layout-filter-label)', render: (r) => r.reason || '-' },
];

const options = <K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));

export function VacationStatusPage() {
  useDocumentTitle('휴가 현황');
  const { requests, balance, pendingDays } = useVacation();
  const pendingTotal = vacationTypes.reduce((sum, t) => sum + pendingDays[t], 0);
  const { filters, rows, update, reset, activeCount } = useRequestFilters(requests);
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const location = useLocation();
  const ids = { id: useId(), reason: useId(), filters: useId(), results: useId() };

  // '남은 휴가' 메뉴: 잔여 휴가 카드로 이동
  useEffect(() => {
    if (location.hash !== '#balance') return;
    document.getElementById('balance')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [location.hash, location.key]);

  const recent = useMemo(() => {
    const today = todayISO();
    const list = requests.filter((r) => {
      const ago = daysBetween(r.requestedAt, today);
      return ago >= 0 && ago < RECENT_DAYS;
    });
    return (['pending', 'approved', 'rejected'] as const).map((s) => ({ label: statusLabel[s], value: `${list.filter((r) => r.status === s).length}건` }));
  }, [requests]);

  const showFilters = !isMobile || filtersOpen;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>휴가 현황</h1>

      <div className={styles.cards}>
        <Card title="신청한 휴가" description={`최근 ${RECENT_DAYS}일 내에 신청한 휴가 내역`}>
          <StatGroup items={recent} />
        </Card>
        <Card
          id="balance"
          title="잔여 휴가"
          description={pendingTotal > 0 ? `결재 대기 중인 ${formatDays(pendingTotal)}은 승인되면 빠져요` : undefined}
          tabIndex={-1} className={location.hash === '#balance' ? styles.highlight : undefined}>
          <StatGroup items={vacationTypes.map((t) => ({ label: typeLabel[t], value: formatDays(balance[t]) }))} />
        </Card>
        <Card title="지급 예정 휴가">
          <StatGroup items={vacationTypes.map((t) => ({ label: typeLabel[t], value: formatDays(upcomingGrant[t]) }))} />
        </Card>
      </div>

      <section className={styles.history} aria-labelledby={ids.results}>
        <div className={styles.historyHeader}>
          <h2 id={ids.results} className="text-heading-sm">
            신청 내역 <Text tone="tertiary" variant="title-lg">{rows.length}건</Text>
          </h2>
          <div className={styles.historyActions}>
            {isMobile && (
              <Button
                hierarchy="tertiary"
                size="sm"
                aria-expanded={filtersOpen}
                aria-controls={ids.filters}
                onClick={() => setFiltersOpen((o) => !o)}
                icon={<ChevronDown className={filtersOpen ? styles.flip : undefined} />}
              >
                검색 조건{activeCount ? ` ${activeCount}` : ''}
              </Button>
            )}
            {activeCount > 0 && (
              <Button hierarchy="tertiary" size="sm" icon={<RotateCcw />} onClick={reset}>
                초기화
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div id={ids.filters}>
            <FilterGrid>
              <FilterRow>
                <FilterField label="ID" htmlFor={ids.id}>
                  <FilterTextInput id={ids.id} value={filters.id} onChange={update('id')} />
                </FilterField>
              </FilterRow>
              <FilterRow>
                <FilterField label="휴가 유형">
                  <CheckboxGroup legend="휴가 유형" hideLegend options={options(typeLabel)} value={filters.types} onChange={update('types')} />
                </FilterField>
                <FilterField label="휴가 단위">
                  <CheckboxGroup legend="휴가 단위" hideLegend options={options(unitLabel)} value={filters.units} onChange={update('units')} />
                </FilterField>
                <FilterField label="시간대">
                  <CheckboxGroup legend="시간대" hideLegend options={options(periodLabel)} value={filters.periods} onChange={update('periods')} />
                </FilterField>
              </FilterRow>
              <FilterRow>
                <FilterField label="신청일">
                  <FilterDateRange label="신청일" value={filters.requestedAt} onChange={update('requestedAt')} />
                </FilterField>
                <FilterField label="휴가 시작일">
                  <FilterDateRange label="휴가 시작일" value={filters.startDate} onChange={update('startDate')} />
                </FilterField>
                <FilterField label="휴가 종료일">
                  <FilterDateRange label="휴가 종료일" value={filters.endDate} onChange={update('endDate')} />
                </FilterField>
              </FilterRow>
              <FilterRow>
                <FilterField label="상태">
                  <CheckboxGroup legend="상태" hideLegend options={options(statusLabel)} value={filters.statuses} onChange={update('statuses')} />
                </FilterField>
                <FilterField label="사유" htmlFor={ids.reason}>
                  <FilterTextInput id={ids.reason} value={filters.reason} onChange={update('reason')} />
                </FilterField>
              </FilterRow>
            </FilterGrid>
          </div>
        )}

        <DataTable
          caption="휴가 신청 내역"
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.id}
          mobileTitleKey="type"
          emptyMessage={
            <span className={styles.empty}>
              조건에 맞는 휴가 신청이 없어요.
              {activeCount > 0 && (
                <Button hierarchy="secondary" size="sm" onClick={reset}>
                  검색 조건 초기화
                </Button>
              )}
            </span>
          }
        />
      </section>
    </div>
  );
}
