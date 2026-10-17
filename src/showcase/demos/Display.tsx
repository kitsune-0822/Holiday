import { useState } from 'react';
import {
  AlertItem,
  Badge,
  Card,
  CountBadge,
  Dot,
  KeyValueList,
  Logo,
  SelectableCard,
  StatGroup,
  Text,
} from '@/components';
import { Demo, DemoGrid, PropMap, Section } from '../ui';

export function Display() {
  const [selected, setSelected] = useState<'annual' | 'sick'>('annual');
  const [count, setCount] = useState(4);

  return (
    <>
      <Section id="badge" title="Badge · CountBadge · Dot">
        <DemoGrid>
          <Demo label="Badge status">
            <Badge status="pending" />
            <Badge status="approved" />
            <Badge status="rejected" />
          </Demo>
          <Demo label={`CountBadge count=${count}`}>
            <CountBadge count={count} />
            <input
              type="range"
              min={0}
              max={150}
              value={count}
              aria-label="개수"
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </Demo>
          <Demo label="CountBadge 1 · 12 · 120(→99+)">
            <CountBadge count={1} />
            <CountBadge count={12} />
            <CountBadge count={120} />
          </Demo>
          <Demo label="Dot tone · size">
            <Dot tone="danger" size="sm" />
            <Dot tone="danger" size="md" />
            <Dot tone="primary" size="sm" />
            <Dot tone="primary" size="md" />
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ['type = approved / pending / rejected', "status = 'approved' | 'pending' | 'rejected'", '의미 기반 이름. Figma 표에서 승인·대기 글자가 뒤바뀌어 있던 것도 고쳤다'],
            ['알림 숫자 20×20 고정', 'min-width 20 + 좌우 padding', '두 자리 이상에서 넘치지 않는다. 99 초과는 99+'],
            ['tone = red', "tone = 'danger' | 'primary'", '색 이름 대신 의미'],
            ['size = small / medium', "size = 'sm' | 'md'", '크기 이름 통일'],
          ]}
        />
      </Section>

      <Section id="logo" title="Logo">
        <DemoGrid>
          <Demo label="md · showName">
            <Logo />
          </Demo>
          <Demo label="sm · showName">
            <Logo size="sm" />
          </Demo>
          <Demo label="sm · showName=false">
            <Logo size="sm" showName={false} />
          </Demo>
        </DemoGrid>
        <Text as="p" variant="body-md" tone="tertiary">
          Figma의 로고 도형은 자리표시자라서 임시 아이콘을 넣었습니다. 실제 로고 SVG를 주시면 바꿉니다.
        </Text>
      </Section>

      <Section id="card" title="Card · StatGroup · KeyValueList · SelectableCard">
        <DemoGrid>
          <Demo label="Card + description + StatGroup" wide>
            <Card title="신청한 휴가" description="최근 7일 내에 신청한 휴가 내역" style={{ width: 'min(100%, 560px)' }}>
              <StatGroup
                items={[
                  { label: '대기', value: '1건' },
                  { label: '승인', value: '1건' },
                  { label: '반려', value: '2건' },
                ]}
              />
            </Card>
          </Demo>
          <Demo label="KeyValueList">
            <div style={{ width: 'min(100%, 280px)' }}>
              <KeyValueList
                items={[
                  { label: '연차', value: '13.25일' },
                  { label: '병가', value: '30일' },
                  {
                    label: '대휴',
                    value: (
                      <>
                        10.25일<Text tone="danger">(-3일)</Text>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </Demo>
          <Demo label="SelectableCard (클릭)" wide>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--semantic-spacing-sm)', width: 'min(100%, 480px)' }}>
              <SelectableCard title="연차" description="13.25일 남음" isSelected={selected === 'annual'} onClick={() => setSelected('annual')} />
              <SelectableCard title="병가" description="30일 남음" isSelected={selected === 'sick'} onClick={() => setSelected('sick')} />
            </div>
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ['width 166 · height 229 고정 + minHeight 200', '폭 100% · 높이 hug · min-height 200', '내용에 맞춰 늘어난다'],
            ['빈 76px frame', 'children', '본문 slot'],
            ['hasSubtitle', 'description?: ReactNode', '값이 있으면 보인다'],
            ['(선택 카드 property 없음)', 'SelectableCard isSelected', '선택 = 2px 테두리 + 체크'],
          ]}
        />
      </Section>

      <Section id="alert-item" title="AlertItem" description="모바일에서는 시간이 본문 아래로 내려갑니다.">
        <DemoGrid>
          <Demo label="success" wide>
            <div style={{ width: 'min(100%, 752px)' }}>
              <AlertItem tone="success" title="10월 19일(월) ~ 10월 23일(금) 연차가 승인되었습니다." message="윤호님, 여행 잘 다녀오세요!" time="3시간 전" />
            </div>
          </Demo>
          <Demo label="danger" wide>
            <div style={{ width: 'min(100%, 752px)' }}>
              <AlertItem tone="danger" title="10월 26일(월) 연차가 반려되었습니다." message="윤호님, 이 날은 반드시 부탁드리고 싶은 일이 있어요." time="3시간 전" />
            </div>
          </Demo>
        </DemoGrid>
      </Section>
    </>
  );
}
