# Conventions

Shared rules for every area. Read this **first** before building any area spec — the area files assume everything below.

---

## 1. Icons & colors (visual hierarchy)

Every top-level area page and every database gets a fixed emoji so the sidebar and breadcrumbs stay scannable. Icons are set via the page's `icon` property (emoji type) at creation time.

| Area page          | Icon | Database                | Icon |
| ------------------ | ---- | ----------------------- | ---- |
| Trading            | 🧭   | Trades                  | 📈   |
|                    |      | Strategies              | 🧠   |
|                    |      | Trading Journal         | 📓   |
|                    |      | Trading Tasks           | ✅   |
|                    |      | Watchlist               | 👀   |
| Salesforce Career  | ☁️   | Learning (SF)           | 📚   |
|                    |      | Certifications          | 🎖️   |
|                    |      | SF Projects             | 🛠️   |
|                    |      | Career Pipeline         | 💼   |
|                    |      | Career Tasks            | ✅   |
| Cloud101 Business  | 🎓   | Cohorts                 | 👥   |
|                    |      | Students                | 🧑‍🎓  |
|                    |      | Curriculum              | 📘   |
|                    |      | Sessions                | 🎙️   |
|                    |      | Business Tasks          | ✅   |
|                    |      | Cloud101 Finance        | 💰   |
| Personal           | 🧘   | Tasks                   | ✅   |
|                    |      | Projects                | 🗂️   |
|                    |      | Habits                  | 🔁   |
|                    |      | Habit Logs              | ✔️   |
|                    |      | Goals                   | 🎯   |
|                    |      | Daily Plan              | 📅   |
|                    |      | Time Blocks             | ⏱️   |
|                    |      | Journal                 | 📓   |
|                    |      | Health Logs             | ❤️   |
|                    |      | Personal Learning       | 📚   |
|                    |      | Ideas                   | 💡   |
|                    |      | Finance Accounts        | 🏦   |
|                    |      | Finance Categories      | 🏷️   |
|                    |      | Finance Transactions    | 💸   |
|                    |      | Budgets                 | 📊   |
| Home dashboard     | 🏠   | *(no DBs — linked views only)* |      |

## 2. Status vocabulary (canonical)

Use these exact strings anywhere a status/select property represents workflow state. Colors are Notion select colors.

| Value      | Color   | Meaning                          |
| ---------- | ------- | -------------------------------- |
| `Todo`     | gray    | Not started                      |
| `Doing`    | blue    | Actively worked on this cycle    |
| `Done`     | green   | Finished                         |
| `Blocked`  | red     | Waiting on someone/something     |
| `Archived` | default | Deliberately parked, not deleted |

Domain-specific status vocabularies (e.g. `Prospecting → Applied → Screen → …` in Career Pipeline) live in [WORKSPACE-DESIGN.md](../WORKSPACE-DESIGN.md) and override this table locally.

## 3. Priority vocabulary

`P1` (red) > `P2` (orange) > `P3` (yellow) > `P4` (gray). P1 = must ship today/this week. P4 = someday/maybe.

## 4. Date & time format

- **Date-as-title** properties (`Daily Plan`, `Journal`, `Habit Logs`, `Trading Journal`): title text is `YYYY-MM-DD`. Never use human-readable dates in the title — sort order breaks.
- **Time-of-day** properties: `HH:MM` in 24-hour, stored as rich text (Notion has no time-only type).
- **All date properties**: use Notion's native `date` type. Times inside `date` are only used when the value has an actual clock-time component (e.g. Sessions.Date).

## 5. Property naming

- **Exact casing wins.** `Due` not `due date`. `PnL` not `Pnl`. If a property already exists in `WORKSPACE-DESIGN.md`, do not rename it.
- **Relations named after the target DB in singular** (`Project`, `Cohort`, `Strategy`) unless the relation is inherently multi (`Study Materials`, `Cohorts` on Curriculum).
- **Formulas named for their output**, not their inputs (`Days Until Due`, not `Due Minus Now`).

## 6. Formula library

Reusable formulas — copy-paste as-is into any DB. Formula 2.0 syntax (Notion, as of 2025-09).

### 6.1 Days Until Due
For any DB with a `Due` date property.
```
if(empty(prop("Due")), "",
   let(d, dateBetween(prop("Due"), now(), "days"),
     if(d < 0, "Overdue " + format(abs(d)) + "d",
        if(d == 0, "Today",
           if(d == 1, "Tomorrow", format(d) + "d")))))
```

