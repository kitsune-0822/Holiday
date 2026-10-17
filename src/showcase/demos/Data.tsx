import { useId, useMemo, useState } from 'react';
import {
  Badge,
  CheckboxGroup,
  DataTable,
  FilterDateRange,
  FilterField,
  FilterGrid,
  FilterRow,
  FilterTextInput,
  type DataTableColumn,
  type DateRange,
  type VacationStatus,
} from '@/components';
import { sampleRequests, type SampleRequest } from '../sampleData';
import { PropMap, Section } from '../ui';

export const requestColumns: DataTableColumn<SampleRequest>[] = [
  { key: 'id', header: 'ID', width: 'var(--semantic-size-control-lg)', render: (r) => r.id },
  { key: 'type', header: '휴가 유형', render: (r) => r.type },
  { key: 'unit', header: '휴가 단위', render: (r) => r.unit },
  { key: 'period', header: '시간대', render: (r) => r.period },
  { key: 'requestedAt', header: '신청일', width: 'var(--semantic-size-layout-column-sm)', render: (r) => r.requestedAt },
  { key: 'startDate', header: '휴가 시작일', width: 'var(--semantic-size-layout-column-sm)', render: (r) => r.startDate },
  { key: 'endDate', header: '휴가 종료일', width: 'var(--semantic-size-layout-column-sm)', render: (r) => r.endDate },
  { key: 'status', header: '상태', render: (r) => <Badge status={r.status} /> },
  { key: 'reason', header: '사유', width: 'var(--semantic-size-layout-column-md)', align: 'start', render: (r) => r.reason },
];

const all = <V extends string>(o: { value: V }[]) => o.map((x) => x.value);
const typeOptions = [
  { value: '연차', label: '연차' },
  { value: '병가', label: '병가' },
  { value: '대휴', label: '대휴' },
] as const;
const statusOptions: { value: VacationStatus; label: string }[] = [
  { value: 'approved', label: '승인' },
  { value: 'pending', label: '대기' },
  { value: 'rejected', label: '반려' },
];

/** 필터 + 표 예시. 반응형 미리보기에서도 쓴다. */
export function RequestTableExample() {
  const ids = { id: useId(), reason: useId() };
  const [id, setId] = useState('');
  const [reason, setReason] = useState('');
  const [types, setTypes] = useState<string[]>(all([...typeOptions]));
  const [statuses, setStatuses] = useState<VacationStatus[]>(all(statusOptions));
  const [requested, setRequested] = useState<DateRange>({ from: '', to: '' });

  const rows = useMemo(
    () =>
      sampleRequests.filter(
        (r) =>
          (!id || r.id.includes(id)) &&
          (!reason || r.reason.includes(reason)) &&
          types.includes(r.type) &&
          statuses.includes(r.status) &&
          (!requested.from || r.requestedAt >= requested.from) &&
          (!requested.to || r.requestedAt <= requested.to),
      ),
    [id, reason, types, statuses, requested],
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--semantic-spacing-lg)' }}>
      <FilterGrid>
        <FilterRow>
          <FilterField label="ID" htmlFor={ids.id}>
            <FilterTextInput id={ids.id} value={id} onChange={setId} />
          </FilterField>
        </FilterRow>
        <FilterRow>
          <FilterField label="휴가 유형">
            <CheckboxGroup legend="휴가 유형" hideLegend options={[...typeOptions]} value={types} onChange={setTypes} />
          </FilterField>
          <FilterField label="신청일">
            <FilterDateRange label="신청일" value={requested} onChange={setRequested} />
          </FilterField>
        </FilterRow>
        <FilterRow>
          <FilterField label="상태">
            <CheckboxGroup legend="상태" hideLegend options={statusOptions} value={statuses} onChange={setStatuses} />
          </FilterField>
          <FilterField label="사유" htmlFor={ids.reason}>
            <FilterTextInput id={ids.reason} value={reason} onChange={setReason} />
          </FilterField>
        </FilterRow>
      </FilterGrid>
      <DataTable
        caption="휴가 신청 내역"
        columns={requestColumns}
        rows={rows}
        getRowKey={(r) => r.id}
        mobileTitleKey="type"
        emptyMessage="조건에 맞는 휴가 신청이 없어요."
      />
    </div>
  );
}

export function Data() {
  return (
    <Section
      id="data-table"
      title="FilterGrid · DataTable"
      description="조건을 바꾸면 표가 바로 걸러집니다. 표는 좁아지면 가로로 스크롤되고, 모바일에서는 행마다 카드로 바뀝니다(아래 반응형 미리보기)."
    >
      <RequestTableExample />
      <PropMap
        rows={[
          ['셀 width 71·200 고정', 'columns[].width (선택)', '나머지 열은 남은 폭을 나눈다'],
          ['outlineOffset -0.5px', 'border-collapse 1px', '흐릿한 반 픽셀 테두리 제거'],
          ["data-type = 'text' / 'tag' / 'checkbox' / 'date'", 'columns[].render', '칸 종류를 property 대신 렌더 함수로'],
          ['(없음)', 'emptyMessage', '결과가 없을 때 안내'],
        ]}
      />
    </Section>
  );
}
