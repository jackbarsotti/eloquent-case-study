# SPEC: Eloquent Case Study reference app

Bottom line: the reference is a small React app. It has 2 pages, 3 KPIs and 15 clients. Every number comes from one data file and 2 functions. Each formula below was checked by editing rows on the live reference (section 8).

Reference: https://project-eloquentcasestudy.magicpatterns.app/

## 1. How it was inspected

- Opened every page and state in Chrome (Playwright) at 1440x900, 1280x720, 1024x768, 800x1000 and 375x812.
- Time zone `America/New_York`, locale `en-US` for every number in this file. Some dates depend on time zone (section 10).
- Read the page source: 1 HTML file, 1 JS bundle, 1 CSS bundle. The JS bundle links a public source map that holds the 14 original source files. Used it to confirm stack, copy and class names.
- Proved each formula by editing rows on the live site and comparing the new numbers to the formula (section 8).

## 2. Stack

| Part | Reference | How we know |
|---|---|---|
| UI library | React 18.3.1, production build, legacy `ReactDOM.render` | Version string in the bundle |
| Routing | react-router-dom 6.30.2, `BrowserRouter` | `@remix-run/router` 1.23.1 in the bundle |
| Icons | lucide-react 0.522.0 | License header in the bundle |
| Styles | Tailwind CSS 3.4, default theme, no plugins | CSS output format, no forms plugin rules |
| Font | Tailwind default sans stack (system UI font) | Computed `font-family` on every element |
| Language | TypeScript (`.tsx` files) | Source map |

- Inter and Poppins are loaded in the HTML head but never applied. The `body` inline style is malformed, so its `font-family` is dropped.

## 3. Routes

| Path | Shows | Tab title |
|---|---|---|
| `/` | Dashboard | Eloquent Case Study |
| `/user/:id` | Client detail. Works for all 15 clients, not only the first 5 | Eloquent Case Study |
| `/user/<unknown id>` | Gray text "Loading entity..." that never resolves | Eloquent Case Study |
| Any other path | Sidebar and footer with an empty main area | Make Numbers Static Until Save |

- The host returns `index.html` with status 200 for every path, so refresh works on every route.
- No favicon. `/favicon.ico` also returns the HTML page.
- The HTML `<title>` is "Make Numbers Static Until Save". The dashboard and detail pages set it to "Eloquent Case Study" on mount.

## 4. Layout (every page)

- Page background `#F9F6F0`, full height.
- **Sidebar** (768 px and wider): fixed to the left edge, full height, 280 px wide (768-1023 px) or 300 px (1024 px and wider). Background `#F9F6F0`, 1 px right border gray-200, padding 20 px, scrolls on its own.
  - Header: 32x32 box with a 16 px `TrendingUp` icon in `#57288F`, then "Key Metrics" (18 px, bold, gray-900). 24 px below.
  - 3 KPI cards stacked with 16 px gaps.
- **Mobile** (under 768 px): no sidebar. A "Key Metrics" block sits at the top of the page. KPI cards sit in one row that scrolls sideways (each at least 260 px wide, snap to start).
- **Main area**: left margin 280 px (md) or 300 px (lg). Padding 16 / 24 / 32 px (base / md / lg). Bottom padding is 80 px only below 768 px, because `md:p-6` overrides `pb-20`. Content capped at 1100 px and centered.
- **Footer**: fixed to the bottom-left corner above everything (z 50), padding 16 px. Eloquent AI logo, 32 px tall. Links to `https://www.eloquentai.co/` in a new tab. Fades to 70% opacity on hover.

## 5. Components

### KPI card

- White card, 12 px radius, small shadow, 1 px border gray-100 at 50% opacity, 24 px padding. Shadow grows on hover (200 ms).
- Icon box: 10 px padding, `#F9F6F0` background, 8 px radius, 20 px icon in `#57288F`. 16 px gap below.
- Title: 12 px, medium, gray-500.
- Value: 24 px, bold, `#57288F`. If the value starts with `$`, the `$` is split out at 18 px semibold with 2 px right margin, aligned on the text baseline.
- Subtitle: 12 px, gray-400, relaxed line height.

