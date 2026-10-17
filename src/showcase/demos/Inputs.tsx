import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { todayISO } from '@/lib/date';
import { Checkbox, CheckboxGroup, Chip, DateField, SegmentedControl, TextArea, TextField } from '@/components';
import { Demo, DemoGrid, PropMap, Section } from '../ui';

const box = { width: 'min(100%, 300px)' };

export function Inputs() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [unit, setUnit] = useState<'full' | 'half' | 'quarter'>('full');
  const [period, setPeriod] = useState<'am' | 'pm' | null>(null);
  const [checked, setChecked] = useState(true);
  const [types, setTypes] = useState<string[]>(['annual', 'sick']);
  const [chips, setChips] = useState<string[]>(['annual']);

  const dateError = date && date < todayISO() ? '오늘 이후 날짜를 골라 주세요.' : undefined;

  return (
    <>
      <Section
        id="text-field"
        title="TextField · TextArea · DateField"
        description="포커스, 입력됨, 오류는 실제 입력 상태에서 정해집니다. 오류 상태에서 포커스하면 빨간 2px 링이 보입니다."
      >
        <DemoGrid>
          <Demo label="기본 (입력해 보세요)">
            <div style={box}>
              <TextField label="Title" placeholder="Placeholder" description="Caption" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </Demo>
          <Demo label="입력됨">
            <div style={box}>
              <TextField label="Title" defaultValue="Label" description="Caption" />
            </div>
          </Demo>
          <Demo label="오류 (클릭해서 포커스)">
            <div style={box}>
              <TextField label="Title" placeholder="Placeholder" error="Caption" />
            </div>
          </Demo>
          <Demo label="필수 · disabled">
            <div style={box}>
              <TextField label="Title" required placeholder="Placeholder" disabled />
            </div>
          </Demo>
          <Demo label="trailingIcon (Select 모양)">
            <div style={box}>
              <TextField label="Title" placeholder="Placeholder" trailingIcon={<ChevronDown />} readOnly />
            </div>
          </Demo>
          <Demo label="DateField · 오늘 이전 고르면 오류">
            <div style={box}>
              <DateField label="휴가 시작일" required value={date} onChange={setDate} error={dateError} />
            </div>
          </Demo>
          <Demo label="TextArea" wide>
            <div style={{ width: 'min(100%, 480px)' }}>
              <TextArea
                label="사유"
                placeholder="사유를 간단히 입력해 주세요."
                value={reason}
                maxLength={200}
                description={`${reason.length}/200`}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ['hasTitle', 'label?: ReactNode', '값이 있으면 보인다'],
            ['showRequiredBadge', 'required', '빨간 점 + 스크린 리더용 "(필수)"'],
            ['hasCaption', 'description?: ReactNode', ''],
            ['isInvalid', 'error?: ReactNode', '오류 문구가 안내 문구를 대신하고 아이콘이 붙는다(색만으로 알리지 않음)'],
            ['isFocused', '(없음)', ':focus-within'],
            ['isFilled', '(없음)', 'value에서 결정'],
            ['(없음)', 'disabled', '빠져 있던 상태 추가'],
            ['outline 위치 제각각', 'inset box-shadow', '테두리가 바뀌어도 크기가 같다'],
          ]}
        />
      </Section>

      <Section
        id="segmented"
        title="SegmentedControl"
        description="하나만 고르는 버튼 묶음(휴가 종류·단위·시간대). 키보드 방향키로 이동할 수 있습니다."
      >
        <DemoGrid>
          <Demo label="필수" wide>
            <div style={{ width: 'min(100%, 400px)' }}>
              <SegmentedControl
                label="휴가 단위"
                required
                value={unit}
                onChange={setUnit}
                options={[
                  { value: 'full', label: '종일' },
                  { value: 'half', label: '반차' },
                  { value: 'quarter', label: '반반차' },
                ]}
              />
            </div>
          </Demo>
          <Demo label="그룹 disabled (종일이면 시간대 비활성)" wide>
            <div style={{ width: 'min(100%, 400px)' }}>
              <SegmentedControl
                label="시간대"
                required
                disabled={unit === 'full'}
                value={unit === 'full' ? null : period}
                onChange={setPeriod}
                error={unit !== 'full' && !period ? '시간대를 골라 주세요.' : undefined}
                options={[
                  { value: 'am', label: '오전' },
                  { value: 'pm', label: '오후' },
                ]}
              />
            </div>
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ['isActive', 'value === option.value', '선택은 하나만'],
            ['isDisabled', 'disabled / option.disabled', '그룹 전체 또는 항목별'],
          ]}
        />
      </Section>

      <Section id="checkbox" title="Checkbox · CheckboxGroup · Chip">
        <DemoGrid>
          <Demo label="Checkbox">
            <Checkbox label="연차" checked={checked} onChange={setChecked} />
            <Checkbox label="disabled" checked={false} onChange={() => {}} disabled />
          </Demo>
          <Demo label="CheckboxGroup">
            <CheckboxGroup
              legend="휴가 유형"
              value={types}
              onChange={setTypes}
              options={[
                { value: 'annual', label: '연차' },
                { value: 'sick', label: '병가' },
                { value: 'comp', label: '대휴' },
              ]}
            />
          </Demo>
          <Demo label="Chip (클릭)">
            {[
              ['annual', '연차'],
              ['sick', '병가'],
              ['comp', '대휴'],
            ].map(([v, l]) => (
              <Chip
                key={v}
                isSelected={chips.includes(v)}
                onClick={() => setChips((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]))}
              >
                {l}
              </Chip>
            ))}
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ['isSelected', 'checked', 'Checkbox'],
            ['(property 없음)', 'Chip isSelected', '선택 상태 추가'],
          ]}
        />
      </Section>
    </>
  );
}
