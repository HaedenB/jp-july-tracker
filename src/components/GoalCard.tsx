interface Props {
  title: string;
  current: number;
  target: number;
  daysRemaining: number;
  formatValue: (n: number) => string;
  unit?: string;
}

export default function GoalCard({ title, current, target, daysRemaining, formatValue, unit }: Props) {
  const hasTarget = target > 0;
  const pct = hasTarget ? Math.min(100, (current / target) * 100) : 0;
  const remaining = Math.max(0, target - current);
  const perDay = daysRemaining > 0 ? remaining / daysRemaining : remaining;

  const onPace = hasTarget && pct >= (1 - daysRemaining / 31) * 100;
  const cls = !hasTarget ? "" : pct >= 100 ? "good" : onPace ? "warn" : "";

  return (
    <div className="card goal">
      <div className="goal-head">
        <span className="goal-title">{title}</span>
        <span className="goal-value">{formatValue(current)}</span>
      </div>
      <div className={`bar ${cls}`}>
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-head">
        <span className="goal-target">
          {hasTarget ? `Target: ${formatValue(target)}${unit ?? ""}` : "No target set"}
        </span>
        <span className="goal-pace">
          {hasTarget
            ? pct >= 100
              ? "Goal hit!"
              : daysRemaining === 0
                ? `Short by ${formatValue(remaining)}`
                : `${formatValue(perDay)}/day to finish`
            : ""}
        </span>
      </div>
    </div>
  );
}