| # | Title | Icon | Value format | Subtitle |
|---|---|---|---|---|
| 1 | Avg Customer LTV | `DollarSign` | `$17,722` | Average lifetime value per customer |
| 2 | Enterprise Revenue | `TrendingUp` | `95.5%` | Share of total transaction volume |
| 3 | Churn Risk (High Value) | `AlertCircle` | `7` | Enterprise/SME > 60 days |

### Dashboard (`/`)

- H1 "Eloquent Case Study": 24 px (30 px at 768 px and wider), bold, gray-900.
- H2 "Client Entities": 20 px, bold, gray-900, 20 px below.
- Table inside a white card (no padding). Text 14 px, left aligned.
- Header row: background `#F9F6F0`, gray-600, medium, 1 px gray-200 border. Cells: 16 px top/bottom, 24 px left/right.

| Column | Content | Format |
|---|---|---|
| Client Name | Name (medium, gray-900) over email (12 px, gray-400) | as stored |
| Segment | Pill. Enterprise: purple-100 / purple-800. SME: blue-100 / blue-800. Startup, Individual: gray-100 / gray-800 | as stored |
| Status | Pill with dot. Active: green-50 / green-700, dot green-500. Inactive: gray-50 / gray-600, dot gray-400 | First letter capitalized |
| Start Date | Join date | `Jan 14, 2023` (en-US, short month) |
| Total Spent | Right aligned, medium, gray-900 | `$45,248` |
| Transactions | Right aligned, gray-600 | `13` |
| Last Active | gray-600 | `3/3/2026` (browser default locale) or `Never` |
| (no header) | 16 px chevron, gray-300, turns `#57288F` on row hover | |

- Rows: gray-50 dividers. Hover background gray-50 at 50%. Pointer cursor. Click opens `/user/:id`. Every row is clickable.
- Order: data order (u1, u2, u3, u4, u5, u6, u7, u8, u10, u11, u12, u13, u14, u17, u23). No sorting. Headers do nothing.
- Pagination (only when there is more than 1 page): "Showing 1-11 of 15 entities" on the left (14 px, gray-500). On the right: previous chevron, page number buttons, next chevron.
  - Page buttons: at least 40 px wide, 8 px radius, 14 px medium. Current page: `#57288F` background, white text, medium shadow. Others: white, gray-600, small shadow, gray-100 border.
  - Chevron buttons: 8 px padding, white, gray-100 border. Disabled at the first or last page (40% opacity, no hover change).

### Client detail (`/user/:id`)

- "Back to Dashboard": gray-500 text with a 16 px left arrow. On hover the text turns `#57288F` and the arrow moves 4 px left.
- Header (row at 768 px and wider, stacked below):
  - H1 client name: 30 px, bold, gray-900.
  - Chip "ID: u1" (gray-200 background, gray-700, 12 px medium, 4 px radius), then "Joined 1/14/2023" (14 px gray-500).
  - "Save Changes" button: green `#4CA37D`, white, `Save` icon, medium shadow. Hover: `#3d8566` and a large shadow. While saving: spinner icon, disabled at 50% opacity.
- **Entity Configuration** card (4 px `#57288F` left border). Two columns at 768 px and wider:
  - "Client Segment": native select with Enterprise, SME, Startup, Individual. Gray-50 background, white on focus. No visible border.
  - "Status": read-only box showing "active" / "inactive" (capitalized by CSS) with a green or gray dot.
- Two cards side by side at 768 px and wider:
  - **Contact Details** (`Building2` icon): "Email Address" label, then `Mail` icon and the email.
  - **Financial Overview** (`CreditCard` icon) with a small ghost button: "Edit" (pencil, purple) or "Cancel" (X, gray).
    - View mode: "Lifetime Value" `$45,248` (20 px bold purple), "Total Transactions" `13` (20 px bold), "Last Activity" with a calendar icon and `3/3/2026`.
    - Edit mode: the card gets a purple ring. Number input with a `$` prefix, number input, and a date input.

## 6. Data

- 15 clients, stored in this order:

