# Musosoup Feedback Dashboard

Read-only proof-of-concept dashboard over the Musosoup Reviews Google Sheet.
React + Vite frontend, a single Netlify Function as a thin data-access layer
that reads the sheet via a Google service account. No login, no write-back —
this is a sign-off POC for a fuller version that will add actions and a
second data source.

## How it fits together

```
Browser  --GET /api/reviews-->  Netlify Function  --Sheets API-->  Reviews tab
  |
  filters, KPIs, charts, table all computed client-side from one fetch
```

- The function fetches the whole sheet once per request and returns
  normalized JSON. The frontend fetches it once on load and does all
  filtering, KPI, and chart computation client-side (`src/utils`), so
  changing a filter is instant — no rebuild, no refetch.
- `netlify/functions/lib/reviewsRepository.js` is the only code that talks to
  the Sheets API. `netlify/functions/reviews.js` is a thin GET handler over
  it. A future write endpoint (e.g. `PATCH /api/reviews/:id` to update
  Status) would be a new handler file plus a new repository function —
  it wouldn't require touching either of these.

## Sheet columns

`netlify/functions/lib/reviewFields.js` is the single source of truth for
column order. The Reviews tab is expected to have, in order: Date Posted,
Reviewer Name, Star Rating, Review Text, Review URL, Review ID, Needs
Action, Status, Assigned To, Date Contacted, Notes, Outcome, Suggested
Reply.

## Setup

1. `npm install`
2. Create/reuse a Google Cloud service account with **read-only** access to
   the Sheets API, and share the target spreadsheet with its
   `client_email` (Viewer access).
3. Provide credentials as environment variables — copy `.env.example` to
   `.env` for local dev, and set the same variables in the Netlify site's
   **Environment variables** for deploys. Never commit a credentials file.
   Either:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — the full service account JSON as one
     line, or
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` (with literal
     `\n` line breaks in the key).
4. Optional overrides: `GOOGLE_SHEET_ID` (defaults to the Musosoup sheet,
   `15NvtTse6-GJ52_EJ4aVNv2HX4Uu4jKdJTNxNZfNaQM8`) and `SHEET_TAB_NAME`
   (defaults to `Reviews`).

## Running locally

The frontend needs the Netlify Function to serve `/api/reviews`, so use the
Netlify CLI rather than plain `vite`:

```
npm install -g netlify-cli   # if you don't have it
netlify dev
```

This serves the Vite dev server and the function together on
`http://localhost:8888` with live reload on both.

`npm run dev` alone starts only the Vite server — the dashboard will load
but the `/api/reviews` fetch will 404 without `netlify dev` or an
equivalent function host.

## Deploying

Connect the repo in Netlify (or run `netlify deploy`). `netlify.toml`
already points the build at `npm run build` / `dist` and wires the
function directory — set the environment variables above in the Netlify
UI before the first deploy.

## Scripts

- `npm run dev` — Vite dev server only
- `npm run build` — production build to `dist/`
- `npm run lint` — oxlint
- `npm run preview` — preview the production build
