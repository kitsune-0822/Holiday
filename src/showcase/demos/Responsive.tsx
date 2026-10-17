import { useState } from 'react';
import { Button, Text } from '@/components';
import styles from '../showcase.module.css';
import { Section } from '../ui';
import { RequestTableExample } from './Data';
import { SidebarExample } from './Navigation';
import { AlertsSheetExample, RequestSheetExample } from './Overlay';

export type FrameName = 'sheet' | 'table' | 'sidebar';

const devices = [
  { name: '모바일 390×780', width: 390, height: 780 },
  { name: '태블릿 834×700', width: 834, height: 700 },
];

function Frame({ frame, width, height, label }: { frame: FrameName; width: number; height: number; label: string }) {
  return (
    <div className={styles.frame}>
      <iframe src={`?frame=${frame}`} title={`${label} 미리보기`} width={width} height={height} loading="lazy" />
      <span className={`${styles.frameLabel} text-caption-md`}>{label}</span>
    </div>
  );
}

export function Responsive() {
  return (
    <Section
      id="responsive"
      title="반응형 미리보기"
      description="같은 컴포넌트를 실제 기기 폭의 iframe으로 띄웠습니다. 안에서 직접 눌러 볼 수 있습니다. (모바일 < 768 ≤ 태블릿 < 1280 ≤ 데스크탑)"
    >
      <Text as="h3" variant="title-lg">
        Sheet — 모바일은 iOS bottom sheet
      </Text>
      <div className={styles.frames}>
        {devices.map((d) => (
          <Frame key={d.name} frame="sheet" {...d} label={d.name} />
        ))}
      </div>
      <Text as="h3" variant="title-lg">
        FilterGrid · DataTable — 모바일은 카드
      </Text>
      <div className={styles.frames}>
        {devices.map((d) => (
          <Frame key={d.name} frame="table" {...d} label={d.name} />
        ))}
      </div>
      <Text as="h3" variant="title-lg">
        Sidebar — 태블릿은 접힌 상태로 시작
      </Text>
      <div className={styles.frames}>
        <Frame frame="sidebar" width={834} height={700} label="태블릿 834×700" />
      </div>
    </Section>
  );
}

/** iframe 안에서 보여줄 단독 화면 */
export function FrameView({ frame }: { frame: FrameName }) {
  const [request, setRequest] = useState(false);
  const [alerts, setAlerts] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  if (frame === 'sidebar') {
    return (
      <div className={styles.frameRootFlush} style={{ display: 'flex', height: '100dvh' }}>
        <SidebarExample collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <div className={styles.sidebarFill} />
      </div>
    );
  }

  if (frame === 'table') {
    return (
      <div className={styles.frameRoot}>
        <RequestTableExample />
      </div>
    );
  }

  return (
    <>
      <div className={styles.frameRoot} data-sheet-background>
        <div style={{ display: 'grid', gap: 'var(--semantic-spacing-sm)' }}>
          <Text as="h1" variant="heading-lg">
            휴가 현황
          </Text>
          <Text as="p" tone="secondary">
            버튼을 눌러 시트를 열어 보세요. 모바일에서는 손잡이를 아래로 끌면 닫힙니다.
          </Text>
          <Button onClick={() => setRequest(true)}>휴가 신청하기</Button>
          <Button hierarchy="tertiary" onClick={() => setAlerts(true)}>
            알림 보기
          </Button>
        </div>
      </div>
      <RequestSheetExample open={request} onClose={() => setRequest(false)} />
      <AlertsSheetExample open={alerts} onClose={() => setAlerts(false)} />
    </>
  );
}
