import { Plus, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonGroup, IconButton, type ButtonHierarchy, type ButtonSize } from '@/components';
import { Demo, DemoGrid, Playground, PropMap, Section, SelectControl, TextControl, ToggleControl } from '../ui';

const hierarchies = ['primary', 'secondary', 'tertiary'] as const;
const sizes = ['sm', 'md', 'lg'] as const;

export function Actions() {
  const [hierarchy, setHierarchy] = useState<ButtonHierarchy>('primary');
  const [size, setSize] = useState<ButtonSize>('md');
  const [withIcon, setWithIcon] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [label, setLabel] = useState('휴가 신청하기');
  const [clicks, setClicks] = useState(0);

  return (
    <>
      <Section
        id="button"
        title="Button"
        description="hover·pressed는 배경색만 바뀌고 크기는 그대로입니다. 마우스를 올리고 눌러서 폭이 변하지 않는지 확인해 주세요."
      >
        <Playground
          preview={
            <div style={{ width: fullWidth ? '100%' : undefined, display: 'grid', gap: 'var(--semantic-spacing-xs)', justifyItems: 'center' }}>
              <Button
                hierarchy={hierarchy}
                size={size}
                icon={withIcon ? <Plus /> : undefined}
                disabled={disabled}
                fullWidth={fullWidth}
                onClick={() => setClicks((c) => c + 1)}
              >
                {label}
              </Button>
              <span className="text-caption-md" style={{ color: 'var(--semantic-color-text-tertiary)' }} aria-live="polite">
                클릭 {clicks}회
              </span>
            </div>
          }
          controls={
            <>
              <SelectControl label="hierarchy" value={hierarchy} options={hierarchies} onChange={setHierarchy} />
              <SelectControl label="size" value={size} options={sizes} onChange={setSize} />
              <TextControl label="children" value={label} onChange={setLabel} />
              <ToggleControl label="icon" checked={withIcon} onChange={setWithIcon} />
              <ToggleControl label="disabled" checked={disabled} onChange={setDisabled} />
              <ToggleControl label="fullWidth" checked={fullWidth} onChange={setFullWidth} />
            </>
          }
        />
        <DemoGrid>
          {hierarchies.map((h) =>
            sizes.map((s) => (
              <Demo key={h + s} label={`${h} · ${s}`}>
                <Button hierarchy={h} size={s} icon={<Plus />}>
                  Label
                </Button>
              </Demo>
            )),
          )}
          {hierarchies.map((h) => (
            <Demo key={h + 'd'} label={`${h} · disabled`}>
              <Button hierarchy={h} disabled icon={<Plus />}>
                Label
              </Button>
            </Demo>
          ))}
        </DemoGrid>
        <PropMap
          rows={[
            ['hierachy', 'hierarchy', '오타 수정'],
            ['size = small / regular / (padding 16)', "size = 'sm' | 'md' | 'lg'", '높이 40 / 48 / 56. 세 번째 크기에 이름을 붙였다'],
            ['state = default / hover / pressed', '(없음)', ':hover, :active로 처리. pressed 축소(0.95)를 없애 폭이 변하지 않는다'],
            ['isDisabled', 'disabled', 'state와 겹치던 조합(disabled+hover 등) 제거'],
            ['showIcon', 'icon?: ReactNode', '아이콘을 넘기면 보인다'],
            ['showLabel = false', 'IconButton', '아이콘만 있는 버튼은 별도 컴포넌트'],
            ['label 굵기 400', 'label-lg (500)', '본문과 구분'],
          ]}
        />
      </Section>

      <Section id="icon-button" title="IconButton" description="아이콘만 있는 버튼. 화면에 글자가 없으므로 label(스크린 리더 이름)이 필수입니다.">
        <DemoGrid>
          {(['subtle', 'ghost', 'primary'] as const).map((v) =>
            sizes.map((s) => (
              <Demo key={v + s} label={`${v} · ${s}`}>
                <IconButton variant={v} size={s} label="닫기" icon={v === 'primary' ? <Plus /> : v === 'ghost' ? <Settings /> : <X />} />
              </Demo>
            )),
          )}
          <Demo label="disabled">
            <IconButton label="닫기" icon={<X />} disabled />
          </Demo>
        </DemoGrid>
        <PropMap
          rows={[
            ['(프레임, property 없음)', 'IconButton', 'component set으로 정의'],
            ['pressed = scale 0.95', ':active 배경색', '소수 px 제거'],
          ]}
        />
      </Section>

      <Section id="button-group" title="ButtonGroup" description="시트 하단 버튼 묶음. horizontal은 같은 폭으로 나눕니다.">
        <DemoGrid>
          <Demo label="horizontal" wide>
            <div style={{ width: 'min(100%, 480px)' }}>
              <ButtonGroup>
                <Button hierarchy="tertiary">닫기</Button>
                <Button>3일 신청하기</Button>
              </ButtonGroup>
            </div>
          </Demo>
          <Demo label="vertical" wide>
            <div style={{ width: 'min(100%, 320px)' }}>
              <ButtonGroup direction="vertical">
                <Button>3일 신청하기</Button>
                <Button hierarchy="tertiary">닫기</Button>
              </ButtonGroup>
            </div>
          </Demo>
        </DemoGrid>
      </Section>
    </>
  );
}