| id | Name | Email | Segment | Join date | Status |
|---|---|---|---|---|---|
| u1 | Acme Corp | contact@acme.com | Enterprise | 2023-01-15 | active |
| u2 | TechStart Inc | admin@techstart.io | Startup | 2023-03-10 | active |
| u3 | John Doe Designs | john@doe.design | Individual | 2023-05-22 | active |
| u4 | Global Logistics | info@glogistics.com | Enterprise | 2022-11-05 | active |
| u5 | FastFood Chain | supply@fastfood.com | SME | 2023-02-18 | inactive |
| u6 | Crypto Bros | moon@crypto.com | Startup | 2023-08-01 | active |
| u7 | Sarah Smith | sarah@smith.com | Individual | 2023-09-12 | active |
| u8 | MegaCorp | it@megacorp.com | Enterprise | 2021-06-30 | active |
| u10 | DevShop Agency | team@devshop.co | SME | 2023-04-20 | active |
| u11 | FinTech Innovations | contact@fintech-inn.com | Startup | 2023-07-05 | active |
| u12 | Maria Garcia | maria@garcia.com | Individual | 2023-10-01 | active |
| u13 | RetailPro Systems | sales@retailpro.com | Enterprise | 2022-03-22 | active |
| u14 | Green Energy Co | info@greenenergy.com | SME | 2023-06-15 | active |
| u17 | Healthcare Plus | admin@healthcareplus.com | Enterprise | 2022-01-18 | active |
| u23 | RoboTech Startup | hello@robotech.io | Startup | 2023-10-14 | active |

- Transactions are generated in the browser at load. Same output on every load. 120 transactions, 111 completed, all stamped 12:00 UTC. (Only the two Morocco time zones shift them, by 1 hour, with no visible change.)
  - Random numbers: seeded generator, seed 42. `s = (s * 1664525 + 1013904223) & 0xffffffff`, value `(s >>> 0) / 0xffffffff`.
  - Count per client: 15 (Enterprise), 8 (SME), 3 (Startup, Individual).
  - Each transaction draws 4 numbers in this order: date, amount, status, category.
  - Date: `2026-03-04T12:00:00Z` minus `floor(r * 90)` days, using local-time `setDate`. For u5, u13 and u17: minus `75 + floor(r * 30)` days.
  - Amount: Enterprise `floor(r * 5000) + 1000`. Others `floor(r * 500) + 50`.
  - Status: `completed` if `r > 0.1`, else `failed`. Category: `Add-on` if `r > 0.7`, else `Subscription` (never shown).
- Edits are stored as overrides on the client: `lifetimeValueOverride`, `transactionCountOverride`, `lastActivityOverride`.
- Baseline table values: section 8, E1.

## 7. Formulas

"Completed" means transactions with status `completed`. Failed ones never count.

| Value | Formula | Format |
|---|---|---|
| Avg Customer LTV | Sum over all 15 clients of (`lifetimeValueOverride`, else sum of completed amounts), divided by 15, rounded | `$` + `toLocaleString()` |
| Enterprise Revenue | Completed amounts of clients whose current segment is Enterprise, divided by all completed amounts, times 100 | `toFixed(1)` + `%` |
| Churn Risk (High Value) | Count of clients that are active, in Enterprise or SME, and whose last activity is NOT within 60 days of now | integer |
| Total Spent (row, detail) | `lifetimeValueOverride`, else sum of completed amounts | `$` + `toLocaleString()` |
| Transactions (row, detail) | `transactionCountOverride`, else count of completed | as is |
| Last Active (row, detail) | `lastActivityOverride`, else latest completed date. None: `Never` | `toLocaleDateString()` |
| Rows per page | `max(3, floor((window height - table body top - 52 - 24) / 57))`, measured 50 ms after the table mounts and on every window resize | integer |
| Pagination label | `Showing {first}-{min(last, 15)} of 15 entities` | |

- Enterprise Revenue ignores lifetime value overrides and client status. Only segment edits move it.
- Churn "within 60 days": `ceil(abs(now - last activity) / 1 day) <= 60`. "Now" is the real clock, so the count changes over time. On 2026-10-18 every transaction is older than 60 days, so all 7 active Enterprise and SME clients count.
- Transaction count override changes only the displayed count. No KPI uses it.

## 8. Evidence (live edits on the reference)

Bottom line: 22 scripted experiments, 11,737 checks per run, 0 mismatches between these formulas and the live reference.

