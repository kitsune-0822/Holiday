// design-system/design-tokens.json(Figma variables 형식)을 CSS 변수와 타이포그래피 클래스로 변환한다.
// 실행: npm run tokens
//
// 변수 이름은 토큰 경로를 '-'로 이은 것이라 Figma Dev Mode가 내보내는 이름과 같다.
//   semantic.color.text.primary → --semantic-color-text-primary
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const read = (p) => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const write = (p, text) => writeFileSync(new URL(p, root), text);

const doc = read('design-system/design-tokens.json');
const HEADER = '/* 자동 생성 파일입니다. 직접 고치지 말고 `npm run tokens`를 실행하세요. */\n';
const FONT_FALLBACK = {
  Pretendard:
    "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
  'JetBrains Mono': "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};

const isToken = (node) => node && typeof node === 'object' && '$type' in node;
const varName = (path) => `--${path.join('-')}`;

function walk(node, path, out) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (isToken(child)) out.push({ path: [...path, key], token: child });
    else walk(child, [...path, key], out);
  }
  return out;
}

// 숫자 토큰의 단위는 경로로 정한다. Figma는 단위 없이 숫자만 저장한다.
function numberToCss(value, path) {
  const has = (k) => path.includes(k);
  if (has('opacity')) return String(value / 100);
  if (has('weight') || has('font-weight') || has('z-index')) return String(value);
  if (has('duration')) return `${value}ms`;
  return `${value}px`;
}

function colorToCss({ components, alpha, hex }) {
  if (alpha === 1) return hex;
  const [r, g, b] = components.map((c) => Math.round(c * 255));
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

function valueToCss({ $type, $value }, path) {
  if (typeof $value === 'string' && $value.startsWith('{')) {
    return `var(${varName($value.slice(1, -1).split('.'))})`;
  }
  if ($type === 'color') return colorToCss($value);
  if ($type === 'number') return numberToCss($value, path);
  if (path.includes('family')) return FONT_FALLBACK[$value] ?? `'${$value}'`;
  return $value;
}

const tokens = walk(doc, [], []);
const lines = tokens.map(({ path, token }) => `  ${varName(path)}: ${valueToCss(token, path)};`);

// 그림자: elevation(크기)과 color.shadow(색)를 합친 box-shadow 값
const elevations = Object.keys(doc.semantic.elevation);
for (const level of elevations) {
  lines.push(
    `  --semantic-shadow-${level}: 0 var(--semantic-elevation-${level}-y) var(--semantic-elevation-${level}-blur) var(--semantic-color-shadow-${level});`,
  );
}

write('src/styles/tokens.css', `${HEADER}:root {\n${lines.join('\n')}\n}\n`);

// 타이포그래피: semantic.typography.<group>.<size> → .text-<group>-<size>
const typography = doc.semantic.typography;
const variants = [];
const classes = [];
for (const [group, sizes] of Object.entries(typography)) {
  for (const size of Object.keys(sizes)) {
    const name = `${group}-${size}`;
    const base = `--semantic-typography-${name}`;
    variants.push(name);
    classes.push(
      `.text-${name} {\n` +
        `  font-family: var(${base}-font-family);\n` +
        `  font-size: var(${base}-font-size);\n` +
        `  line-height: var(${base}-line-height);\n` +
        `  font-weight: var(${base}-font-weight);\n` +
        `  letter-spacing: var(${base}-letter-spacing);\n` +
        `}`,
    );
  }
}
write('src/styles/typography.css', `${HEADER}${classes.join('\n\n')}\n`);

// TS에서 쓰는 값: 타이포그래피 이름 목록, 브레이크포인트
const bp = Object.fromEntries(
  Object.entries(doc.semantic.breakpoint).map(([k, t]) => {
    const ref = t.$value.slice(1, -1).split('.');
    return [k, ref.reduce((n, key) => n[key], doc).$value];
  }),
);
write(
  'src/styles/tokens.ts',
  `${HEADER}export const typographyVariants = ${JSON.stringify(variants, null, 2)} as const;\n\n` +
    `export type TypographyVariant = (typeof typographyVariants)[number];\n\n` +
    `/** 이 너비 이상이면 해당 레이아웃. 모바일은 tablet 미만. */\n` +
    `export const breakpoints = ${JSON.stringify(bp)} as const;\n`,
);

console.log(
  `tokens: ${tokens.length} vars, ${variants.length} text styles → ${fileURLToPath(new URL('src/styles/', root))}`,
);
