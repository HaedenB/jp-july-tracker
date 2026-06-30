import { getDB, type ExstaticEntry, type Goals, type ManualEntry } from "./schema";
import { monthRange } from "../lib/month";

export interface MonthlyTotals {
  chars_read: number;
  reading_minutes: number;
  listening_minutes: number;
  pages: number;
}

export interface DailyPoint {
  date: string;
  chars_read: number;
  reading_minutes: number;
  listening_minutes: number;
  pages: number;
}

export async function monthlyTotals(month: string): Promise<MonthlyTotals> {
  const { start, end } = monthRange(month);
  const db = await getDB();
  const totals: MonthlyTotals = {
    chars_read: 0,
    reading_minutes: 0,
    listening_minutes: 0,
    pages: 0,
  };

  const exRange = IDBKeyRange.bound(start, end);
  for (const e of await db.getAllFromIndex("exstatic_entries", "by-date", exRange)) {
    totals.chars_read += e.chars_read || 0;
    totals.reading_minutes += (e.time_read || 0) / 60;
  }

  for (const m of await db.getAllFromIndex("manual_entries", "by-date", exRange)) {
    if (m.kind === "listening") totals.listening_minutes += m.minutes || 0;
    if (m.kind === "pages") totals.pages += m.pages || 0;
  }

  return totals;
}

export async function dailyTotals(month: string): Promise<DailyPoint[]> {
  const { start, end, days } = monthRange(month);
  const db = await getDB();

  const points: Record<string, DailyPoint> = {};
  for (const d of days) {
    points[d] = { date: d, chars_read: 0, reading_minutes: 0, listening_minutes: 0, pages: 0 };
  }

  const exRange = IDBKeyRange.bound(start, end);
  for (const e of await db.getAllFromIndex("exstatic_entries", "by-date", exRange)) {
    const p = points[e.date];
    if (!p) continue;
    p.chars_read += e.chars_read || 0;
    p.reading_minutes += (e.time_read || 0) / 60;
  }
  for (const m of await db.getAllFromIndex("manual_entries", "by-date", exRange)) {
    const p = points[m.date];
    if (!p) continue;
    if (m.kind === "listening") p.listening_minutes += m.minutes || 0;
    if (m.kind === "pages") p.pages += m.pages || 0;
  }

  return days.map((d) => points[d]);
}

export async function getGoals(month: string): Promise<Goals> {
  const db = await getDB();
  const g = await db.get("goals", month);
  return (
    g ?? {
      month,
      chars_target: 0,
      reading_minutes_target: 0,
      listening_minutes_target: 0,
      pages_target: 0,
    }
  );
}

export async function saveGoals(g: Goals): Promise<void> {
  const db = await getDB();
  await db.put("goals", g);
}

export async function listGoalMonths(): Promise<string[]> {
  const db = await getDB();
  return (await db.getAllKeys("goals")) as string[];
}

export interface ImportDiff {
  inserted: number;
  updated: number;
  unchanged: number;
}

export async function importExstaticRows(rows: ExstaticEntry[]): Promise<ImportDiff> {
  const db = await getDB();
  const tx = db.transaction("exstatic_entries", "readwrite");
  const store = tx.objectStore("exstatic_entries");
  let inserted = 0;
  let updated = 0;
  let unchanged = 0;
  for (const row of rows) {
    const existing = await store.get([row.uuid, row.date]);
    if (!existing) {
      inserted += 1;
    } else if (
      existing.chars_read === row.chars_read &&
      existing.time_read === row.time_read &&
      existing.lines_read === row.lines_read
    ) {
      unchanged += 1;
      continue;
    } else {
      updated += 1;
    }
    await store.put(row);
  }
  await tx.done;
  return { inserted, updated, unchanged };
}

export async function addManualEntry(entry: ManualEntry): Promise<number> {
  const db = await getDB();
  return (await db.add("manual_entries", entry)) as number;
}

export async function listManualEntries(month: string): Promise<ManualEntry[]> {
  const { start, end } = monthRange(month);
  const db = await getDB();
  return await db.getAllFromIndex("manual_entries", "by-date", IDBKeyRange.bound(start, end));
}

export async function deleteManualEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.delete("manual_entries", id);
}

export async function countExstaticEntries(): Promise<number> {
  const db = await getDB();
  return await db.count("exstatic_entries");
}