- Each experiment runs in a fresh Chrome window: New York time, en-US, 1440x2000 (all 15 rows fit).
- Only real UI actions: click a row, pick a segment, click Edit, type, click Save, wait for the 800 ms save.
- A script predicts every KPI, table cell and detail value from section 7, then compares.
- Clock pinned to 2026-10-18 16:00 UTC so runs repeat exactly. A run on the real clock also matched.

**Baseline**
- Avg Customer LTV: 265,833 / 15 = 17,722.2 → `$17,722`.
- Enterprise Revenue: 253,992 / 265,833 = 95.55% → `95.5%`.
- Churn Risk: `7` (u1, u4, u8, u10, u13, u14, u17).

**KPIs after each saved edit**

| # | Edit saved | Avg LTV | Enterprise | Churn | Proves |
|---|---|---|---|---|---|
| E2 | u1 lifetime value 100,000 | $21,372 | 95.5% | 7 | LTV uses the override. Enterprise share ignores it. |
| E3 | u2 segment Startup → Enterprise | $17,722 | 95.9% | 8 | Share and churn follow the current segment |
| E4 | u4 last activity = today | $17,722 | 95.5% | 6 | Churn uses the date override |
| E6 | u3 transactions 42 | $17,722 | 95.5% | 7 | Count override changes no KPI |
| E7a | u5 (inactive) last activity = today | $17,722 | 95.5% | 7 | Inactive clients never count for churn |
| E7b | u5 (inactive) segment → Enterprise | $17,722 | 96.2% | 7 | Enterprise share ignores status |
| E9 | u1 segment → SME | $17,722 | 78.5% | 7 | |
| E11 | u1 lifetime value 0 / -500 / 1234.567 | $14,706 / $14,672 / $14,788 | 95.5% | 7 | Rounds to whole dollars |
| E22 | E2, then E3 | $21,372 | 95.9% | 8 | Edits stack |

Math for the non-obvious rows:
- E2: (265,833 − 45,248 + 100,000) / 15 = 21,372.3 → $21,372.
- E3: (253,992 + 920) / 265,833 = 95.89% → 95.9%.
- E7b: (253,992 + 1,681) / 265,833 = 96.18% → 96.2%.
- E9: (253,992 − 45,248) / 265,833 = 78.52% → 78.5%.
- E11: (265,833 − 45,248 + 1,234.567) / 15 = 14,787.97 → $14,788.

**60-day boundary (E5).** u1's last activity set N days before 2026-10-18, saved as UTC midnight. Clock 2026-10-18 16:00 UTC.

| Days back | 57 | 58 | 59 | 60 | 61 | 62 |
|---|---|---|---|---|---|---|
| Whole days, rounded up | 58 | 59 | 60 | 61 | 62 | 63 |
| Churn | 6 | 6 | 6 | 7 | 7 | 7 |

**Clock.** Churn with the browser clock set to a date: 2026-03-04 → 2, 2026-04-14 → 3, 2026-04-20 → 4, 2026-04-24 03:00 UTC → 5, 2026-05-02 → 6, 2025-12-01 → 5 (dates far in the future also count).

**Display after edits**
- Saving with Edit open writes all 3 financial values, even untouched ones.
- The date input holds the UTC day of the last activity. Save writes it back as UTC midnight, so New York shows one day earlier: u1 goes from `3/3/2026` to `3/2/2026`.
- A date picked "today" (2026-10-18) shows as `10/17/2026`.
- Overrides show as typed: `$-500`, `$1,234.567`, transactions `2.5`.
- de-DE: `$17.722`, `3.3.2026`, `$1.234,5`. Start Date stays en-US (`Jan 14, 2023`).

## 9. Behaviors

