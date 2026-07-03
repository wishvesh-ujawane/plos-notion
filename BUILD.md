# BUILD.md — Master playbook for the home-PC Notion agent

**Read this first.** This file tells the Copilot Chat agent on the home PC exactly what to build, in what order, using what inputs, and what to do when something fails.

This is the entry point for anyone (human or agent) constructing the "PLOS — Second Brain" Notion workspace for the first time. If you're doing an incremental change to an already-built workspace, jump to [§ 9](#9-incremental-changes-after-first-build).

---

## 0. Read these first (in order)

1. [README.md](README.md) — project purpose and current state
2. [SETUP.md](SETUP.md) — Notion integration + MCP setup (must be done before this file is actionable)
3. [WORKSPACE-DESIGN.md](WORKSPACE-DESIGN.md) — **authoritative schema** for every DB (property names, types, options)
4. [design/00-conventions.md](design/00-conventions.md) — icons, statuses, formulas, view patterns
5. [design/01-trading.md](design/01-trading.md) → [05-home-dashboard.md](design/05-home-dashboard.md) — per-area extras (views, templates, seed rows)

Every rule below assumes the above are the source of truth. **If a claim in this file contradicts `WORKSPACE-DESIGN.md`, the design doc wins.**

---

## 1. Preconditions checklist

Before writing anything to Notion, confirm:

