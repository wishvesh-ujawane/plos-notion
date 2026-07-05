# 🏠 Home Dashboard — full spec

The top-level page users land on. Zero new databases — only **linked-database views** of the DBs built in areas 01–04. Build this **last**, after every area's DBs and views exist.

Icon: 🏠. Parent: **PLOS — Second Brain** (sits directly under the parent, above the four area pages in the sidebar).

---

## Page structure

Top-to-bottom layout (each `##` is a Notion heading_2 block; each linked view is one linked_database block underneath):

```
🏠 PLOS — Home
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Callout: "One page. Today, this week, and what matters. Everything else lives in the area pages."

## 🎯 Today
   (linked view)  Today — Tasks (union)
   (linked view)  Today — Time Blocks
   (linked view)  Today — Habits to log

## 🗓️ This week
   (linked view)  This week — Tasks
   (linked view)  This week — Cohort Sessions
   (linked view)  This week — Career follow-ups

## 🎯 Goals & Projects
   (linked view)  Active goals (by category)
   (linked view)  Active projects
   (linked view)  Active certifications

## 📈 Trading pulse
   (linked view)  Open trades
   (linked view)  Recent trading journal

## 🎓 Cohorts pulse
   (linked view)  Live cohorts
   (linked view)  At-risk students

## 💰 Money pulse
   (linked view)  This month's transactions
   (linked view)  Over-budget categories

## 📓 Recent thinking
   (linked view)  Recent personal journal
   (linked view)  Idea inbox

## 🔧 System
   (linked view)  Blocked tasks (anywhere)
   (linked view)  Archive candidates (stale > 90 days)
```

---

## Linked view specs

Each row describes one linked_database block. `Source` = which underlying DB the view reads from. `Filter/Sort/Group` are the settings applied to that specific linked view (they don't affect the source DB's own views). Layout defaults to `table` unless stated.

### 🎯 Today

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| Today — Tasks (union) | Personal Tasks | `Today` = ✓ OR `Due` = today | `Priority Score` desc | `Area` | table |
| Today — Time Blocks | Time Blocks | `Date` = today | `Start Time` asc | `Kind` | table |
| Today — Habits to log | Habits | `Active` = ✓ | `Ritual` asc | `Ritual` | table |

> **Note:** True "union across four task DBs" is not natively supported by a single linked view. Recommended pattern: consolidate day-of tasks in **Personal Tasks** with `Area` set to Trading/Career/Cloud101/Personal so a single view can show them all. Area-specific task DBs stay for planning; day-of pull is one place.
> Alternative: create three separate linked views (Trading Tasks / Career Tasks / Business Tasks / Personal Tasks) and stack them under the same heading.

### 🗓️ This week

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| This week — Tasks | Personal Tasks | `Due` this week AND `Status` ≠ `Done` | `Due` asc, `Priority Score` desc | `Area` | table |
| This week — Cohort Sessions | Sessions | `Date` this week | `Date` asc | `Cohort` | table |
| This week — Career follow-ups | Career Pipeline | `Next Step Date` this week | `Next Step Date` asc | — | table |

### 🎯 Goals & Projects

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| Active goals | Goals | `Status` = `Active` | `Target Date` asc | `Category` | board |
| Active projects | Projects | `Status` = `Active` | `Progress %` desc | `Type` | gallery |
| Active certifications | Certifications | `Status` in [`Studying`, `Scheduled`] | `Exam Date` asc | — | table |

### 📈 Trading pulse

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| Open trades | Trades | `Status` = `Open` | `Entry Date` desc | — | table |
| Recent trading journal | Trading Journal | last 14 days | `Date` desc | — | gallery |

### 🎓 Cohorts pulse

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| Live cohorts | Cohorts | `Status` = `Live` | `Start Date` desc | — | gallery |
| At-risk students | Students | `At Risk` = `⚠️` | `Progress %` asc | `Cohort` | table |

### 💰 Money pulse

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| This month's transactions | Finance Transactions | `Date` this month | `Date` desc | `Kind` | table |
| Over-budget categories | Budgets | `Over Budget` = `🚨` | `Utilization %` desc | — | table |

### 📓 Recent thinking

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| Recent personal journal | Journal | last 14 days | `Date` desc | — | gallery |
| Idea inbox | Ideas | `Archived` = ✗ AND `Promoted To` empty | `Created time` desc | — | gallery |

### 🔧 System

| Name | Source | Filter | Sort | Group | Layout |
| --- | --- | --- | --- | --- | --- |
| Blocked tasks (anywhere) | Personal Tasks | `Status` = `Blocked` | `Due` asc | `Area` | table |
| Archive candidates (stale > 90 days) | Personal Tasks | `Status` ≠ `Done` AND `Last edited time` > 90 days ago | `Last edited time` asc | `Area` | table |

---

## Fallback plan

If the MCP server can't create a `linked_database` block with all filters/sorts pre-applied (this happens; the Notion API's block-creation coverage for linked databases is thinner than for other block types), the home-PC agent should:

1. Create the plain page with all the headings and callouts.
2. Under each heading, insert a plain paragraph like `TODO: manually add a linked view of <DB> filtered by <criteria>`.
3. Report to the user which linked views could not be created programmatically so the user can add them manually via the Notion UI (`/ Linked view of database`, pick DB, apply filter/sort/group). This is a ~2-min manual step per view and only happens once.

---

## Home dashboard build order

1. Create the 🏠 Home page as a **child of `PLOS — Second Brain`**, sibling to the four area pages.
2. Insert the intro callout.
3. For each section (`##` heading), insert the heading, then attempt each linked view underneath.
4. If a linked view creation fails, insert the TODO fallback paragraph and continue — do not abort the whole build.
5. After the whole page is built, report a summary of `<count>` linked views created / `<count>` fallback TODOs.