### 6.2 Priority Score
For any task DB with `Priority` (P1–P4), `Due` (date), `Status` (with `Done`).
```
if(prop("Status") == "Done", 0,
   (if(prop("Priority") == "P1", 4,
      if(prop("Priority") == "P2", 3,
         if(prop("Priority") == "P3", 2, 1)))) *
   (if(empty(prop("Due")), 1,
      if(dateBetween(prop("Due"), now(), "days") <= 0, 5,
         if(dateBetween(prop("Due"), now(), "days") <= 3, 3,
            if(dateBetween(prop("Due"), now(), "days") <= 7, 2, 1))))))
```

### 6.3 Open / Closed classifier
For rollup counting on parent DBs.
```
if(prop("Status") == "Done" or prop("Status") == "Archived" or prop("Status") == "Cancelled",
   "closed", "open")
```

### 6.4 Progress emoji bar
For any DB with a `Progress %` number (0–100).
```
let(p, floor(prop("Progress %") / 10),
  repeat("█", p) + repeat("░", 10 - p) + " " + format(prop("Progress %")) + "%")
```

### 6.5 Trade PnL (Trading)
Already in `WORKSPACE-DESIGN.md`; repeated here for the library.
```
(prop("Exit Price") - prop("Entry Price")) * prop("Size") *
  if(prop("Direction") == "LONG", 1, -1)
```

### 6.6 Trade R-multiple (Trading — add this property)
Assumes a `Risk per Trade` number property (rupees/dollars risked on entry).
```
if(empty(prop("Risk per Trade")) or prop("Risk per Trade") == 0, "",
   format(round(prop("PnL") / prop("Risk per Trade") * 100) / 100) + "R")
```

### 6.7 Age (days since created)
For any DB — uses built-in `Created time` property.
```
format(dateBetween(now(), prop("Created time"), "days")) + "d old"
```

## 7. View patterns (reuse across DBs)

For every task-like DB (`Trading Tasks`, `Career Tasks`, `Business Tasks`, `Personal Tasks`), create these five views:

| View name       | Layout   | Filter                                           | Sort                                 | Group by  |
| --------------- | -------- | ------------------------------------------------ | ------------------------------------ | --------- |
| **Today**       | table    | `Today` = ✓  OR  `Due` = today                   | `Priority Score` desc                | —         |
| **This Week**   | table    | `Due` this week AND `Status` ≠ `Done`            | `Due` asc, `Priority Score` desc     | —         |
| **Backlog**     | board    | `Status` ≠ `Done` AND `Status` ≠ `Archived`      | manual                               | `Status`  |
| **By Priority** | board    | `Status` ≠ `Done`                                | `Due` asc                            | `Priority`|
| **Done Log**    | table    | `Status` = `Done`                                | `Last edited time` desc              | —         |
| **Archive**     | table    | `Status` = `Archived`                            | `Last edited time` desc              | —         |

For every date-titled log DB (`Daily Plan`, `Journal`, `Habit Logs`, `Trading Journal`), create:

| View name    | Layout    | Filter        | Sort         |
| ------------ | --------- | ------------- | ------------ |
| **Recent**   | table     | last 30 days  | `Date` desc  |
| **Calendar** | calendar  | —             | —            |
| **All**      | table     | —             | `Date` desc  |

## 8. Templates convention

Every DB that captures a repeatable structure (daily plan, trade, meeting, session) gets **at least one page template** stored on the DB (not free-floating pages). Template body is written as Markdown block sequences the home-PC agent will feed to `API-update-page-markdown` after creating the template with `API-post-page`.

## 9. Property-ownership split (for future inbound sync)

If you later wire Gmail/Calendar/GitHub/etc. into any of these DBs, split every property into **pipeline-owned** vs **user-owned**. The upsert step must never touch user-owned properties on re-sync.

- **Pipeline-owned** examples: `Source ID`, `Source URL`, `Subject/Title`, `Sender`, `Sent Date`, `Raw Body`.
- **User-owned** examples: `Status`, `Priority`, `Tags`, `Project`, `Notes`, any relation you manually curate.

Add a `Source ID` (rich text) + `Source URL` (url) to any DB that will ever receive external items. Not needed for pure Notion-native DBs.

## 10. Archive, don't delete

Never call `API-delete-a-block` or archive-with-purge. Add an `Archived` filter view to every DB and use `archived: true` on the page (soft-delete). All DBs already have a `Status = Archived` or an `Archived` checkbox in their schema.
