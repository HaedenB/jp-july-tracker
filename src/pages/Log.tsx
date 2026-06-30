import { useEffect, useState } from "react";
import MonthPicker from "../components/MonthPicker";
import { addManualEntry, deleteManualEntry, listManualEntries } from "../db/queries";
import type { ManualEntry, ManualKind } from "../db/schema";
import { currentMonth, todayISO } from "../lib/month";
import { formatInt, formatMinutes } from "../lib/format";

export default function Log() {
  const [month, setMonth] = useState<string>(currentMonth());
  const [entries, setEntries] = useState<ManualEntry[]>([]);
  const [date, setDate] = useState<string>(todayISO());
  const [kind, setKind] = useState<ManualKind>("listening");
  const [amount, setAmount] = useState<number>(30);
  const [source, setSource] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const refresh = async (m: string) => {
    setEntries(await listManualEntries(m));
  };

  useEffect(() => {
    refresh(month);
  }, [month]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry: ManualEntry = {
      date,
      kind,
      source: source || undefined,
      note: note || undefined,
    };
    if (kind === "listening") entry.minutes = amount;
    else entry.pages = amount;
    await addManualEntry(entry);
    setAmount(kind === "listening" ? 30 : 10);
    setSource("");
    setNote("");
    refresh(month);
  };

  const remove = async (id?: number) => {
    if (id === undefined) return;
    await deleteManualEntry(id);
    refresh(month);
  };

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Manual log</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>
      <p className="muted">
        Listening time and pages read don't come from ExStatic. Log them here.
      </p>

      <form className="card" onSubmit={submit}>
        <div className="row">
          <label>
            Kind
            <select value={kind} onChange={(e) => setKind(e.target.value as ManualKind)}>
              <option value="listening">Listening</option>
              <option value="pages">Pages</option>
            </select>
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            {kind === "listening" ? "Minutes" : "Pages"}
            <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </label>
          <label>
            Source (optional)
            <input
              type="text"
              placeholder={kind === "listening" ? "podcast, anime…" : "book title, manga…"}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </label>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <label style={{ flex: "1 1 100%" }}>
            Note (optional)
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="primary" type="submit">Add entry</button>
        </div>
      </form>

      <h2>This month — {sorted.length} entries</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Kind</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Source</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ padding: 16, textAlign: "center" }}>
                  No manual entries for this month yet.
                </td>
              </tr>
            )}
            {sorted.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td><span className="pill">{e.kind}</span></td>
                <td style={{ textAlign: "right" }}>
                  {e.kind === "listening" ? formatMinutes(e.minutes ?? 0) : formatInt(e.pages ?? 0)}
                </td>
                <td>{e.source ?? ""}</td>
                <td className="muted">{e.note ?? ""}</td>
                <td style={{ textAlign: "right" }}>
                  <button onClick={() => remove(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
