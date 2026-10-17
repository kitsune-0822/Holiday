import { cx } from '@/lib/cx';
import styles from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  /** sm 24 · md 32 · lg 40 · xl 56 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 같은 사람은 늘 같은 색이 되도록 id를 넘긴다. 비우면 이름으로 정한다. */
  colorKey?: string;
  className?: string;
}

const TONES = 6;

function toneOf(key: string) {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return (hash % TONES) + 1;
}

/** 한글 이름은 끝 두 글자(민준), 로마자 이름은 머리글자(YP) */
function initialsOf(name: string) {
  const words = name.trim().split(/\s+/);
  if (/^[A-Za-z]/.test(name) && words.length > 1) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  return name.slice(-2);
}

/** 이름 글자를 보여주는 원형 아바타. 이름은 옆에 따로 쓰므로 장식으로 숨긴다. */
export function Avatar({ name, size = 'md', colorKey, className }: AvatarProps) {
  return (
    <span data-component="Avatar"
      className={cx(styles.avatar, styles[size], `text-label-${size === 'xl' ? 'lg' : 'sm'}`, className)}
      style={{ background: `var(--semantic-color-avatar-${toneOf(colorKey ?? name)})` }}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
