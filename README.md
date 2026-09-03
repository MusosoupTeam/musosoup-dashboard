# Musosoup Feedback Dashboard

Read-only proof-of-concept dashboard over the Musosoup feedback Google Sheet.
React + Vite frontend, Netlify Functions as a thin data-access layer that
reads the sheet via a Google service account. No login, no write-back — this
is a sign-off POC for a fuller version that will add actions.

Two feedback sources are shown as separate tabs — Trustpilot reviews and
Reddit mentions — each with its own date range, filters, and stats. They are
never merged into one combined feed.

## How it fits together

```
Browser  --GET /api/reviews---------->  Netlify Function  --Sheets API-->  Reviews tab
  |       --GET /api/reddit-mentions->  Netlify Function  --Sheets API-->  Reddit Mentions tab
  |
  tab switch picks Trustpilot or Reddit; filters, KPIs, charts, table for
  the active tab are all computed client-side from that tab's one fetch
```

- Each function fetches its whole sheet tab once per request and returns
  normalized JSON. The frontend fetches each source once on load and does
  all filtering, KPI, and chart computation client-side (`src/utils`,
  `src/views`), so changing a filter or switching tabs is instant — no
  rebuild, no refetch.
- `netlify/functions/lib/reviewsRepository.js` and
  `netlify/functions/lib/redditRepository.js` are the only code that talks
  to the Sheets API, one per source. `netlify/functions/reviews.js` and
  `netlify/functions/reddit.js` are thin GET handlers over them. A future
  write endpoint (e.g. `PATCH /api/reviews/:id` to update Status) would be a
  new handler file plus a new repository function — it wouldn't require
  touching either of these.

## Sheet columns

`netlify/functions/lib/reviewFields.js` and
`netlify/functions/lib/redditFields.js` are the single source of truth for
column order, one per tab.

- **Reviews** tab: Date Posted, Reviewer Name, Star Rating, Review Text,
  Review URL, Review ID, Needs Action, Status, Assigned To, Date Contacted,
  Notes, Outcome, Suggested Reply.
- **Reddit Mentions** tab: Date Posted, Author, Title, Excerpt, Post URL,
  Post ID, Needs Action, Status, Notes.

## Setup

1. `npm install`
2. Create/reuse a Google Cloud service account with **read-only** access to
   the Sheets API, and share the target spreadsheet with its
   `client_email` (Viewer access). One service account covers both tabs.
3. Provide credentials as environment variables — copy `.env.example` to
   `.env` for local dev, and set the same variables in the Netlify site's
   **Environment variables** for deploys. Never commit a credentials file.
   Either:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — the full service account JSON as one
     line, or
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` (with literal
     `\n` line breaks in the key).
4. Optional overrides: `GOOGLE_SHEET_ID` (defaults to the Musosoup sheet,
   `15NvtTse6-GJ52_EJ4aVNv2HX4Uu4jKdJTNxNZfNaQM8`), `SHEET_TAB_NAME`
   (defaults to `Reviews`), and `REDDIT_SHEET_TAB_NAME` (defaults to
   `Reddit Mentions`).

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
