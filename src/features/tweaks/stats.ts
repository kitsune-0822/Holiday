import * as components from '@/components';
import tokens from '../../../design-system/design-tokens.json';
import { localeList } from '@/i18n';
import { typographyVariants } from '@/styles/tokens';

function countTokens(node: unknown): number {
  if (!node || typeof node !== 'object') return 0;
  if ('$type' in node) return 1;
  return Object.entries(node).reduce((n, [k, v]) => (k.startsWith('$') ? n : n + countTokens(v)), 0);
}

/** 패널에 보여줄 규모 (빌드 시점의 실제 값) */
export const projectStats = {
  components: Object.entries(components).filter(([name, v]) => /^[A-Z]/.test(name) && typeof v === 'function' && !name.endsWith('Provider')).length,
  tokens: countTokens(tokens),
  locales: localeList.length,
  textStyles: typographyVariants.length,
};