| Action | Result |
|---|---|
| Click a row | Opens `/user/:id` at the top of the page, even from a scrolled list. Page resets to 1 when you come back. |
| Change segment, Save | Segment saved. Financial values unchanged. |
| Edit, change values, Save | Segment and all 3 financial values saved as overrides. Empty date keeps the old value. |
| Edit, Cancel | Inputs reset to the saved values. Segment choice stays, and Save writes it. |
| Detail numbers while editing | Stay fixed until Save. |
| Save button | Spinner and disabled within 8 ms. Back on `/` at about 810 ms. A second click does nothing. |
| Leave during the 800 ms save | The edit still lands. One extra `/` history entry. |
| Back to Dashboard | Goes to `/`. Unsaved changes are dropped. |
| Browser back / forward | Normal history. Saved values persist while the tab stays open. Back restores scroll, which can change rows per page. |
| Refresh | Back to the starting data. No localStorage, sessionStorage, IndexedDB or cookies. |
| Number inputs | Letters are ignored. An invalid entry (`-`, `e`, empty) shows `0`. Typing `-500` over a selected value gives `0500` and saves 500. |
| Rows per page | 600 px tall → 5, 700 → 7, 800 → 9, 900 → 11, 1000 → 12, 1080 → 14, 1200+ → all 15 (no pagination). 375x812 → 4. |
| Churn "now" | Read when the app loads and after each save |
| Column headers | No sorting, no click action |
| Paths | `/USER/u1` works (paths ignore case). `/user/U1` does not (ids are exact). Trailing slash and query strings work. |

## 10. Reference quirks we copy on purpose

- Date-only values (`2023-01-15`, date input values) are read as UTC midnight. In US time zones they show 1 day early: join date `2023-01-15` shows `Jan 14, 2023`.
- Churn Risk uses the real clock, so it drifts as time passes.
- Rows per page assumes 57 px rows, but rows render 69 px tall (93 px when the table is squeezed below about 1290 px wide). The pagination bar always sits below the fold.
- The table first paints 10 rows, then refits about 50 ms later: 11 rows at 1440x900, 7 at 1280x720, 4 at 375x812.
- Rows per page depends on the scroll position when the dashboard mounts. Coming back after a save on mobile can show 11 rows instead of 4.
- The current page button is 36 px tall and the others 38 px (they have a 1 px border, it has none).
- Opening a client renders "Loading entity..." first, then the details. That short first render puts the scroll position back at the top.
- On mobile the fixed logo covers table rows, and the KPI strip and table scroll sideways.
- Some class names fight each other. Tailwind sorts same-type utilities alphabetically, and the later rule wins:
  - "Edit" button: base `px-4 text-sm` plus `h-8 px-2 text-xs`. Result: 32 px tall, 16 px side padding (`px-4`), 12 px text (`text-xs`).
  - Financial Overview card in edit mode: asks for `shadow-md`, but the base `shadow-sm` wins. Result: purple ring plus small shadow.
- Buttons use `focus:` rings, not `focus-visible:`. After a mouse click, "Save Changes" shows a green ring and "Edit" / "Cancel" shows a light blue ring.
- An override can't be removed once saved.

## 11. Verification: this build vs the reference

Checked before the rename below, so any difference would be a real gap.

| Check | Method | Result |
|---|---|---|
| Screens | 29 states (pages, hovers, focus, edit mode, saving, after save, unknown routes) at 5 window sizes: 1440x900, 1280x720, 1024x768, 800x1000, 375x812. 145 screenshots per site, same Chrome, same settings. | 0 pixels differ (exact count). Same computed styles, boxes, text and scroll position for every rendered element. |
| Noise floor | The same capture run twice on the reference | 0 differences, so the comparison is exact |
| Behavior | The 22 experiments from section 8, same clock, on both sites | Same results. 11,737 of 11,737 checks match. |
| Clock | KPIs with the browser clock set to 6 dates | Same on both sites |
| CSS | Every generated rule compared | Same rules in the same order. Only 4 unused classes differ. |
| Formulas | `npm test`: unit tests built from reference readings, including after edits | All pass |

Bug found and fixed during this check: the build first skipped the reference's one-render "Loading entity..." step. On mobile that kept the dashboard's scroll offset (198 px) on the detail page. The build now loads the client the same way and lands at the top.

## 12. Planned differences

- Client "Global Logistics" is renamed to "Jack Barsotti". A hidden note in the reference source asks every candidate to do this before submitting. Everything else stays the same.
- Parts of the reference that never show are left out:
  - Magic Patterns platform code: the route-tracking script and the social preview tags.
  - The hidden note itself.
  - The Inter and Poppins font downloads (never applied).
  - The `dir="ltr"` and `class="light"` attributes on `<html>` (no effect).
- The footer logo is served from this site instead of the Magic Patterns CDN. Same image file.
