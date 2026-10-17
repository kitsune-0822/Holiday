import tokens from '../../../design-system/design-tokens.json';
import { typographyVariants } from '@/styles/tokens';
import styles from '../showcase.module.css';
import { Section } from '../ui';

type Node = Record<string, unknown>;
const isToken = (n: unknown): n is { $type: string; $value: unknown } => !!n && typeof n === 'object' && '$type' in (n as Node);

function leaves(node: Node, path: string[] = []): Array<{ path: string[]; value: unknown }> {
  return Object.entries(node).flatMap(([k, v]) => {
    if (k.startsWith('$')) return [];
    if (isToken(v)) return [{ path: [...path, k], value: v.$value }];
    return leaves(v as Node, [...path, k]);
  });
}

const semantic = tokens.semantic as unknown as Node;
const colorGroups = Object.entries(semantic.color as Node);
const typo = semantic.typography as Record<string, Record<string, Record<string, { $value: string }>>>;

function resolve(ref: string): unknown {
  const node = ref
    .slice(1, -1)
    .split('.')
    .reduce<unknown>((n, k) => (n as Node)[k], tokens);
  return isToken(node) ? node.$value : undefined;
}

export function Foundations() {
  return (
    <>
      <Section id="colors" title="색상" description="semantic 토큰만 보여줍니다. 컴포넌트는 primitive를 직접 쓰지 않습니다.">
        {colorGroups.map(([group, node]) => (
          <div key={group}>
            <h3 className="text-title-md" style={{ marginBottom: 'var(--semantic-spacing-xs)' }}>
              color.{group}
            </h3>
            <div className={styles.swatches}>
              {leaves(node as Node, ['semantic', 'color', group]).map(({ path, value }) => {
                const name = `--${path.join('-')}`;
                const primitive = String(value).slice(1, -1).replace('primitive.color.', '');
                return (
                  <div key={name} className={styles.swatch}>
                    <span className={styles.chip} style={{ background: `var(${name})` }} />
                    <span className={styles.swatchText}>
                      <span className="text-label-md">{path.slice(3).join('.')}</span>
                      <code title={name}>{primitive}</code>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Section>

      <Section
        id="typography"
        title="타이포그래피"
        description={
          <>
            CSS 클래스 <code>.text-&lt;이름&gt;</code> 또는 <code>&lt;Text variant&gt;</code>로 씁니다. 값은 Pretendard 기준입니다.
          </>
        }
      >
        <div>
          {typographyVariants.map((name) => {
            const [group, size] = name.split('-') as [string, string];
            const t = typo[group][size];
            const v = (k: string) => resolve(t[k].$value);
            return (
              <div key={name} className={styles.typeRow}>
                <div className={styles.typeMeta}>
                  <span className="text-label-md" style={{ color: 'var(--semantic-color-text-primary)' }}>
                    {name}
                  </span>
                  <span className="text-caption-md">
                    {String(v('font-size'))}/{String(v('line-height'))} · {String(v('font-weight'))}
                    {v('letter-spacing') ? ` · ${String(v('letter-spacing'))}px` : ''}
                  </span>
                </div>
                <span className={`text-${name}`}>{group === 'code' ? 'const days = 3;' : '휴가 신청하기 Holiday 2026'}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="spacing" title="간격 · 모서리 · 그림자" description="간격은 모두 4의 배수입니다.">
        <h3 className="text-title-md">spacing</h3>
        <div className={styles.scale}>
          {leaves(semantic.spacing as Node, ['semantic', 'spacing']).map(({ path, value }) => (
            <div key={path.join('-')} className={styles.scaleItem}>
              <span className={styles.spaceBar} style={{ width: `var(--${path.join('-')})`, height: 32, minWidth: 1 }} />
              <span className="text-caption-md">
                {path.at(-1)} · {String(resolve(String(value)))}
              </span>
            </div>
          ))}
        </div>
        <h3 className="text-title-md">radius</h3>
        <div className={styles.scale}>
          {['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full', 'button', 'card', 'sheet', 'badge'].map((k) => (
            <div key={k} className={styles.scaleItem}>
              <span className={styles.radiusBox} style={{ borderRadius: `var(--semantic-radius-${k})` }} />
              <span className="text-caption-md">{k}</span>
            </div>
          ))}
        </div>
        <h3 className="text-title-md">shadow (elevation + color.shadow)</h3>
        <div className={styles.scale} style={{ gap: 'var(--semantic-spacing-xl)', padding: 'var(--semantic-padding-lg)' }}>
          {['sm', 'md', 'lg'].map((k) => (
            <div key={k} className={styles.scaleItem}>
              <span className={styles.shadowBox} style={{ boxShadow: `var(--semantic-shadow-${k})` }} />
              <span className="text-caption-md">{k}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
