# Shetkari Mitra

Usable React/Vite demo for sugarcane irrigation workflows. Farmer and officer activity uses versioned browser localStorage. Feedback and `/teacher` responses use the existing Turso database.

## Run and verify

Requires Node 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
pnpm build
pnpm test
```

The development port defaults to 8443. Browser tests use installed Google Chrome and automatically start a preview of the production build when port 8443 is free. Run `pnpm build` before tests; set `TEST_BASE_URL` to test a deployment instead.

## Deployment

Deploy the repository to Vercel with project name `sdtia`, Vite framework, build command `pnpm run build`, and output `dist`. `vercel.json` supplies SPA rewrites so all deep links work on refresh. The intended production URL is https://sdtia.vercel.app.

```sh
vercel login
vercel link --project sdtia
vercel --prod
```

## Working flows

- `/farmer`: switch between Ramesh's two fields, read status and officer notes, change EN/Marathi language, and play advice.
- `/farmer/pump`: sample grid and night-slot controls, persistent automation, manual pump start/stop, runtime and estimated energy. While open, a running sample pump increases moisture 1% every 10 seconds and shuts off at its configured limit. Reloading stops sample pumps; settings persist.
- `/farmer/voice`: field-aware local answers through text or browser speech recognition; browser speech synthesis reads responses. Recognition availability and Marathi voices depend on the browser. No AI API is required.
- `/farmer/reports`: monthly recorded readings and PDF summaries.
- `/officer`: actual counts from the seven sample plots, plot-specific diagnostics, filters, selectable schematic parcels, dated visits, advice logs, shutoff thresholds, PDF/CSV reports.
- `/data`: export/import activity JSON, recover unreadable saved data, or reset demo activity. Reset does not touch Turso feedback.
- `/feedback` and `/teacher`: existing shared Turso feedback submission, review, search, rating filters and CSV export.

Sample sensor readings, forecasts, grid power, energy estimates and recovery grades illustrate the idea. No physical motor, sensor feed or official mill certification is connected. Local activity is scoped to one browser/origin, with updates shared across tabs; preview and production URLs have separate storage. Clear browser data to remove it, or back up at `/data`.

The inherited Turso credential is still used for feedback as requested. It already exists in repository history. Rotate it if it should no longer be accessible to clients.
