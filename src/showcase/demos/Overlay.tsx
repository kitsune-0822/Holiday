import { useState } from 'react';
import {
  AlertItem,
  Button,
  ButtonGroup,
  DateField,
  KeyValueList,
  SegmentedControl,
  Sheet,
  Text,
  TextArea,
} from '@/components';
import { PropMap, Section } from '../ui';

/** 휴가 신청 시트 모양 예시 (실제 계산·제출은 페이지 단계에서 구현) */
export function RequestSheetExample({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<'annual' | 'sick' | 'comp'>('annual');
  const [unit, setUnit] = useState<'full' | 'half' | 'quarter'>('full');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="휴가 신청하기"
      showDismissButton={false}
      footer={
        <ButtonGroup>
          <Button hierarchy="tertiary" onClick={onClose}>
            닫기
          </Button>
          <Button onClick={onClose}>3일 신청하기</Button>
        </ButtonGroup>
      }
    >
      <div style={{ display: 'grid', gap: 'var(--semantic-spacing-lg)' }}>
        <Text as="h3" variant="heading-sm">
          휴가 종류 선택
        </Text>
        <KeyValueList
          items={[
            { label: '연차', value: '13.25일' },
            { label: '병가', value: '30일' },
            { label: '대휴', value: '3일' },
          ]}
        />
        <SegmentedControl
          label="휴가 유형"
          required
          value={type}
          onChange={setType}
          options={[
            { value: 'annual', label: '연차' },
            { value: 'sick', label: '병가' },
            { value: 'comp', label: '대휴' },
          ]}
        />
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
        <DateField label="휴가 시작일" required value={start} onChange={setStart} />
        <DateField label="휴가 종료일" required value={end} onChange={setEnd} min={start || undefined} />
        <TextArea label="사유" placeholder="사유를 간단히 입력해 주세요." />
      </div>
    </Sheet>
  );
}

export function AlertsSheetExample({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="알림">
      <div style={{ display: 'grid', gap: 'var(--semantic-spacing-lg)' }}>
        <AlertItem tone="success" title="10월 19일(월) ~ 10월 23일(금) 연차가 승인되었습니다." message="윤호님, 여행 잘 다녀오세요!" time="3시간 전" />
        <AlertItem tone="danger" title="10월 26일(월) 연차가 반려되었습니다." message="윤호님, 이 날은 반드시 부탁드리고 싶은 일이 있어요." time="3시간 전" />
      </div>
    </Sheet>
  );
}

export function Overlay() {
  const [request, setRequest] = useState(false);
  const [alerts, setAlerts] = useState(false);
  return (
    <Section
      id="sheet"
      title="Sheet"
      description={
        <>
          태블릿·데스크탑에서는 가운데 다이얼로그, 모바일(767px 이하)에서는 iOS 스타일 bottom sheet로 열립니다. 브라우저 폭을 줄이거나 아래
          반응형 미리보기의 휴대폰 화면에서 열어 보세요. 모바일에서는 손잡이·제목 영역을 아래로 끌어 닫을 수 있습니다. Esc·배경 클릭으로도 닫힙니다.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--semantic-spacing-xs)' }}>
        <Button onClick={() => setRequest(true)}>휴가 신청 시트 열기</Button>
        <Button hierarchy="tertiary" onClick={() => setAlerts(true)}>
          알림 시트 열기
        </Button>
      </div>
      <RequestSheetExample open={request} onClose={() => setRequest(false)} />
      <AlertsSheetExample open={alerts} onClose={() => setAlerts(false)} />
      <PropMap
        rows={[
          ['hasDissmissButton', 'showDismissButton', '오타 수정'],
          ['hasDescription', 'description?: ReactNode', ''],
          ['hasHeader / hasFooter', 'title (필수) / footer?: ReactNode', '제목 없는 다이얼로그는 접근성상 허용하지 않는다'],
          ['헤더 width 332 고정', '폭 100%', '닫기 버튼이 오른쪽 끝에 붙는다'],
          ['빈 222px frame', 'children', '본문 slot. 길면 본문만 스크롤'],
        ]}
      />
    </Section>
  );
}
