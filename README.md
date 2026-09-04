# Musosoup Feedback Dashboard

Dashboard over the Musosoup feedback Google Sheet. React + Vite frontend,
Netlify Functions as a thin data-access layer that reads and writes the
sheet via a Google service account. Reading is fully open, no sign-in
required. Editing is gated behind one shared password (see **Edit mode**
below) — there is no per-user login.

Two feedback sources are shown as separate tabs — Trustpilot reviews and
Reddit mentions — each with its own date range, filters, and stats. They are
never merged into one combined feed.

## How it fits together

```
Browser  --GET /api/reviews-------------->  Netlify Function  --Sheets API-->  Reviews tab
  |       --GET /api/reddit-mentions----->  Netlify Function  --Sheets API-->  Reddit Mentions tab
  |       --POST /api/auth/login--------->  Netlify Function  (checks DASHBOARD_EDIT_PASSWORD, issues a token)
  |       --PATCH /api/reviews/:row------>  Netlify Function  --Sheets API-->  Reviews tab   (needs a valid token)
  |       --PATCH /api/reddit-mentions/:row->  Netlify Function  --Sheets API-->  Reddit Mentions tab  (needs a valid token)
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
  `netlify/functions/reddit.js` are thin GET+PATCH handlers over them — the
  PATCH route was added without touching the GET path or the repositories'
  read functions.

## Edit mode

Reading the dashboard never requires a password. Making a change does:

1. Click **Unlock edit mode** in the header and enter the shared password.
   It's checked server-side in `netlify/functions/auth.js` against the
   `DASHBOARD_EDIT_PASSWORD` environment variable — the frontend never
   evaluates it. On success the server issues a short-lived (4 hour) signed
   token, stored in the browser's `sessionStorage` (cleared when the tab
   closes, not a permanent login).
2. Every write request (`PATCH /api/reviews/:row`,
   `PATCH /api/reddit-mentions/:row`) carries that token and the server
   re-checks it independently (`netlify/functions/lib/requireSession.js`) -
   a request without a valid token is rejected with 401 even if it never
   went through the UI at all.
3. Editable fields:
   - **Trustpilot**: Status (dropdown), Notes, Assigned To, Outcome, and an
     approve/edit + copy flow for Suggested Reply (tweak the draft, copy it,
     paste into Trustpilot by hand — this app never posts to Trustpilot).
     Date Contacted is never directly editable; it auto-stamps with today's
     date the moment Status is changed to "Contacted".
   - **Reddit Mentions**: Status and Notes only.
4. Every save asks for a name or initials ("Edited by") and stamps the time,
   shown on the row as e.g. "Last updated: Sam, 2:14pm" — informal
   attribution, not an enforced login. The name field is prefilled from
   whatever was typed last in the same browser tab, for convenience.
5. Writes are guarded against the sheet having changed shape underneath the
   app: before writing, the server re-checks that the target row still holds
   the same Review ID / Post ID the browser last read. If someone reordered
   or edited the sheet directly in Google Sheets in the meantime, the save
   fails with a clear error instead of silently landing on the wrong row.

## Sheet columns

`netlify/functions/lib/reviewFields.js` and
`netlify/functions/lib/redditFields.js` are the single source of truth for
column order, one per tab. **Edit mode requires two extra columns on each
tab that aren't part of the original read-only layout** — add them as the
last two columns, in this exact order, before turning edit mode on:

- **Reviews** tab: Date Posted, Reviewer Name, Star Rating, Review Text,
  Review URL, Review ID, Needs Action, Status, Assigned To, Date Contacted,
  Notes, Outcome, Suggested Reply, **Edited By, Last Updated At**.
- **Reddit Mentions** tab: Date Posted, Author, Title, Excerpt, Post URL,
  Post ID, Needs Action, Status, Notes, **Edited By, Last Updated At**.

`Last Updated At` is written as a full ISO timestamp (e.g.
`2026-09-04T14:30:00.000Z`) - the dashboard formats it for display, no need
to format it in the sheet.

## Setup

1. `npm install`
2. Create/reuse a Google Cloud service account and share the target
   spreadsheet with its `client_email` as **Editor** (not just Viewer -
   edit mode needs write access; reads still work fine even before you
   configure edit mode). One service account covers both tabs.
3. Add the `Edited By` / `Last Updated At` columns described above to both
   sheet tabs if they aren't there yet.
4. Provide credentials as environment variables — copy `.env.example` to
   `.env` for local dev, and set the same variables in the Netlify site's
   **Environment variables** for deploys. Never commit a credentials file.
   Either:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — the full service account JSON as one
     line, or
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` (with literal
     `\n` line breaks in the key).
5. Set `DASHBOARD_EDIT_PASSWORD` to whatever shared password the team should
   use to unlock edit mode. Without it, edit mode is unreachable (the login
   endpoint returns a 500 rather than silently accepting anything) but
   reading still works normally.
6. Optional overrides: `GOOGLE_SHEET_ID` (defaults to the Musosoup sheet,
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
