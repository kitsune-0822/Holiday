import { cx } from '@/lib/cx';
import styles from './Meter.module.css';

export interface MeterSegment {
  value: number;
  /** strong: 이미 쓴 양 / light: 이번에 더해질 양 */
  tone: 'strong' | 'light';
}

export interface MeterProps {
  max: number;
  segments: MeterSegment[];
  /** 막대가 뜻하는 바를 글로 (예: '15일 중 6일 사용, 이번 신청 3일') */
  label: string;
  className?: string;
}

/** 전체 중 얼마를 썼는지 보여주는 가로 막대 */
export function Meter({ max, segments, label, className }: MeterProps) {
  let used = 0;
  return (
    <div data-component="Meter" className={cx(styles.track, className)} role="img" aria-label={label}>
      {segments.map((s, i) => {
        const width = Math.max(0, Math.min(100 - used, (s.value / max) * 100));
        used += width;
        return <span key={i} className={styles[s.tone]} style={{ width: `${width}%` }} />;
      })}
    </div>
  );
}