- [ ] Machine can reach `api.notion.com` (run `curl.exe -sS -o NUL -w "HTTP %{http_code} TLS %{time_appconnect}s`n" https://api.notion.com/v1/users/me` — HTTP 401 with TLS > 0 = good, HTTP 000 = network blocked, see [SETUP.md § Network check](SETUP.md#network-check-do-this-before-step-3-if-youre-on-a-corporate-machine))
- [ ] Notion MCP server (`notionApi`) is enabled in VS Code with `NOTION_TOKEN` set
- [ ] `API-get-self` returns the bot user successfully
- [ ] `API-post-search` for `"PLOS — Second Brain"` returns exactly one page (the parent)
- [ ] The parent page has the integration connected (visible in Notion → page `···` → Connections → `PLOS-Copilot`)
- [ ] `notion-manifest.json` does not yet exist in the repo (fresh build) — if it does, see [§ 9](#9-incremental-changes-after-first-build)
- [ ] User has confirmed "go ahead" — do **not** start building without an explicit green light

If any box fails, stop and report which one — do not attempt to auto-fix networking, tokens, or parent-page issues.

---

## 2. Build order (top level)

The workspace must be built in this order because relations, rollups, and linked views all depend on earlier steps existing. **Do not parallelize across phases.**

```
Phase 0 → Auth + parent page verified                (already done during SETUP.md)
Phase 1 → Area pages (5 pages, no DBs yet)
Phase 2 → All databases in every area (no relations, no rollups, no formulas that reference other DBs)
Phase 3 → Cross-DB relations
Phase 4 → Rollups (require relations to exist)
Phase 5 → Formulas that reference relations/rollups
Phase 6 → Views (all layouts, filters, sorts, groups)
Phase 7 → Database templates (page templates on DBs)
Phase 8 → Seed rows (2–3 per DB from design files)
Phase 9 → Home dashboard with linked views (built last)
Phase 10 → Write "📖 How this works" page inside PLOS — Second Brain
```

Between phases, **checkpoint to `notion-manifest.json`** (see [§ 6](#6-manifest-format)) and **pause for a one-line "phase N complete" report to the user** before starting the next phase.

---

## 3. Phase-by-phase instructions

### Phase 1 — Area pages

Under parent page `PLOS — Second Brain`, create these five sibling pages, in this order:

| Order | Page title              | Icon | Body                                                                                                    |
| ----- | ----------------------- | ---- | ------------------------------------------------------------------------------------------------------- |
| 1     | 🧭 Trading              | 🧭   | See [01-trading.md](design/01-trading.md) area-page body spec                                            |
| 2     | ☁️ Salesforce Career    | ☁️   | See [02-salesforce.md](design/02-salesforce.md) area-page body spec                                      |
| 3     | 🎓 Cloud101 Business    | 🎓   | See [03-cloud101.md](design/03-cloud101.md) area-page body spec                                          |
| 4     | 🧘 Personal             | 🧘   | See [04-personal.md](design/04-personal.md) area-page body spec (uses **Do / Grow / Steward** groupings) |
| 5     | 🏠 Home                 | 🏠   | Empty for now — filled in Phase 9                                                                        |

**API calls (per page):**
1. `API-post-page` with parent `page_id` = PLOS — Second Brain, `icon.emoji` = row's icon, `properties.title` = row's title. Body blocks are appended later via `API-update-page-markdown` or `API-patch-block-children`.
2. Record `id` returned into `notion-manifest.areas.<key>.pageId`. Keys: `trading`, `salesforce`, `cloud101`, `personal`, `home`.

### Phase 2 — Databases (properties only, no relations)

For each area, create every DB listed in [WORKSPACE-DESIGN.md](WORKSPACE-DESIGN.md) as an **inline database** under its area page. **Skip** relation properties, rollups, and any formula that references another DB — these come in Phases 3–5.

**Per-DB call pattern:**
1. `API-post-page` with:
   - `parent.page_id` = area page ID (from manifest)
   - `is_inline: true`
   - `icon.emoji` = from [00-conventions.md § 1](design/00-conventions.md#1-icons--colors-visual-hierarchy)
   - `title` = DB name
   - `properties` = all non-relation properties from `WORKSPACE-DESIGN.md`, using the property-type shapes documented in Notion API v2025-09-03
2. For select/multi-select/status properties, define **all options up-front** with the exact strings from the schema. Use sensible Notion color assignments (green for good/done, red for bad/blocked, gray for neutral, blue for in-progress).
3. Record returned `id` into `notion-manifest.areas.<key>.dbs.<dbKey>.id`. Also record `data_source_id` (for multi-source DBs in API 2025-09+; some responses expose it separately).

**Order within an area:**
- Trading: Strategies → Trades → Trading Journal → Trading Tasks → Watchlist
- Salesforce: Learning (SF) → Certifications → SF Projects → Career Pipeline → Career Tasks
- Cloud101: Cohorts → Curriculum → Sessions → Students → Business Tasks → Cloud101 Finance
- Personal: Finance Categories → Finance Accounts → Projects → Habits → Goals → Tasks → Habit Logs → Daily Plan → Time Blocks → Journal → Health Logs → Personal Learning → Ideas → Finance Transactions → Budgets

_(The "seed FIRST" rows in area docs assume the referenced DB was created earlier in the list above.)_

### Phase 3 — Cross-DB relations

Add every relation from [WORKSPACE-DESIGN.md](WORKSPACE-DESIGN.md) and the "Extra properties" sections of the area docs.

**Per relation:**
1. Use `API-update-a-data-source` (or `API-patch-database` on older API) to add a new property of type `relation`.
2. Configure `relation.database_id` = target DB's ID from manifest.
3. Configure `relation.type = "dual_property"` (two-way) unless the design says "single".
4. If dual, set the reverse-relation display name explicitly (Notion auto-names it "Related to X" otherwise, which is ugly).

**Order within phase:** do intra-area relations first, then cross-area. Cross-area relations in this design:
- `Career Tasks.Related Application` → Career Pipeline (same area, ok)
- `Career Tasks.Related Learning` → Learning (SF) (same area, ok)
- `Certifications.Study Materials` → Learning (SF) (same area, ok)
- `Curriculum.Cohorts` ↔ `Cohorts.Curriculum` (same area, ok)
- `Cloud101 Finance.Cohort/Student` → Cohorts/Students (same area, ok)
- `Habits.Logs` ↔ `Habit Logs.Habit` (same area, ok)
- `Projects.Tasks` ↔ `Tasks.Project` (same area, ok)
- `Time Blocks.Daily Plan` ↔ `Daily Plan.Time Blocks` (same area, ok)

There are currently **no cross-area relations** in the design. If the user later wants "link a Personal Task to a Cohort," add it as an incremental change — see [§ 9](#9-incremental-changes-after-first-build).

### Phase 4 — Rollups

Add every rollup property. Rollups must reference an existing relation (Phase 3) — they will fail otherwise.

Per rollup:
1. `API-update-a-data-source` — add property, type `rollup`.
2. Configure `rollup.relation_property_name`, `rollup.rollup_property_name`, `rollup.function` (`count`, `sum`, `count_values`, `percent_per_group`, `show_original`, etc.).
3. If the rollup uses a filter (e.g., "count Habit Logs where Completed = ✓ AND Date within 7 days") and the Notion API doesn't support that natively in the rollup definition, either:
   - Add a helper formula property on the source DB that pre-filters (e.g., `Recent Completed` = `if(prop("Completed") and dateBetween(now(), prop("Date"), "days") <= 7, 1, 0)`) and roll up the sum of that.
   - Or drop this rollup and note the limitation in "📖 How this works".

### Phase 5 — Formulas

Add every formula property. Formulas that reference relations/rollups (Phase 3/4 outputs) go last.

Per formula:
1. `API-update-a-data-source` — add property, type `formula`.
2. Paste expression **verbatim** from area doc or [00-conventions.md § 6](design/00-conventions.md#6-formula-library).
3. If Notion rejects with a syntax error, log it exactly, skip the property, and continue. Report failures at the end of the phase.

### Phase 6 — Views

For each DB, create every view listed in its area doc. Notion API view creation is limited — expect that some layouts (`timeline`, `calendar`) and some group-by settings may need to be adjusted manually.

Per view (in order per DB):
1. Attempt via `API-update-a-data-source` (or the newer view-creation endpoint if exposed).
2. If not supported programmatically, output a TODO line to the console: `TODO manual: on <DB>, create view "<name>" — layout <x>, filter <y>, sort <z>, group <w>`.
3. Collect all TODOs and report at end of phase.

### Phase 7 — Database templates

For each DB with templates defined in its area doc, create the template pages.

Per template:
1. `API-list-data-source-templates` — verify none with this title already exists.
2. `API-post-page` with `parent.data_source_id` = DB, marked as template (the API accepts `parent.type = "database_id"` with an `is_template` hint; consult current Notion API docs for exact shape).
3. `API-update-page-markdown` to fill the template body from the area doc's ```markdown … ``` block.

### Phase 8 — Seed rows

For each DB, insert its seed rows from the area doc. **Ordering matters** — insert seed rows for referenced DBs first (see area doc's own "seed FIRST" notes).

Per row:
1. `API-post-page` with `parent.data_source_id` = DB, `properties` = row data mapped to property shapes.
2. Do **not** insert seed rows that would auto-cascade into rollups the user doesn't want counted (e.g., don't insert dummy Trades if the user's `Strategies → Win Rate %` should stay clean; ask user first if seed data should include Trading Journal etc.).
3. Chunk in batches of ≤10 rows per DB to stay comfortably under rate limits. Sleep 400ms between batches (~2.5 req/sec).

### Phase 9 — Home dashboard

Follow [05-home-dashboard.md](design/05-home-dashboard.md) top-to-bottom. Uses only linked views over Phase-2/6 DBs.

### Phase 10 — "📖 How this works" page

Create one page **inside PLOS — Second Brain**, sibling to the area pages. Icon: 📖. Body sourced from:

- Purpose of each area (1 line each — pull from area docs' one-liners)
- Table of every DB with its purpose (1 line each — human-readable, not schema)
- Weekly review ritual (link to Journal template "Weekly Review")
- Monthly review ritual (link to Journal template "Monthly Review")
- "How to add a new Trade / Session / Task / etc." (short step-by-step per DB template)
- "What to change vs. what to leave alone" — explicitly warn that renaming properties will break formulas/views/rollups; property additions are safe

---

## 4. Property-value shape reference

The Notion API is strict about property value shapes. Cheat sheet for the shapes used most in seed rows:

```jsonc
// title
{ "Name": { "title": [{ "text": { "content": "Ship v1" } }] } }

// rich_text
{ "Notes": { "rich_text": [{ "text": { "content": "..." } }] } }

// number
{ "Amount": { "number": 12500 } }

// select
{ "Status": { "select": { "name": "Active" } } }

// multi_select
{ "Tags": { "multi_select": [{ "name": "launch" }, { "name": "urgent" }] } }

// status
{ "Status": { "status": { "name": "In progress" } } }

// date (day only)
{ "Due": { "date": { "start": "2026-07-15" } } }

// date (with time)
{ "Start": { "date": { "start": "2026-07-15T09:00:00+05:30" } } }

// checkbox
{ "Today": { "checkbox": true } }

// url / email / phone_number
{ "URL":   { "url": "https://example.com" } }
{ "Email": { "email": "x@y.com" } }
{ "Phone": { "phone_number": "+91 90000 00000" } }

// people
{ "Owner": { "people": [{ "id": "<user-uuid>" }] } }

// relation
{ "Project": { "relation": [{ "id": "<page-uuid>" }] } }

// files (only if you're attaching an externally-hosted URL — internal uploads aren't API-supported)
{ "Screenshots": { "files": [{ "type": "external", "name": "chart.png", "external": { "url": "https://..." } }] } }
```

Never put plain strings where the API expects a rich_text array. That's the #1 cause of confusing 400s.

---

## 5. Rate-limit + error handling

- **Ceiling:** ~3 req/sec sustained per integration. Bursts are allowed but not free.
- **Retry policy:** on `429`, honor `Retry-After` header; otherwise exponential backoff (1s, 2s, 4s, 8s, 16s), max 5 attempts, then abort the current phase and report.
- **On 400 (bad request):** log the exact endpoint + request body + response body → continue to next item in the batch → report all 400s at end of phase → do not silently swallow.
- **On 401/403:** stop the whole build immediately. This means the token is wrong or the page connection dropped. Do not retry.
- **On 404:** the resource doesn't exist — usually a stale manifest reference. Stop, report, ask the user whether to rebuild the missing piece or reset the manifest.
- **On 409 (conflict):** rare; usually means a duplicate title in a place that requires uniqueness. Report and skip.

---

## 6. Manifest format

`notion-manifest.json` (gitignored — never commit) is the durable state that lets subsequent runs address resources by name.

```jsonc
{
  "version": 1,
  "createdAt": "2026-07-04T09:15:00+05:30",
  "notionVersion": "2025-09-03",
  "parent": {
    "title": "PLOS — Second Brain",
    "pageId": "<32-char-hex>"
  },
  "areas": {
    "trading": {
      "pageId": "<...>",
      "dbs": {
        "trades":         { "id": "<...>", "dataSourceId": "<...>" },
        "strategies":     { "id": "<...>", "dataSourceId": "<...>" },
        "tradingJournal": { "id": "<...>", "dataSourceId": "<...>" },
        "tradingTasks":   { "id": "<...>", "dataSourceId": "<...>" },
        "watchlist":      { "id": "<...>", "dataSourceId": "<...>" }
      },
      "templates": {
        "trades.newTrade": "<template-page-id>",
        "tradingJournal.dailyJournal": "<...>"
      }
    },
    "salesforce": { /* same shape */ },
    "cloud101":   { /* same shape */ },
    "personal":   { /* same shape */ },
    "home":       { "pageId": "<...>" }
  },
  "howThisWorksPageId": "<...>",
  "phasesCompleted": ["phase-1", "phase-2", "phase-3", "phase-4", "phase-5", "phase-6", "phase-7", "phase-8", "phase-9", "phase-10"]
}
```

- **Write after every phase**, not just at the end, so a mid-build crash is resumable.
- **Confirm `.gitignore` already lists `notion-manifest.json`** before writing (it does — see current `.gitignore`).

---

## 7. Reporting cadence

At end of each phase, output exactly this shape to the user:

```
Phase <N> complete: <human name>
  Created: <count> pages, <count> DBs, <count> properties, <count> views, <count> templates, <count> rows
  Skipped: <count>  (see list below)
  Failed:  <count>  (see list below)

Skipped items:
  - <one-liner> — reason
  - ...

Failed items:
  - <one-liner> — HTTP <status> — <error message>
  - ...

Next: Phase <N+1> — <human name>. Reply "go" to continue, or "stop" to pause.
```

Do not auto-continue between phases. The user is the safety valve.

---

## 8. Sanity checks after full build

After Phase 10 completes, run these sanity queries and report results:

1. `API-post-search` for `"PLOS — Second Brain"` → confirm one page, and it has exactly 6 children (`🧭`, `☁️`, `🎓`, `🧘`, `🏠`, `📖`).
2. For each area page, `API-get-block-children` and count child DBs vs expected (Trading 5, Salesforce 5, Cloud101 6, Personal 15, Home 0).
3. Pick 3 DBs at random, `API-query-data-source` with no filter, `page_size: 5` → confirm the seed rows are present and no phantom rows.
4. `API-retrieve-a-data-source` on Tasks → confirm the `Priority Score` formula compiles (no `errored` type in the response schema).

Report as a table `check | expected | actual | ok?`.

---

## 9. Incremental changes (after first build)

Once `notion-manifest.json` exists, **never re-run this playbook from Phase 1**. Instead:

- **Adding a DB:** identify the target area page from manifest → do Phase 2 for just that one DB → Phase 3/4/5 for any new relations → Phase 6 for its views → Phase 7 templates → Phase 8 seed (if any) → update manifest → done.
- **Adding a property to an existing DB:** `API-update-a-data-source` with just the new property. Do not touch other properties. Do not "recreate" the DB.
- **Renaming a property:** don't. It breaks every view/filter/formula/rollup that references it. If truly needed, do it manually in Notion so the UI can offer to update dependents.
- **Deleting a DB:** never delete. Archive (`archived: true`) and hide from the sidebar. Removing a DB with relations pointing to it will show empty relations everywhere.
- **Bulk edits to existing rows:** always paginate (`page_size: 100`, follow `next_cursor`). Never assume single-page results.

---

## 10. Guardrails (must always be respected)

- **This workspace is a personal Notion workspace.** Do not connect the `PLOS-Copilot` integration to any page owned by a company workspace. If asked, refuse and warn.
- **No secrets in this repo.** Token lives in VS Code user MCP config only. If a user pastes a token into a file, warn and refuse to commit.
- **Never delete pages/blocks with `API-delete-a-block` unless the user explicitly asks for that specific page.** Prefer `archived: true`.
- **Never bulk-modify existing rows the user has manually edited without confirming.** The upsert-by-Source-ID pattern (see [00-conventions.md § 9](design/00-conventions.md#9-property-ownership-split-for-future-inbound-sync)) is for future inbound sync; today, this build only *creates* rows, never mass-updates them.
- **If the corporate-network TLS block symptom appears** (see [SETUP.md § Network check](SETUP.md#network-check-do-this-before-step-3-if-youre-on-a-corporate-machine)), stop immediately — you're on the wrong machine.
- **Halt on any 401/403.** Do not "recover" from an auth failure.
