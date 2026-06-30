import Papa from "papaparse";
import type { ExstaticEntry } from "../db/schema";

export interface ParseResult {
  rows: ExstaticEntry[];
  skipped: number;
  errors: string[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function parseExstaticCsv(text: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows: ExstaticEntry[] = [];
        const errors: string[] = [];
        let skipped = 0;

        for (const r of res.data) {
          const uuid = str(r.uuid).trim();
          const date = str(r.date).trim();
          if (!uuid || !DATE_RE.test(date)) {
            skipped += 1;
            continue;
          }
          rows.push({
            uuid,
            name: str(r.name),
            type: str(r.type),
            date,
            chars_read: num(r.chars_read),
            lines_read: num(r.lines_read),
            time_read: num(r.time_read),
            read_speed: num(r.read_speed),
          });
        }

        if (res.errors.length > 0) {
          for (const e of res.errors.slice(0, 5)) errors.push(`row ${e.row}: ${e.message}`);
        }
        resolve({ rows, skipped, errors });
      },
    });
  });
}
