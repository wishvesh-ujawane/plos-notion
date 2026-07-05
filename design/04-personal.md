# 🧘 Personal — full spec

Layers on top of the schema in [WORKSPACE-DESIGN.md § Personal](../WORKSPACE-DESIGN.md). Conventions: [00-conventions.md](00-conventions.md).

Area page icon: 🧘. Body: heading `Personal` + text line "Life OS: tasks, projects, habits, goals, journal, finance, health." + linked-DB block per DB, grouped under three sub-headings:
- **Do** — Tasks, Projects, Daily Plan, Time Blocks
- **Grow** — Goals, Habits, Habit Logs, Personal Learning, Journal, Ideas
- **Steward** — Health Logs, Finance Accounts, Finance Categories, Finance Transactions, Budgets

---

## Extra properties (add beyond WORKSPACE-DESIGN.md)

### Tasks — add
- **Priority Score** — formula → [00-conventions.md § 6.2](00-conventions.md#62-priority-score)
- **Days Until Due** — formula → [00-conventions.md § 6.1](00-conventions.md#61-days-until-due)
- **Area** — select: `Trading`, `Career`, `Cloud101`, `Personal`, `Home`, `Health`, `Finance` — so the Home dashboard can filter
  - _(Even though each area has its own Tasks-like DB, Personal Tasks is your general catch-all. The `Area` select lets the "Today across life" dashboard aggregate them all.)_

### Projects — add
- **Open Tasks** — rollup of Tasks → count where `Status` ≠ `Done`
- **Total Tasks** — rollup of Tasks → count all
- **Progress %** — formula: `if(prop("Total Tasks") == 0, 0, round((prop("Total Tasks") - prop("Open Tasks")) / prop("Total Tasks") * 100))`
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar)

### Habits — add
- **Logs Last 7 Days** — rollup of `Habit Logs` → count where `Date` within last 7 days AND `Completed` = ✓
- **7-Day Streak %** — formula: `format(round(prop("Logs Last 7 Days") / 7 * 100)) + "%"`

### Habit Logs — no additions.

### Goals — add
- **Days to Target** — formula → [00-conventions.md § 6.1](00-conventions.md#61-days-until-due) (using `Target Date` as `Due`)
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar)

### Daily Plan — add
- **Blocks Planned** — rollup of Time Blocks → count all
- **Deep Work Hours** — rollup of Time Blocks → sum of `Duration (min)` where `Kind` = `Deep Work`, then divide by 60 via a formula → **Deep Work Hours (fmt)**: `format(round(prop("Deep Work Minutes") / 6) / 10) + "h"`
  - _(Roll up as minutes because rollups can't divide.)_

### Time Blocks — add
- **Duration (min)** — formula (rich text → number conversion): assume `Start Time`/`End Time` are `HH:MM` strings. Notion has no native time-diff; simplest workaround is a manual `Duration (min)` number property that you fill in. Only implement the formula version if you're willing to parse strings in Formula 2.0.

### Journal — no additions (page body carries the writing).

### Health Logs — add
- **Week of** — formula: `formatDate(dateStart(dateSubtract(prop("Date"), dayOfTheWeek(prop("Date")) - 1, "days")), "YYYY-MM-DD")` (for weekly grouping)

### Personal Learning — add
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar)
- **Days Since Started** — formula: `if(empty(prop("Started")), "", format(dateBetween(now(), prop("Started"), "days")) + "d")`
- _(No `Started` in schema — add a `Started` date property to Personal Learning as part of this expansion.)_

### Ideas — add
- **Age (days)** — formula → [00-conventions.md § 6.7](00-conventions.md#67-age-days-since-created)

### Finance Accounts — no additions beyond `Archived`.

### Finance Categories — no additions.

### Finance Transactions — add
- **Signed Amount** — formula: `if(prop("Kind") == "Expense", -1 * prop("Amount"), if(prop("Kind") == "Income", prop("Amount"), 0))` (`Transfer` = 0 so it doesn't skew net)
- **Month** — formula: `formatDate(prop("Date"), "YYYY-MM")`

### Budgets — add
- **Spent** — rollup of Finance Transactions where `Category` matches AND `Date` within month starting `Month Start` → sum of `Amount` where `Kind` = `Expense`
  - _(Rollup filter-across-relation may need a helper property on transactions; if the direct rollup filter is limited, add a `Budget` relation to Finance Transactions and roll up through that instead.)_
- **Remaining** — formula: `prop("Amount") - prop("Spent")`
- **Utilization %** — formula: `if(prop("Amount") == 0, "", format(round(prop("Spent") / prop("Amount") * 100)) + "%")`
- **Over Budget** — formula: `if(prop("Spent") > prop("Amount"), "🚨", "")`

---

## Views

### Tasks
Five standard task views from [00-conventions.md § 7](00-conventions.md#7-view-patterns-reuse-across-dbs) plus:
| View        | Layout | Filter                                     | Sort         | Group    |
| ----------- | ------ | ------------------------------------------ | ------------ | -------- |
| **By Area** | board  | `Status` ≠ `Done`                          | `Due` asc    | `Area`   |
| **By Project** | board | `Status` ≠ `Done` AND `Project` is not empty | `Due` asc | `Project`|

### Projects
| View        | Layout   | Filter                       | Sort                | Group   |
| ----------- | -------- | ---------------------------- | ------------------- | ------- |
| **Active**  | gallery  | `Status` = `Active`          | `Progress %` desc   | `Type`  |
| **Board**   | board    | `Status` ≠ `Archived`        | —                   | `Status`|
| **All**     | table    | —                            | `Title` asc         | —       |

### Habits
| View         | Layout | Filter               | Sort         | Group   |
| ------------ | ------ | -------------------- | ------------ | ------- |
| **Morning**  | table  | `Ritual` = `Morning` AND `Active` = ✓ | `Title` asc | — |
| **Evening**  | table  | `Ritual` = `Evening` AND `Active` = ✓ | `Title` asc | — |
| **All Active** | table | `Active` = ✓        | `Ritual` asc | `Ritual`|
| **Retired**  | table  | `Active` = ✗         | `Title` asc  | —       |

### Habit Logs
Standard date-log views ([00-conventions.md § 7](00-conventions.md#7-view-patterns-reuse-across-dbs)) plus:
| View        | Layout | Filter               | Sort              | Group   |
| ----------- | ------ | -------------------- | ----------------- | ------- |
| **Today**   | table  | `Date` = today       | —                 | `Habit` |

### Goals
| View            | Layout | Filter                     | Sort               | Group      |
| --------------- | ------ | -------------------------- | ------------------ | ---------- |
| **Active**      | board  | `Status` = `Active`        | `Target Date` asc  | `Category` |
| **By Horizon**  | table  | `Status` = `Active`        | `Target Date` asc  | `Horizon`  |
| **Achieved**    | gallery| `Status` = `Achieved`      | `Target Date` desc | —          |

### Daily Plan
Standard date-log views plus:
| View       | Layout   | Filter                | Sort         |
| ---------- | -------- | --------------------- | ------------ |
| **Today**  | table    | `Date` = today        | —            |
| **WFH days** | table  | `Work Mode` = `WFH`   | `Date` desc  |

### Time Blocks
| View          | Layout   | Filter                  | Sort              | Group  |
| ------------- | -------- | ----------------------- | ----------------- | ------ |
| **Today**     | table    | `Date` = today          | `Start Time` asc  | `Kind` |
| **This Week** | timeline | `Date` this week        | —                 | —      |
| **By Kind**   | board    | `Date` this week        | `Start Time` asc  | `Kind` |

### Journal
Standard date-log views plus:
| View       | Layout | Filter          | Sort         |
| ---------- | ------ | --------------- | ------------ |
| **Recent** | gallery| last 30 days    | `Date` desc  |

### Health Logs
| View            | Layout   | Filter        | Sort         | Group    |
| --------------- | -------- | ------------- | ------------ | -------- |
| **This Week**   | table    | `Date` this week | `Date` desc | `Type`   |
| **By Type**     | table    | —             | `Date` desc  | `Type`   |
| **By Week**     | table    | —             | `Date` desc  | `Week of`|

### Personal Learning
| View          | Layout | Filter               | Sort               | Group  |
| ------------- | ------ | -------------------- | ------------------ | ------ |
| **In Progress** | board | `Status` = `Active`  | —                  | `Type` |
| **Completed** | gallery| `Status` = `Completed` | `Title` asc      | —      |
| **All**       | table  | —                    | `Title` asc        | —      |

### Ideas
| View         | Layout   | Filter                 | Sort              | Group   |
| ------------ | -------- | ---------------------- | ----------------- | ------- |
| **Inbox**    | gallery  | `Archived` = ✗ AND `Promoted To` empty | `Created time` desc | — |
| **Promoted** | table    | `Promoted To` not empty | `Created time` desc | —  |
| **Archive**  | table    | `Archived` = ✓         | `Created time` desc | —   |

### Finance Accounts
| View         | Layout | Filter          | Sort         | Group     |
| ------------ | ------ | --------------- | ------------ | --------- |
| **Active**   | table  | `Archived` = ✗  | `Kind` asc   | `Kind`    |
| **All**      | table  | —               | `Name` asc   | —         |

### Finance Categories
| View         | Layout | Filter          | Sort         | Group     |
| ------------ | ------ | --------------- | ------------ | --------- |
| **Income**   | table  | `Kind` = `Income` AND `Archived` = ✗ | `Name` asc | — |
| **Expense**  | table  | `Kind` = `Expense` AND `Archived` = ✗ | `Name` asc | — |

### Finance Transactions
| View                | Layout | Filter                     | Sort         | Group     |
| ------------------- | ------ | -------------------------- | ------------ | --------- |
| **All**             | table  | —                          | `Date` desc  | —         |
| **This Month**      | table  | `Date` this month          | `Date` desc  | `Kind`    |
| **By Month**        | table  | —                          | `Date` desc  | `Month`   |
| **By Category**     | board  | `Date` this month          | —            | `Category`|
| **Income**          | table  | `Kind` = `Income`          | `Date` desc  | `Category`|
| **Expenses**        | table  | `Kind` = `Expense`         | `Date` desc  | `Category`|

### Budgets
| View          | Layout | Filter                 | Sort           | Group      |
| ------------- | ------ | ---------------------- | -------------- | ---------- |
| **This Month**| table  | `Month Start` = this month start | `Category` asc | — |
| **Over Budget** | table | `Over Budget` = `🚨`   | `Utilization %` desc | — |
| **All**       | table  | —                      | `Month Start` desc | `Month Start` |

---

## Templates

### Tasks → template "Deep Task"
Icon: 🎯. Body:

```markdown
## Definition of done
_One sentence — what does completed look like?_

## Steps
- [ ] 
- [ ] 
- [ ] 

## Blockers / assumptions
```

### Projects → template "New Project"
Icon: 🗂️. Body:

```markdown
## Why
_What outcome does this project enable? What would you regret not doing?_

## Definition of done
_Concrete, testable._

## Milestones
- [ ] M1 — 
- [ ] M2 — 
- [ ] M3 — 

## First 3 tasks
_(Create these in Tasks with `Project` = this page.)_
1. 
2. 
3. 

## Log
_(Weekly notes — what shipped, what's stuck.)_
```

### Daily Plan → template "Daily Plan (weekday)"
Icon: 📅. Body:

```markdown
## 🌅 Morning ritual (06:00–07:30)
- [ ] Wake, water
- [ ] 20-min walk
- [ ] Meditation 10 min
- [ ] Review yesterday's journal
- [ ] Set today's top 3

## 🎯 Top 3 today
1. 
2. 
3. 

## ⏱️ Time blocks
_(Create Time Block rows below with `Daily Plan` = this page.)_

## 📓 Evening reflection (21:00–21:30)
- Wins:
- Fumbles:
- Grateful for:
- Tomorrow's top thing:
```

### Daily Plan → template "Daily Plan (weekend)"
Icon: 📅. Body:

```markdown
## 🌅 Slow start
- [ ] Wake, water
- [ ] Long walk (45 min)

## 🎯 Weekend intentions
- Rest thing:
- One personal project block:
- One family/relationship thing:

## ⏱️ Time blocks

## 📓 Reflection
```

### Journal → template "Daily Journal"
Icon: 📓. Body:

```markdown
_(Just write. Prompts below only if stuck.)_

---

## Prompts
- What am I avoiding?
- What am I grateful for?
- What made today's version of me proud?
- What did I learn?
```

### Journal → template "Weekly Review" (set to "Repeat weekly" if you use Notion's repeating templates)
Icon: 🗓️. Body:

```markdown
## Wins this week
- 

## Fumbles this week
- 

## What I want to protect
_Practices / people / routines that worked._

## What I want to change
_Small experiments for next week._

## Goals check
_(Open Goals view alongside — mark progress %.)_

## Next week's top 3
1. 
2. 
3. 
```

### Journal → template "Monthly Review"
Icon: 📆. Body:

```markdown
## Highlights
- 

## Lowlights
- 

## By area
### Trading
- 
### Salesforce
- 
### Cloud101
- 
### Personal
- 

## Numbers
- Trades taken / won:
- Study hours:
- Cohort revenue:
- Habits % completion:
- Deep work hours:

## Themes / lessons
- 

## Next month's north star
_One sentence._
```

### Habit Logs → template "Today's Habits"
Icon: ✔️. Body:

```markdown
_(One row per habit per day. Tick `Completed` if done.)_

Suggested workflow: use a button-based automation later; for now, run the "New batch" script or manually add rows.
```

### Health Logs → template "Log Workout"
Icon: 💪. Body:

```markdown
## What
_(e.g. Push day, run 5k, yoga.)_

## Numbers
- Duration:
- Intensity (RPE 1–10):
- Highlight movement:

## Notes
```

### Personal Learning → template "New Learning Item"
Icon: 📚. Body:

```markdown
## Why this
_What's the problem or curiosity driving it?_

## Plan
- [ ] Read/watch/build:
- [ ] Notes → distill top 5 ideas
- [ ] Ship one artifact (blog post / project / talk)

## Notes
_(Distill as you go — atomic ideas, not transcript.)_

## What I'll do with this
_A specific behavior change or output._
```

### Finance Transactions → template "Reimbursable Expense"
Icon: 💸. Body:

```markdown
_(Attach receipt image below.)_

## Details
- Purpose:
- Reimbursement expected from:
- Submitted on:
- Reimbursement received on:
```

---

## Seed rows

### Projects (seed FIRST so tasks can reference)
| Title                             | Type     | Status | Notes (short)                    |
| --------------------------------- | -------- | ------ | -------------------------------- |
| PLOS second brain (this workspace)| Personal | Active | Meta-project: build & maintain it|
| Home renovation — kitchen         | Personal | Paused | Waiting on contractor quotes     |
| Weekend blog restart              | Personal | Active | 1 post/month minimum             |

### Tasks
| Title                                    | Status | Priority | Area     | Due        | Today | Project                           |
| ---------------------------------------- | ------ | -------- | -------- | ---------- | ----- | --------------------------------- |
| Book dentist appointment                 | Todo   | P2       | Health   | 2026-07-08 | ✗     |                                   |
| Draft blog post #1                       | Doing  | P2       | Personal | 2026-07-15 | ✓     | Weekend blog restart              |
| Weekly grocery run                       | Todo   | P3       | Home     | 2026-07-05 | ✗     |                                   |
| Backup laptop to external SSD            | Todo   | P4       | Personal | 2026-07-31 | ✗     |                                   |

### Habits
| Title                | Ritual  | Active |
| -------------------- | ------- | ------ |
| Meditation 10 min    | Morning | ✓      |
| 30-min walk          | Morning | ✓      |
| Read 20 pages        | Evening | ✓      |
| Journal              | Evening | ✓      |
| No phone 30 min pre-bed | Evening | ✓   |

### Habit Logs (last 3 days as example)
| Date       | Habit             | Completed | Note              |
| ---------- | ----------------- | --------- | ----------------- |
| 2026-07-01 | Meditation 10 min | ✓         |                   |
| 2026-07-01 | 30-min walk       | ✓         |                   |
| 2026-07-01 | Journal           | ✗         | Slept early       |
| 2026-07-02 | Meditation 10 min | ✓         |                   |
| 2026-07-02 | 30-min walk       | ✗         | Rain              |
| 2026-07-03 | Meditation 10 min | ✓         |                   |

### Goals
| Title                                | Category  | Horizon | Target Date | Progress % | Status |
| ------------------------------------ | --------- | ------- | ----------- | ---------- | ------ |
| Pass PD1 certification               | Career    | Short   | 2026-08-15  | 40         | Active |
| 2 Cloud101 cohorts / quarter         | Career    | Medium  | 2026-09-30  | 55         | Active |
| Run first half-marathon              | Health    | Medium  | 2026-11-30  | 25         | Active |
| Read 24 books in 2026                | Learning  | Long    | 2026-12-31  | 65         | Active |

### Daily Plan
| Date       | Work Mode | Top Priorities (short)             |
| ---------- | --------- | ---------------------------------- |
| 2026-07-01 | WFO       | Cohort ops, PD1 study, journal     |
| 2026-07-02 | WFH       | Deep work on portfolio project     |
| 2026-07-03 | WFH       | This workspace + weekly review     |

### Time Blocks (example day)
| Title                | Date       | Start | End   | Kind        | Locked |
| -------------------- | ---------- | ----- | ----- | ----------- | ------ |
| Morning ritual       | 2026-07-03 | 06:00 | 07:30 | Ritual      | ✓      |
| PLOS build session   | 2026-07-03 | 09:00 | 11:00 | Deep Work   | ✓      |
| Cohort session       | 2026-07-03 | 20:00 | 21:30 | Meeting     | ✓      |

### Journal
| Date       | Mood | Tags                    |
| ---------- | ---- | ----------------------- |
| 2026-07-01 | 4    | wins, focus             |
| 2026-07-02 | 3    | tired, rain, admin      |
| 2026-07-03 | 5    | shipping, momentum      |

### Health Logs
| Date       | Type    | Value | Unit  |
| ---------- | ------- | ----- | ----- |
| 2026-07-01 | Sleep   | 7     | hr    |
| 2026-07-01 | Steps   | 8200  | steps |
| 2026-07-01 | Water   | 2.8   | L     |
| 2026-07-02 | Workout | 45    | min   |

### Personal Learning
| Title                       | Type    | Status  | Progress % |
| --------------------------- | ------- | ------- | ---------- |
| Deep Work — Cal Newport     | Book    | Active  | 60         |
| Systems Thinking mini-course| Course  | Active  | 25         |
| Handstand progression       | Skill   | Paused  | 10         |

### Ideas
| Content                                                  | Tags                    |
| -------------------------------------------------------- | ----------------------- |
| Newsletter: "one Salesforce trick per week"              | writing, cloud101       |
| Youtube: teach LWC through building 30 mini-projects     | video, cloud101, career |
| Automation: parse bank SMS → drop rows into Finance DB   | tooling, personal       |

### Finance Accounts
| Name                | Kind        | Currency | Opening Balance |
| ------------------- | ----------- | -------- | --------------- |
| HDFC Savings        | Savings     | INR      | 250000          |
| HDFC Credit Card    | Credit Card | INR      | 0               |
| Cash wallet         | Cash        | INR      | 3000            |
| Zerodha (invest)    | Investment  | INR      | 180000          |

### Finance Categories
| Name           | Kind    |
| -------------- | ------- |
| Salary         | Income  |
| Cohort revenue | Income  |
| Trading PnL    | Income  |
| Rent           | Expense |
| Groceries      | Expense |
| Utilities      | Expense |
| Health         | Expense |
| Learning       | Expense |
| Subscriptions  | Expense |
| Eating out     | Expense |
| Transport      | Expense |

### Finance Transactions (last 5 days)
| Date       | Description                | Account          | Category   | Kind    | Amount |
| ---------- | -------------------------- | ---------------- | ---------- | ------- | ------ |
| 2026-07-01 | Monthly salary             | HDFC Savings     | Salary     | Income  | 90000  |
| 2026-07-01 | Rent                       | HDFC Savings     | Rent       | Expense | 22000  |
| 2026-07-02 | Groceries (BigBasket)      | HDFC Credit Card | Groceries  | Expense | 4200   |
| 2026-07-02 | Notion Plus subscription   | HDFC Credit Card | Subscriptions | Expense | 800 |
| 2026-07-03 | Cohort payment — Ananya    | HDFC Savings     | Cohort revenue | Income | 25000 |

### Budgets (this month)
| Description               | Category      | Month Start | Amount |
| ------------------------- | ------------- | ----------- | ------ |
| Groceries — Jul 2026      | Groceries     | 2026-07-01  | 12000  |
| Eating out — Jul 2026     | Eating out    | 2026-07-01  | 5000   |
| Subscriptions — Jul 2026  | Subscriptions | 2026-07-01  | 3000   |
| Learning — Jul 2026       | Learning      | 2026-07-01  | 4000   |
