import { locales, localeList, type Locale } from '@/i18n';

export interface L10nRow {
  key: string;
  /** 변수가 들어가는 문장(함수)인지 */
  dynamic: boolean;
  values: Record<Locale, string | undefined>;
}

/** 함수 메시지는 예시 값을 넣어 실제 문장으로 보여준다 */
function sample(fn: (...args: unknown[]) => unknown): string {
  const attempts: unknown[][] = [
    Array.from({ length: fn.length }, () => 3),
    Array.from({ length: fn.length }, (_, i) => `{${i}}`),
  ];
  for (const args of attempts) {
    try {
      const out = String(fn(...args));
      if (!/NaN|undefined/.test(out)) return out;
    } catch {
      // 다음 예시로
    }
  }
  return 'ƒ(…)';
}

function flatten(node: unknown, prefix: string, out: Map<string, { dynamic: boolean; value: string }>) {
  if (typeof node === 'string') out.set(prefix, { dynamic: false, value: node });
  else if (typeof node === 'function') out.set(prefix, { dynamic: true, value: sample(node as (...a: unknown[]) => unknown) });
  else if (Array.isArray(node)) node.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  else if (node && typeof node === 'object')
    Object.entries(node).forEach(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k, out));
}

/** 모든 언어의 메시지를 키 하나에 한 줄로 펼친다. 원본(ko)의 키 순서를 따른다. */
export function buildRows(): L10nRow[] {
  const maps = Object.fromEntries(
    localeList.map((l) => {
      const map = new Map<string, { dynamic: boolean; value: string }>();
      flatten(locales[l], '', map);
      return [l, map];
    }),
  ) as Record<Locale, Map<string, { dynamic: boolean; value: string }>>;
  return [...maps.ko.keys()]
    .filter((k) => !k.startsWith('meta.'))
    .map((key) => ({
      key,
      dynamic: maps.ko.get(key)!.dynamic,
      values: Object.fromEntries(localeList.map((l) => [l, maps[l].get(key)?.value])) as Record<Locale, string | undefined>,
    }));
}

/** 원문보다 이만큼 길면 넘침 위험으로 표시한다 */
export const LONG_RATIO = 2;

/** 화면에서 차지하는 폭 (한글·한자·가나는 로마자 두 글자 폭) */
function displayWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += /[\u1100-\u11FF\u3040-\u30FF\u3130-\u318F\u4E00-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]/.test(ch) ? 2 : 1;
  return w;
}

/** 원문 대비 화면 폭 비율. 넘침 위험을 찾는 데 쓴다. */
export function lengthRatio(row: L10nRow, l: Locale): number {
  const src = displayWidth(row.values.ko ?? '');
  const v = displayWidth(row.values[l] ?? '');
  return src ? v / src : 0;
}

/** 번역됨 = 값이 있고, 원문과 다르거나 숫자·기호뿐인 짧은 값 */
export function isTranslated(row: L10nRow, l: Locale): boolean {
  const v = row.values[l];
  if (v === undefined) return false;
  if (l === 'ko') return true;
  return v !== row.values.ko || !/[가-힣]/.test(v);
}

export function coverage(rows: L10nRow[], l: Locale) {
  const done = rows.filter((r) => isTranslated(r, l)).length;
  return { done, total: rows.length, percent: Math.round((done / rows.length) * 100) };
}

export function toJson(rows: L10nRow[]): string {
  const out = Object.fromEntries(localeList.map((l) => [l, Object.fromEntries(rows.map((r) => [r.key, r.values[l] ?? null]))]));
  return JSON.stringify(out, null, 2);
}

export function toCsv(rows: L10nRow[]): string {
  const esc = (v: string | undefined) => `"${(v ?? '').replaceAll('"', '""')}"`;
  return '﻿' + [['key', ...localeList].map(esc).join(','), ...rows.map((r) => [r.key, ...localeList.map((l) => r.values[l])].map(esc).join(','))].join('\n');
}

export function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
