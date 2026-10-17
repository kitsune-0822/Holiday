import { ScrollArea } from "@/components";
import { type Member, type TeamLeave } from "@/features/approvals/types";
import {
  kindOf,
  leaveLabel,
  periodText,
  type WeekRow,
} from "@/features/approvals/logic";
import { useI18n } from "@/i18n";
import { cx } from "@/lib/cx";
import { addDaysISO, isWeekend } from "@/lib/date";
import styles from "./WeekTimeline.module.css";

interface WeekTimelineProps {
  weekStart: string;
  today: string;
  rows: WeekRow[];
  /** 그날 승인된 휴가 인원 */
  countOn: (day: string) => number;
  onOpen: (leave: TeamLeave) => void;
}

/** 이번 주 휴가 타임라인. 하루를 오전·오후 두 칸으로 나눠 반차를 반 칸으로 그린다. */
export function WeekTimeline({
  weekStart,
  today,
  rows,
  countOn,
  onOpen,
}: WeekTimelineProps) {
  const { m: tx, f } = useI18n();
  const t = tx.approvals;
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const dayIndex = (iso: string) => days.indexOf(iso);
  const clamp = (iso: string) =>
    iso < days[0] ? 0 : iso > days[6] ? 6 : dayIndex(iso);

  const span = (l: TeamLeave) => {
    let from = clamp(l.startDate) * 2 + 1;
    let to = (clamp(l.endDate) + 1) * 2 + 1;
    if (l.unit !== "full" && l.period === "am") to = from + 1;
    if (l.unit !== "full" && l.period === "pm") from += 1;
    return { from, to };
  };

  /** 한 사람의 휴가가 겹치면 같은 칸에 포개지지 않도록 줄(lane)을 나눈다 */
  const layout = (leaves: TeamLeave[]) => {
    const laneEnds: number[] = [];
    const bars = [...leaves]
      .map((l) => ({ l, ...span(l) }))
      .sort((a, b) => a.from - b.from)
      .map((b) => {
        let lane = laneEnds.findIndex((end) => end <= b.from);
        if (lane === -1) lane = laneEnds.push(0) - 1;
        laneEnds[lane] = b.to;
        return { ...b, lane };
      });
    return { bars, lanes: Math.max(1, laneEnds.length) };
  };

  const dayClass = (d: string) =>
    cx(isWeekend(d) && styles.weekend, d === today && styles.today);

  return (
    <ScrollArea
      axis="x"
      viewportProps={{
        tabIndex: 0,
        role: "region",
        "aria-label": t.weekRegion,
      }}
    >
      <div className={styles.week}>
        <div className={cx(styles.row, styles.head)}>
          <div className={styles.label} />
          {days.map((d) => {
            const n = countOn(d);
            return (
              <div key={d} className={cx(styles.day, dayClass(d))}>
                <span className="text-caption-md">
                  {f.weekday(d)}
                  {d === today && ` · ${tx.common.today}`}
                </span>
                <b className="text-title-md">{Number(d.slice(8))}</b>
                <span
                  className={cx(
                    styles.count,
                    n > 0 && styles.has,
                    "text-caption-sm",
                  )}
                >
                  {n ? tx.common.people(n) : "–"}
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.body}>
          <div className={styles.cols} aria-hidden="true">
            {days.map((d) => (
              <div key={d} className={dayClass(d)} />
            ))}
          </div>
          {rows.length === 0 && (
            <p className={cx(styles.empty, "text-body-md")}>{t.weekEmpty}</p>
          )}
          {rows.map(({ member, leaves }) => {
            const { bars, lanes } = layout(leaves);
            return (
              <div key={member.id} className={styles.row}>
                <Person member={member} />
                <div
                  className={styles.track}
                  style={{
                    gridTemplateRows: `repeat(${lanes}, var(--semantic-size-control-xs))`,
                  }}
                >
                  {bars.map(({ l, from, to, lane }) => {
                    const gridColumn = `${from} / ${to}`;
                    const gridRow = String(lane + 1);
                    const wide = to - from > 1;
                    const pending = l.status === "pending";
                    const label = leaveLabel(l, tx);
                    const title = t.barTitle(
                      member.name,
                      label,
                      periodText(l, tx, f),
                      pending,
                    );
                    // 이 주 밖으로 이어지면 그쪽 모서리를 각지게 해서 계속됨을 보여준다
                    const className = cx(
                      styles.bar,
                      styles[kindOf(l)],
                      pending && styles.pending,
                      l.startDate < days[0] && styles.continuesBefore,
                      l.endDate > days[6] && styles.continuesAfter,
                      "text-label-sm",
                    );
                    return pending ? (
                      <button
                        key={l.id}
                        type="button"
                        className={className}
                        style={{ gridColumn, gridRow }}
                        title={title}
                        aria-label={t.barOpen(title)}
                        onClick={() => onOpen(l)}
                      >
                        {wide && label}
                      </button>
                    ) : (
                      <div
                        key={l.id}
                        className={className}
                        style={{ gridColumn, gridRow }}
                        title={title}
                      >
                        <span className="visually-hidden">{title}</span>
                        {wide && <span aria-hidden="true">{label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

function Person({ member }: { member: Member }) {
  return (
    <div className={styles.person}>
      <span className={cx(styles.name, "text-label-md")}>{member.name}</span>
    </div>
  );
}
