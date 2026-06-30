import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface ExstaticEntry {
  uuid: string;
  name: string;
  type: string;
  date: string;
  chars_read: number;
  lines_read: number;
  time_read: number;
  read_speed: number;
}

export type ManualKind = "listening" | "pages";

export interface ManualEntry {
  id?: number;
  date: string;
  kind: ManualKind;
  minutes?: number;
  pages?: number;
  source?: string;
  note?: string;
}

export interface Goals {
  month: string;
  chars_target: number;
  reading_minutes_target: number;
  listening_minutes_target: number;
  pages_target: number;
}

interface JpTrackerSchema extends DBSchema {
  exstatic_entries: {
    key: [string, string];
    value: ExstaticEntry;
    indexes: { "by-date": string };
  };
  manual_entries: {
    key: number;
    value: ManualEntry;
    indexes: { "by-date": string; "by-kind": string };
  };
  goals: {
    key: string;
    value: Goals;
  };
}

let dbPromise: Promise<IDBPDatabase<JpTrackerSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<JpTrackerSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<JpTrackerSchema>("jp-tracker", 1, {
      upgrade(db) {
        const ex = db.createObjectStore("exstatic_entries", {
          keyPath: ["uuid", "date"],
        });
        ex.createIndex("by-date", "date");

        const manual = db.createObjectStore("manual_entries", {
          keyPath: "id",
          autoIncrement: true,
        });
        manual.createIndex("by-date", "date");
        manual.createIndex("by-kind", "kind");

        db.createObjectStore("goals", { keyPath: "month" });
      },
    });
  }
  return dbPromise;
}
