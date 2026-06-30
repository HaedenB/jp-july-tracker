# JP July Tracker

A local-first web app for tracking Japanese immersion progress against monthly goals.

- **Reading stats** are imported from [ExStatic](https://github.com/KamWithK/exSTATic) CSV exports (VN / ttu-reader / Mokuro).
- **Listening time** and **pages read** are entered manually.
- **Monthly goals** are tracked for: characters read, reading time, listening time, pages.

All data lives in your browser (IndexedDB) — no backend, no account.

## Stack

Vite + React + TypeScript. Charts via Recharts, CSV via PapaParse, dates via date-fns, storage via `idb`.

## Develop

```bash
npm install
npm run dev
```

Open the printed URL.

## Build

```bash
npm run build
npm run preview
```

`dist/` is a static bundle — deployable to GitHub Pages, Netlify, Cloudflare Pages, etc.

## Using it

1. **Goals** page — set this month's targets (chars, reading minutes, listening minutes, pages). "Copy from previous month" speeds up rollovers.
2. **Import ExStatic** — export `exSTATic_stats.csv` from the extension (Settings → Export), drop it on the import page, review the preview, click Import. Re-importing the same file is idempotent (dedup by `uuid + date`).
3. **Log** — record listening sessions and pages read as you go.
4. **Dashboard** — see progress bars with per-day pace needed and a daily bar chart for each metric.
