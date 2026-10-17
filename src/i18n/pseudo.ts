import type { Messages } from './messages/ko';

const ACCENTS: Record<string, string> = {
  a: 'á', b: 'ƀ', c: 'ç', d: 'ð', e: 'é', f: 'ƒ', g: 'ĝ', h: 'ĥ', i: 'î', j: 'ĵ', k: 'ķ', l: 'ļ', m: 'ɱ',
  n: 'ñ', o: 'ö', p: 'þ', q: 'ǫ', r: 'ŕ', s: 'š', t: 'ţ', u: 'û', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ž',
  A: 'Å', B: 'Ɓ', C: 'Ç', D: 'Ð', E: 'É', F: 'Ƒ', G: 'Ĝ', H: 'Ĥ', I: 'Î', J: 'Ĵ', K: 'Ķ', L: 'Ļ', M: 'Ṁ',
  N: 'Ñ', O: 'Ö', P: 'Þ', Q: 'Ǫ', R: 'Ŕ', S: 'Š', T: 'Ţ', U: 'Û', V: 'Ṽ', W: 'Ŵ', X: 'Ẋ', Y: 'Ý', Z: 'Ž',
};

/**
 * 의사 번역: 글자를 악센트 문자로 바꾸고 30% 늘린 뒤 괄호로 감싼다.
 * - 번역이 길어졌을 때 잘리거나 넘치는 곳
 * - 번역 파일을 거치지 않고 코드에 박힌 문구(괄호가 없다)
 * 를 화면에서 바로 찾기 위한 개발 도구.
 */
export function pseudoString(text: string): string {
  const accented = text.replace(/[A-Za-z]/g, (ch) => ACCENTS[ch] ?? ch);
  const pad = '·'.repeat(Math.ceil(text.length * 0.3));
  return `⟦${accented}${pad}⟧`;
}

function transform(value: unknown): unknown {
  if (typeof value === 'string') return pseudoString(value);
  if (typeof value === 'function') return (...args: unknown[]) => pseudoString(String(value(...args)));
  if (Array.isArray(value)) return value.map(transform);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, transform(v)]));
  }
  return value;
}

/** meta(언어 태그 등)와 요일 이름은 날짜 계산에 쓰이므로 그대로 둔다 */
export function pseudoMessages(m: Messages): Messages {
  const out = transform(m) as Messages;
  return { ...out, meta: m.meta };
}
