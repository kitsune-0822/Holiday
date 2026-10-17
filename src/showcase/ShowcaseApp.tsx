import { Logo, ScrollArea } from '@/components';
import { Actions } from './demos/Actions';
import { Additions } from './demos/Additions';
import { Data } from './demos/Data';
import { Display } from './demos/Display';
import { Foundations } from './demos/Foundations';
import { Inputs } from './demos/Inputs';
import { Navigation } from './demos/Navigation';
import { Overlay } from './demos/Overlay';
import { FrameView, Responsive, type FrameName } from './demos/Responsive';
import styles from './showcase.module.css';

const toc: Array<{ group: string; items: Array<[id: string, label: string]> }> = [
  {
    group: '토큰',
    items: [
      ['colors', '색상'],
      ['typography', '타이포그래피'],
      ['spacing', '간격 · 모서리 · 그림자'],
    ],
  },
  {
    group: '컴포넌트',
    items: [
      ['button', 'Button'],
      ['icon-button', 'IconButton'],
      ['button-group', 'ButtonGroup'],
      ['badge', 'Badge · CountBadge · Dot'],
      ['logo', 'Logo'],
      ['card', 'Card · Stat · KeyValue'],
      ['alert-item', 'AlertItem'],
      ['text-field', 'TextField · DateField'],
      ['segmented', 'SegmentedControl'],
      ['checkbox', 'Checkbox · Chip'],
      ['sidebar', 'NavItem · Sidebar'],
      ['data-table', 'FilterGrid · DataTable'],
      ['sheet', 'Sheet'],
      ['page-header', 'PageHeader'],
      ['avatar-tag', 'Avatar · Tag'],
      ['meter-callout', 'Meter · Callout'],
      ['toolbar-fields', 'Select · 검색 · 토스트'],
    ],
  },
  { group: '확인', items: [['responsive', '반응형 미리보기']] },
];

export function ShowcaseApp() {
  const frame = new URLSearchParams(window.location.search).get('frame') as FrameName | null;
  if (frame) return <FrameView frame={frame} />;

  return (
    <div className={styles.app} data-sheet-background>
      <ScrollArea className={styles.nav}>
      <nav className={styles.navInner} aria-label="쇼케이스 목차">
        <div className={styles.navTitle}>
          <Logo size="sm" />
          <span className="text-caption-md" style={{ color: 'var(--semantic-color-text-tertiary)' }}>
            컴포넌트 쇼케이스
          </span>
        </div>
        {toc.map((g) => (
          <div key={g.group}>
            <div className={`${styles.navGroup} text-caption-md`}>{g.group}</div>
            {g.items.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={`${styles.navLink} text-body-md`}>
                {label}
              </a>
            ))}
          </div>
        ))}
      </nav>
      </ScrollArea>
      <div className={styles.mobileNav}>
        <select
          className={styles.select}
          aria-label="섹션으로 이동"
          defaultValue=""
          onChange={(e) => {
            document.getElementById(e.target.value)?.scrollIntoView();
          }}
        >
          <option value="" disabled>
            섹션으로 이동
          </option>
          {toc.flatMap((g) =>
            g.items.map(([id, label]) => (
              <option key={id} value={id}>
                {g.group} · {label}
              </option>
            )),
          )}
        </select>
      </div>
      <main className={styles.main}>
        <header className={styles.intro}>
          <h1 className="text-display-md">Holiday 컴포넌트</h1>
          <p className="text-body-lg" style={{ color: 'var(--semantic-color-text-secondary)' }}>
            Figma 컴포넌트 리뷰에서 제안한 수정(property 이름·상태 구조·레이아웃)을 반영한 React 컴포넌트입니다. 각 섹션의 “Figma property → React
            prop”을 펼치면 무엇이 왜 바뀌었는지 볼 수 있습니다.
          </p>
        </header>
        <Foundations />
        <Actions />
        <Display />
        <Inputs />
        <Navigation />
        <Data />
        <Overlay />
        <Additions />
        <Responsive />
      </main>
    </div>
  );
}
