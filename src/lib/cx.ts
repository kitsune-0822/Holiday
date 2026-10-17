/** 조건부 className 합치기. falsy 값은 버린다. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(' ');
}
