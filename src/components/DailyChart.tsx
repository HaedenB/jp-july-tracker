import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyPoint } from "../db/queries";

interface Props {
  data: DailyPoint[];
  metric: "chars_read" | "reading_minutes" | "listening_minutes" | "pages";
  color: string;
  label: string;
}

export default function DailyChart({ data, metric, color, label }: Props) {
  const chartData = data.map((d) => ({
    day: d.date.slice(8),
    value: Math.round(d[metric] * 100) / 100,
  }));
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{label} — daily</h2>
      <div style={{ height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
            <XAxis dataKey="day" tick={{ fill: "#8a909a", fontSize: 11 }} />
            <YAxis tick={{ fill: "#8a909a", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: "#181b22", border: "1px solid #2a2f3a" }}
              labelStyle={{ color: "#e6e8eb" }}
            />
            <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
