import { useEffect, useState } from "react";
import MonthPicker from "../components/MonthPicker";
import GoalCard from "../components/GoalCard";
import DailyChart from "../components/DailyChart";
import { dailyTotals, getGoals, monthlyTotals, type DailyPoint, type MonthlyTotals } from "../db/queries";
import type { Goals } from "../db/schema";
import { currentMonth, daysRemainingInMonth } from "../lib/month";
import { formatChars, formatInt, formatMinutes } from "../lib/format";

export default function Dashboard() {
  const [month, setMonth] = useState<string>(currentMonth());
  const [totals, setTotals] = useState<MonthlyTotals | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [t, g, d] = await Promise.all([monthlyTotals(month), getGoals(month), dailyTotals(month)]);
      if (cancelled) return;
      setTotals(t);
      setGoals(g);
      setDaily(d);
    })();
    return () => {
      cancelled = true;
    };
  }, [month]);

  const daysLeft = daysRemainingInMonth(month);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>
      <p className="muted">
        {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in the month` : "Month complete"}
      </p>

      {totals && goals && (
        <div className="grid grid-2">
          <GoalCard
            title="Characters read"
            current={totals.chars_read}
            target={goals.chars_target}
            daysRemaining={daysLeft}
            formatValue={formatChars}
          />
          <GoalCard
            title="Reading time"
            current={totals.reading_minutes}
            target={goals.reading_minutes_target}
            daysRemaining={daysLeft}
            formatValue={formatMinutes}
          />
          <GoalCard
            title="Listening time"
            current={totals.listening_minutes}
            target={goals.listening_minutes_target}
            daysRemaining={daysLeft}
            formatValue={formatMinutes}
          />
          <GoalCard
            title="Pages read"
            current={totals.pages}
            target={goals.pages_target}
            daysRemaining={daysLeft}
            formatValue={formatInt}
          />
        </div>
      )}

      <h2>Daily breakdown</h2>
      <div className="grid grid-2">
        <DailyChart data={daily} metric="chars_read" color="#ff7a59" label="Characters" />
        <DailyChart data={daily} metric="reading_minutes" color="#5b9dff" label="Reading minutes" />
        <DailyChart data={daily} metric="listening_minutes" color="#4ad97a" label="Listening minutes" />
        <DailyChart data={daily} metric="pages" color="#ffb454" label="Pages" />
      </div>
    </>
  );
}
