import { useState, useEffect, useCallback } from "react";
import { parseExstaticCsv } from "../csv/parseExstatic";
import { importExstaticRows, countExstaticEntries } from "../db/queries";
import type { ExstaticEntry } from "../db/schema";

export default function Import() {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{
    rows: ExstaticEntry[];
    skipped: number;
    errors: string[];
    fileName: string;
  } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [totalRows, setTotalRows] = useState<number | null>(null);

  useEffect(() => {
    countExstaticEntries().then(setTotalRows);
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setResult(null);
    setBusy(true);
    const text = await file.text();
    const parsed = await parseExstaticCsv(text);
    setPreview({ ...parsed, fileName: file.name });
    setBusy(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const commit = async () => {
    if (!preview) return;
    setBusy(true);
    const diff = await importExstaticRows(preview.rows);
    setResult(
      `Imported "${preview.fileName}" — ${diff.inserted} new, ${diff.updated} updated, ${diff.unchanged} unchanged.`,
    );
    setPreview(null);
    setBusy(false);
    setTotalRows(await countExstaticEntries());
  };

  const sample = preview?.rows.slice(0, 5) ?? [];

  return (
    <>
      <h1>Import ExStatic CSV</h1>
      <p className="muted">
        Export your stats from ExStatic (the CSV with <code>uuid,name,type,date,chars_read,…</code> columns) and drop
        it here. Re-importing the same file is safe — rows are deduped on <code>(uuid, date)</code>.
      </p>
      {totalRows !== null && (
        <p className="muted">
          <span className="pill">{totalRows.toLocaleString()} rows in local DB</span>
        </p>
      )}

      <div
        className={`drop ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p>Drop a CSV here, or</p>
        <label style={{ display: "inline-block" }}>
          <input type="file" accept=".csv,text/csv" onChange={onPick} style={{ display: "none" }} />
          <span className="pill" style={{ cursor: "pointer", padding: "8px 14px" }}>
            Choose file
          </span>
        </label>
      </div>

      {busy && <p className="muted">Working…</p>}

      {preview && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Preview — {preview.fileName}</h2>
          <p>
            <strong>{preview.rows.length}</strong> valid rows
            {preview.skipped > 0 ? `, ${preview.skipped} skipped` : ""}
            {preview.errors.length > 0 ? `, ${preview.errors.length} parser warnings` : ""}
          </p>
          {sample.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>date</th>
                  <th>name</th>
                  <th>type</th>
                  <th>chars</th>
                  <th>time (s)</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((r, i) => (
                  <tr key={i}>
                    <td>{r.date}</td>
                    <td>{r.name}</td>
                    <td>{r.type}</td>
                    <td>{r.chars_read.toLocaleString()}</td>
                    <td>{Math.round(r.time_read).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {preview.rows.length > sample.length && (
            <p className="muted">…and {preview.rows.length - sample.length} more.</p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="primary" disabled={busy || preview.rows.length === 0} onClick={commit}>
              Import {preview.rows.length} rows
            </button>
            <button onClick={() => setPreview(null)} disabled={busy}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="card" style={{ marginTop: 16, borderColor: "var(--good)" }}>
          {result}
        </div>
      )}
    </>
  );
}
