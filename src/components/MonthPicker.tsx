import { monthLabel, shiftMonth } from "../lib/month";

interface Props {
  value: string;
  onChange: (month: string) => void;
}

export default function MonthPicker({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onChange(shiftMonth(value, -1))} aria-label="previous month">←</button>
      <strong style={{ minWidth: 140, textAlign: "center" }}>{monthLabel(value)}</strong>
      <button onClick={() => onChange(shiftMonth(value, 1))} aria-label="next month">→</button>
    </div>
  );
}
