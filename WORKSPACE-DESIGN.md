# Workspace Design — PLOS in Notion

Source of truth for what gets built in Notion. Read by Copilot Chat (via MCP) to create pages, databases, properties, and relations.

## Layout

Under a single parent page `PLOS — Second Brain`, four life-area pages:

- 🧭 **Trading**
- 💼 **Career**
- 🎓 **Cloud101 Business**
- 🧘 **Personal**

Plus an optional top-level 🏠 **Home** dashboard with linked-database views (built last).

Select / multi-select option values are copied verbatim from Prisma enums in the [PLOS Next.js app](https://github.com/wishvesh-ujawane/PLOS) (`plos-app/prisma/schema.prisma`) where applicable, so the two sides stay consistent if we ever build a syncer.

---

## 🧭 Trading

### Trades (DB)
- **Instrument** — title
- **Direction** — select: `LONG`, `SHORT`
- **Status** — select: `Open`, `Closed`, `Cancelled`
- **Entry Date** — date
- **Entry Price** — number (format: number)
- **Exit Date** — date
- **Exit Price** — number
- **Size** — number
- **PnL** — formula: `(prop("Exit Price") - prop("Entry Price")) * prop("Size") * if(prop("Direction") == "LONG", 1, -1)`
- **Setup** — multi-select: `Breakout`, `Reversal`, `Trend`, `Range`, `News`, `Earnings`, `Momentum`
- **Strategy** — relation → Strategies (single, bidirectional)
- **Screenshots** — files & media
- **Notes** — rich text

### Strategies (DB)
- **Name** — title
- **Type** — select: `Swing`, `Intraday`, `Positional`, `Options`, `Scalp`
- **Status** — select: `Active`, `Paused`, `Retired`
- **Rules** — rich text
- **Entry Criteria** — rich text
- **Exit Criteria** — rich text
- **Risk Management** — rich text
- **Trades** — relation reverse of Trades → Strategy
- **Notes** — rich text

### Trading Journal (DB)
- **Date** — title (formatted as `YYYY-MM-DD`)
- **Market Conditions** — select: `Bullish`, `Bearish`, `Choppy`, `Rangebound`, `Volatile`
- **Mood** — select: `1`, `2`, `3`, `4`, `5`
- **Lessons** — rich text
- **Mistakes** — rich text
- **Wins** — rich text
- **Screenshots** — files & media

### Trading Tasks (DB)
- **Title** — title
- **Status** — select: `Todo`, `Doing`, `Done`
- **Priority** — select: `P1`, `P2`, `P3`, `P4`
- **Type** — select: `Research`, `Backtest`, `Journal Review`, `Setup`, `Ops`
- **Due** — date
- **Notes** — rich text

### Watchlist (DB)
- **Ticker** — title
- **Sector** — select: `Tech`, `Finance`, `Energy`, `Healthcare`, `Consumer`, `Industrials`, `Materials`, `Utilities`, `Realty`, `Other`
- **Status** — select: `Watching`, `Entered`, `Skipped`
- **Thesis** — rich text
- **Target Price** — number
- **Stop Loss** — number

---

## 💼 Career

Covers **all** career-related activity — learning, implementing, certifications, job switching, interview prep. Salesforce vocabulary is preserved as first-class values inside multi-selects so the current Salesforce focus is not lost, but no DB assumes Salesforce.

### Learning (DB)
- **Title** — title
- **Type** — select: `Course`, `Certification`, `Book`, `Video / Podcast`, `Article / Blog`, `Workshop`, `Practice Project`, `Trailhead`, `Skill`
- **Domain** — multi-select: `Salesforce`, `Web Dev`, `Data / AI`, `Cloud / DevOps`, `Product / PM`, `Design`, `Leadership`, `Communication`, `System Design`, `Career Skills`, `Other`
- **Status** — select: `Active`, `Completed`, `Paused`, `Dropped`
- **Provider** — rich text
- **URL** — url
- **Progress %** — number (format: percent)
- **Started** — date
- **Completed** — date
- **Notes** — rich text

### Certifications (DB)
- **Cert Name** — title
- **Status** — select: `Planned`, `Studying`, `Scheduled`, `Passed`, `Failed`
- **Exam Date** — date
- **Score** — number
- **Cost** — number
- **Expiry Date** — date
- **Study Materials** — relation → Learning, multi
- **Notes** — rich text

### Portfolio Projects (DB)
- **Title** — title
- **Type** — select: `Portfolio`, `Coursework`, `Trailhead Superbadge`, `OSS Contribution`, `Talk / Writing`, `Personal`
- **Status** — select: `Backlog`, `In Progress`, `Done`, `Archived`
- **Domain** — multi-select: same options as Learning.Domain
- **Tech** — multi-select: `Apex`, `LWC`, `Flow`, `Integration`, `OmniStudio`, `Data Cloud`, `Experience Cloud`, `Einstein`, `SOQL`, `React`, `Next.js`, `Node`, `Python`, `SQL`, `Postgres`, `dbt`, `AWS`, `Docker`, `Kubernetes`, `Terraform`, `TypeScript`, `Rust`, `Go`, `Other`
- **Description** — rich text
- **GitHub URL** — url
- **Live URL** — url
- **Milestones** — rich text
- **Started** — date
- **Completed** — date

### Career Pipeline (DB)
- **Company** — title
- **Role** — rich text
- **Stage** — select: `Prospecting`, `Applied`, `Screen`, `Assessment`, `Onsite`, `Offer`, `Rejected`, `Withdrawn`
- **Role Type** — select: `Full-time`, `Contract`, `Freelance`, `Internship`, `Fractional`
- **Work Mode** — select: `Remote`, `Hybrid`, `Onsite`
- **Domain** — multi-select: same options as Learning.Domain
- **Applied Date** — date
- **Next Step** — rich text
- **Next Step Date** — date
- **Contact Name** — rich text
- **Contact Email** — email
- **Source** — select: `LinkedIn`, `Referral`, `Job Board`, `Recruiter`, `Company Site`, `Cold Outreach`, `Other`
- **Salary Range** — rich text
- **Notes** — rich text

### Career Tasks (DB)
- **Title** — title
- **Type** — select: `Study`, `Application`, `Networking`, `Interview Prep`, `Portfolio`
- **Status** — select: `Todo`, `Doing`, `Done`
- **Priority** — select: `P1`, `P2`, `P3`, `P4`
- **Due** — date
- **Related Application** — relation → Career Pipeline
- **Related Learning** — relation → Learning

---

## 🎓 Cloud101 Business

### Cohorts (DB)
- **Batch Name** — title
- **Track** — select: `SF Admin`, `SF Dev`, `Combined`
- **Status** — select: `Planning`, `Live`, `Completed`, `Cancelled`
- **Start Date** — date
- **End Date** — date
- **Students Count** — rollup (count of Students relation)
- **Revenue** — rollup (sum of Cloud101 Finance where kind = Revenue)
- **Notes** — rich text

### Students (DB)
- **Name** — title
- **Email** — email
- **Phone** — phone
- **Cohort** — relation → Cohorts
- **Status** — select: `Prospect`, `Enrolled`, `Active`, `Completed`, `Dropped`
- **Enrolled Date** — date
- **Payment Status** — select: `Unpaid`, `Partial`, `Paid`, `Refunded`
- **Progress %** — number (format: percent)
- **Notes** — rich text

### Curriculum (DB)
- **Module Title** — title
- **Track** — select: `SF Admin`, `SF Dev`, `Both`
- **Topic** — multi-select: `Data Model`, `Automation`, `Security`, `Apex`, `LWC`, `Integration`, `Reporting`, `Deployment`, `Testing`, `Best Practices`
- **Duration (min)** — number
- **Order** — number
- **Materials URL** — url
- **Status** — select: `Draft`, `Ready`, `Delivered`
- **Cohorts** — relation → Cohorts, multi

### Sessions (DB)
- **Session Title** — title
- **Date** — date
- **Cohort** — relation → Cohorts
- **Module** — relation → Curriculum
- **Delivered By** — select: `You`, `Friend`, `Both`, `Guest`
- **Attendance** — number
- **Duration (min)** — number
- **Recording URL** — url
- **Notes** — rich text

### Business Tasks (DB)
- **Title** — title
- **Area** — select: `Content`, `Marketing`, `Ops`, `Sales`, `Delivery`, `Finance`
- **Status** — select: `Todo`, `Doing`, `Done`
- **Priority** — select: `P1`, `P2`, `P3`, `P4`
- **Due** — date
- **Related Cohort** — relation → Cohorts
- **Assignee** — select: `You`, `Friend`, `Both`

### Cloud101 Finance (DB)
- **Date** — date
- **Description** — title
- **Kind** — select: `Revenue`, `Expense`
- **Amount** — number (format: `₹` if you want INR; otherwise plain number)
- **Category** — select: `Fees`, `Ads`, `Tools`, `Contractor`, `Refund`, `Platform`, `Other`
- **Cohort** — relation → Cohorts
- **Student** — relation → Students (optional)
- **Note** — rich text

---

## 🧘 Personal

### Tasks (DB)
- **Title** — title
- **Status** — select: `Todo`, `Doing`, `Done`
- **Priority** — select: `P1`, `P2`, `P3`, `P4`
- **Due** — date
- **Today** — checkbox
- **Project** — relation → Projects
- **Notes** — rich text

### Projects (DB)
- **Title** — title
- **Type** — select: `Personal`, `Official`
- **Status** — select: `Active`, `Paused`, `Archived`, `Abandoned`
- **Emoji** — rich text (Notion doesn't have an emoji-only property; use rich text or the page icon)
- **Color** — select: `Slate`, `Red`, `Orange`, `Amber`, `Yellow`, `Green`, `Teal`, `Blue`, `Indigo`, `Purple`, `Pink`
- **Notes** — rich text
- **Tasks** — relation reverse of Tasks → Project

### Habits (DB)
- **Title** — title
- **Ritual** — select: `Morning`, `Evening`, `None`
- **Active** — checkbox
- **Notes** — rich text
- **Logs** — relation reverse of Habit Logs → Habit

### Habit Logs (DB)
- **Date** — title (as `YYYY-MM-DD`)
- **Habit** — relation → Habits
- **Completed** — checkbox
- **Note** — rich text

### Goals (DB)
- **Title** — title
- **Category** — select: `Career`, `Health`, `Learning`, `Finance`, `Relations`, `Personal`
- **Horizon** — select: `Short`, `Medium`, `Long`
- **Target Date** — date
- **Progress %** — number (format: percent)
- **Status** — select: `Active`, `Achieved`, `Archived`

### Daily Plan (DB)
- **Date** — title (as `YYYY-MM-DD`)
- **Work Mode** — select: `WFH`, `WFO`, `Saturday`, `Sunday`
- **Top Priorities** — rich text
- **Morning Note** — rich text
- **Evening Note** — rich text
- **Time Blocks** — relation reverse of Time Blocks → Daily Plan

### Time Blocks (DB)
- **Title** — title
- **Date** — date
- **Start Time** — rich text (`HH:MM`; Notion doesn't have a native time-only prop)
- **End Time** — rich text (`HH:MM`)
- **Kind** — select: `Deep Work`, `Meeting`, `Break`, `Exercise`, `Meal`, `Commute`, `Personal`, `Ritual`, `Admin`, `Learning`, `Sleep`, `Flex`
- **Locked** — checkbox
- **Daily Plan** — relation → Daily Plan
- **Notes** — rich text

### Journal (DB)
- **Date** — title (as `YYYY-MM-DD`)
- **Mood** — select: `1`, `2`, `3`, `4`, `5`
- **Tags** — multi-select (freeform)
- *(The actual writing goes in the page body — Notion's native rich text is used instead of a property.)*

### Health Logs (DB)
- **Date** — date
- **Type** — select: `Steps`, `Sleep`, `Water`, `Workout`, `Weight`, `Mood`
- **Value** — number
- **Unit** — select: `steps`, `hr`, `L`, `min`, `kg`, `score`
- **Note** — rich text

### Personal Learning (DB)
- **Title** — title
- **Type** — select: `Course`, `Book`, `Skill`, `Certification`
- **Status** — select: `Active`, `Completed`, `Paused`, `Dropped`
- **Progress %** — number (format: percent)
- **Provider** — rich text
- **Notes** — rich text

### Ideas (DB)
- **Content** — title
- **Tags** — multi-select (freeform)
- **Archived** — checkbox
- **Promoted To** — url or rich text

### Finance Accounts (DB)
- **Name** — title
- **Kind** — select: `Checking`, `Savings`, `Credit Card`, `Cash`, `Investment`, `Loan`
- **Currency** — select: `INR`, `USD`, `EUR`, `GBP`
- **Opening Balance** — number
- **Archived** — checkbox

### Finance Categories (DB)
- **Name** — title
- **Kind** — select: `Income`, `Expense`
- **Color** — select: `Slate`, `Red`, `Orange`, `Amber`, `Yellow`, `Green`, `Teal`, `Blue`, `Indigo`, `Purple`, `Pink`
- **Archived** — checkbox

### Finance Transactions (DB)
- **Date** — date
- **Description** — title
- **Account** — relation → Finance Accounts
- **Category** — relation → Finance Categories
- **Kind** — select: `Income`, `Expense`, `Transfer`
- **Amount** — number
- **Currency** — select: `INR`, `USD`, `EUR`, `GBP`
- **Tags** — multi-select (freeform)
- **Note** — rich text

### Budgets (DB)
- **Description** — title (e.g., "Groceries — Jul 2026")
- **Category** — relation → Finance Categories
- **Month Start** — date
- **Amount** — number

---

## 🏠 Home dashboard (optional, built last)

Top-level page with linked-database views:

- **Today's tasks** — union view across Trading Tasks, Career Tasks, Business Tasks, Personal Tasks — filter `Due = Today` or `Today = true`
- **Active goals** — Goals filtered `Status = Active`, grouped by Category
- **This week's cohort sessions** — Sessions filtered `Date within this week`, sorted by Date
- **Open trades** — Trades filtered `Status = Open`
- **Recent journals** — Trading Journal + Personal Journal, sorted by Date desc, limited to 5

If the MCP server's `linked_db` block coverage turns out to be limited, fall back to a plain page with a checklist of manual "Create linked view of X, filter Y" steps.

---

## Build order (for the MCP-driven build)

To keep relations resolvable, build in this order per area:

1. Create the area page under the parent.
2. Create each database in the area with all non-relation properties.
3. After all databases in the area exist, patch each one to add its cross-DB relation properties.
4. Record every returned Notion ID into `notion-manifest.json` before moving on.

Between areas, pause so the user can verify in the Notion browser.
