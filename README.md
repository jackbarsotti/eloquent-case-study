# Eloquent Case Study rebuild

Exact rebuild of the Eloquent AI Part B reference app.

- Live site: LIVE_URL
- Reference: https://project-eloquentcasestudy.magicpatterns.app/

## What it is

- **Dashboard** (`/`): 3 KPIs in a sidebar and a table of 15 clients.
- **Client detail** (`/user/:id`): click a row to edit the client's segment and financial values. Saving updates the dashboard.
- Matches the reference pixel for pixel in Chrome, from phone to desktop width. Every number matches, before and after edits.
- One change on purpose: client "Global Logistics" is now "Jack Barsotti". A hidden note in the reference source asks for this.

## How it was checked

- **Screens:** 29 states (pages, hovers, focus, edit mode, saving, after save) at 5 window sizes. 145 screenshots compared with the reference: 0 pixels differ.
- **Behavior:** 22 scripted edit experiments (11,737 checks) give the same results on both sites.
- **Formulas:** `npm test` runs 50 unit tests built from numbers read off the reference, including after edits.
- Full notes and evidence: `SPEC.md`.

## Run it locally

Needs Node 20 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
|---|---|
| `npm test` | Runs the unit tests for every formula |
| `npm run build` | Type checks and builds into `dist/` |
| `npm run preview` | Serves the build at http://localhost:4173 |

## How each KPI is calculated

"Completed" means transactions with status `completed`. Failed ones never count.

| KPI | Formula | Today |
|---|---|---|
| Avg Customer LTV | Sum of every client's lifetime value, divided by 15 clients, rounded. Lifetime value = saved override, else the sum of completed amounts. | $17,722 |
| Enterprise Revenue | Completed revenue from Enterprise clients, divided by all completed revenue, times 100, 1 decimal. Uses transactions only: lifetime value overrides and status don't move it. Segment changes do. | 95.5% |
| Churn Risk (High Value) | Count of active Enterprise and SME clients whose last activity is more than 60 days ago (whole days, rounded up). Last activity = saved override, else the latest completed transaction. Uses today's date. | 7 |

Table and detail values:

- **Total Spent**: saved override, else the sum of completed amounts.
- **Transactions**: saved override, else the count of completed transactions. No KPI uses it.
- **Last Active**: saved override, else the latest completed transaction date. `Never` if there is none.

The formulas are pure functions in `src/utils/kpiCalculations.ts`. All data is in `src/data/mockData.ts`.

## How edits reach the dashboard

- One shared store holds all clients: `src/context/DataContext.tsx`.
- Save waits 800 ms (a fake network call), writes the edits to the store, then goes back to the dashboard.
- The sidebar and table read from the store, so they show the new values right away.
- Data lives in memory. A refresh resets every edit, same as the reference.

## Project layout

```
src/
  data/mockData.ts          All data: 15 clients and their generated transactions
  utils/kpiCalculations.ts  KPI and per-client formulas
  utils/format.ts           Number and date display
  context/DataContext.tsx   Shared store
  components/               Layout, sidebar, KPI card, table, button, card
  pages/                    Dashboard and client detail
```

## Matching the reference

- Same libraries and versions: React 18.3.1, React Router 6.30.2, Tailwind CSS 3.4, lucide-react 0.522.0.
- Same quirks, kept on purpose:
  - Dates show 1 day early in US time zones. The reference reads date-only values as UTC midnight.
  - Churn Risk uses today's date, so the count changes over time.
  - Rows per page fit the window height.
- `SPEC.md` has the full inspection notes, formulas and the evidence for each one.

## Deploy

Hosted on Vercel. `vercel.json` sends every path to `index.html`, so a refresh works on any page.
