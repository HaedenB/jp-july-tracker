import { useEffect, useState } from "react";
import MonthPicker from "../components/MonthPicker";
import { getGoals, saveGoals } from "../db/queries";
import type { Goals } from "../db/schema";
import { currentMonth, shiftMonth } from "../lib/month";

const FIELDS: {
  key: keyof Omit<Goals, "month">;
  label: string;
  help: string;
}[] = [
  { key: "chars_target", label: "Characters read", help: "From ExStatic — VN/manga/EPUB combined." },
  { key: "reading_minutes_target", label: "Reading minutes", help: "From ExStatic time_read." },
  { key: "listening_minutes_target", label: "Listening minutes", help: "Manually logged." },
  { key: "pages_target", label: "Pages read", help: "Manually logged — physical books / manga pages." },
];

export default function GoalsPage() {
  const [month, setMonth] = useState<string>(currentMonth());
  const [goals, setGoalsState] = useState<Goals | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGoals(month).then((g) => {
      if (!cancelled) {
        setGoalsState(g);
        setSaved(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const update = (key: keyof Omit<Goals, "month">, value: number) => {
    if (!goals) return;
    setGoalsState({ ...goals, [key]: value });
    setSaved(false);
  };

  const save = async () => {
    if (!goals) return;
    await saveGoals(goals);
    setSaved(true);
  };

  const copyFromPrev = async () => {
    const prev = await getGoals(shiftMonth(month, -1));
    setGoalsState({ ...prev, month });
    setSaved(false);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Goals</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {goals && (
        <div className="card">
          <div className="grid grid-2">
            {FIELDS.map((f) => (
              <label key={f.key}>
                {f.label}
                <input
                  type="number"
                  min={0}
                  value={goals[f.key] || 0}
                  onChange={(e) => update(f.key, Number(e.target.value))}
                />
                <span style={{ fontSize: 12 }} className="muted">{f.help}</span>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
            <button className="primary" onClick={save}>Save targets</button>
            <button onClick={copyFromPrev}>Copy from previous month</button>
            {saved && <span style={{ color: "var(--good)" }}>Saved.</span>}
          </div>
        </div>
      )}
    </>
  );
}
