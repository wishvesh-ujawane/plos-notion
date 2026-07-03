# 🧭 Trading — full spec

Layers on top of the schema in [WORKSPACE-DESIGN.md § Trading](../WORKSPACE-DESIGN.md). Conventions: [00-conventions.md](00-conventions.md).

Area page icon: 🧭. Area page body: one heading `Trading` + one text line "Live trades, journal, playbook. Nothing here is investment advice." + a linked-database block for each DB below.

---

## Extra properties (add beyond WORKSPACE-DESIGN.md)

### Trades — add (full-fledged per-trade journal)

**Trades is the per-trade journal.** Each row is one trade; the page body carries the prose write-up (thesis / plan / live log / exit / review). Properties below cover everything you want to *filter, sort, group, and roll up on*.

Organize into six property groups so the "Edit properties" panel stays scannable (Notion → DB `···` → Manage properties → drag into groups). Group order = recommended left-to-right column order in the default table view.

#### Group A — Identity (already in [WORKSPACE-DESIGN.md § Trading](../WORKSPACE-DESIGN.md), no change)
Instrument · Direction · Status · Entry Date · Entry Price · Exit Date · Exit Price · Size · Setup · Strategy · Notes · Screenshots

#### Group B — Risk & performance (add)
- **Instrument Type** — select: `Equity`, `Options`, `Futures`, `Currency`, `Crypto`, `Commodity`, `ETF`, `Index`
- **Timeframe** — select: `1m`, `5m`, `15m`, `1h`, `4h`, `Daily`, `Weekly` (the chart timeframe you actually traded off)
- **Session** — select: `Pre-open`, `Opening`, `Mid-morning`, `Afternoon`, `Closing`, `After-hours`
- **Risk per Trade** — number (currency; one currency per workspace)
- **Stop Loss** — number
- **Target 1** — number
- **Target 2** — number
- **Fees & Slippage** — number (brokerage + slippage total, absolute)
- **Net PnL** — formula: `prop("PnL") - prop("Fees & Slippage")`
- **R-multiple** — formula → [00-conventions.md § 6.6](00-conventions.md#66-trade-r-multiple-trading--add-this-property)
- **MAE** — number (Max Adverse Excursion — deepest paper loss during the hold, absolute ₹/$)
- **MFE** — number (Max Favorable Excursion — highest paper profit during the hold)
- **Days Held** — formula: `if(empty(prop("Exit Date")), dateBetween(now(), prop("Entry Date"), "days"), dateBetween(prop("Exit Date"), prop("Entry Date"), "days"))`
- **Outcome** — formula: `if(prop("Status") != "Closed", "—", if(prop("PnL") > 0, "Win", if(prop("PnL") < 0, "Loss", "Scratch")))`

#### Group C — Process discipline (add)
_These are what turn "a bunch of trades" into a real learning system. Fill honestly, not to make yourself look good._
- **Setup Quality** — select: `A+`, `A`, `B`, `C`, `D` — your subjective grade of how textbook the setup was at entry (colors: green, green, blue, yellow, red)
- **Conviction** — select: `Low`, `Medium`, `High`
- **Entry Trigger** — multi-select: `Breakout`, `Pullback`, `Reversal candle`, `Volume spike`, `Trendline break`, `Level test`, `MA bounce`, `Divergence`, `News/Catalyst`, `Order flow`, `Gap fill`, `Range extreme`
- **Followed Plan?** — select: `Fully`, `Mostly`, `Partially`, `No`  (colors: green, blue, yellow, red)
- **Rule Broken** — multi-select: `Moved stop`, `Averaged down loser`, `Chased entry`, `Cut winner early`, `Held loser too long`, `Oversized`, `Under-sized`, `No stop`, `Traded outside window`, `No thesis`, `News chase`, `Revenge trade`, `Ignored signal`, `Overtraded`
- **Mistake Category** — multi-select: `Setup selection`, `Entry timing`, `Exit timing`, `Position sizing`, `Stop placement`, `Psychology`, `Risk management`, `Preparation`, `None`

#### Group D — Psychology (add)
- **Emotion at Entry** — select: `Calm`, `Confident`, `Uncertain`, `Anxious`, `FOMO`, `Revenge`, `Bored`, `Excited`  (colors: green, green, yellow, orange, red, red, gray, orange)
- **Emotion at Exit** — select: (same options as Emotion at Entry)
- **Mood Shift** — formula: `if(empty(prop("Emotion at Entry")) or empty(prop("Emotion at Exit")), "", prop("Emotion at Entry") + " → " + prop("Emotion at Exit"))`
- **Physical State** — multi-select: `Well-rested`, `Tired`, `Hungry`, `Caffeinated`, `Stressed`, `Post-workout`, `Sick` (optional — only if you want to correlate)

#### Group E — Learning & review (add)
- **Lesson** — rich text (kept SHORT — one sentence, the ONE thing this trade taught you; feeds the Lessons Library view)
- **Reviewed?** — checkbox (tick after you've filled the post-trade section in the page body)
- **Days Since Exit Unreviewed** — formula: `if(prop("Status") != "Closed" or prop("Reviewed?"), "", format(dateBetween(now(), prop("Exit Date"), "days")) + "d unreviewed")`
- **Do Again?** — select: `Yes`, `No`, `Only if A+`, `Never` (would you take this exact trade again knowing what you know now?)

#### Group F — Media & tags (add)
- **Chart: Entry** — files & media (annotated chart at moment of entry)
- **Chart: Exit** — files & media (chart at exit)
- **Chart: Analysis** — files & media (higher-timeframe context, hindsight annotation, anything else)
- **Tags** — multi-select (freeform — e.g. `earnings-week`, `expiry-day`, `gap-up`, `first-15min`, `illiquid`)

> **Screenshot workflow — read this carefully.**
> The Notion API **cannot upload files** — it only accepts `type: "external"` file entries pointing at a public URL. The home-PC agent must **create the `Chart: *` properties as empty file properties** and leave them for the user to populate in the Notion UI.
>
> **How to actually attach screenshots** (any of these — pick one):
> 1. **Paste directly into the page body** (Ctrl+V). Notion's UI stores it on their CDN, no external hosting needed. This is the fastest workflow — the "New Trade" template has explicit `Chart: entry` / `Chart: exit` placeholders in the body for exactly this.
> 2. **Drag-drop into the `Chart: *` file properties** in the Notion UI. Same result, but the file lives on the property (shows as a thumbnail on the table row) instead of inline in the body.
> 3. **External URL**: host on imgur / S3 / Cloudinary and set the file property via API — only useful if you're automating from a screenshot pipeline later.
>
> Use option 1 for daily work. The property columns are mostly for the top-of-table thumbnail so you can scan the "Winners" view visually.

### Strategies — add rollups (after Trades relation exists)
- **# Trades** — rollup of Trades → `Instrument` → count all
- **Win Rate %** — rollup of Trades → `Outcome` → percent per group where value = `Win` (Notion supports "percent per group"; if not, fall back to two rollups: count `Win` + count `Closed`, and a formula that divides them)
- **Total PnL** — rollup of Trades → `PnL` → sum

### Trading Journal — add
- **Trades on Date** — relation → Trades (multi; user manually links relevant trades)

---

## Views

### Trades
| View                    | Layout   | Filter                                                     | Sort                              | Group             |
| ----------------------- | -------- | ---------------------------------------------------------- | --------------------------------- | ----------------- |
| **Open**                | table    | `Status` = `Open`                                          | `Entry Date` desc                 | —                 |
| **This Week**           | table    | `Entry Date` this week                                     | `Entry Date` desc                 | —                 |
| **By Setup**            | board    | `Status` = `Closed`                                        | `Entry Date` desc                 | `Setup`           |
| **Winners**             | table    | `Outcome` = `Win`                                          | `R-multiple` desc                 | —                 |
| **Losers**              | table    | `Outcome` = `Loss`                                         | `R-multiple` asc                  | —                 |
| **Calendar**            | calendar | —                                                          | on `Entry Date`                   | —                 |
| **All**                 | table    | —                                                          | `Entry Date` desc                 | —                 |
| **📓 Unreviewed**       | table    | `Status` = `Closed` AND `Reviewed?` = ✗                    | `Exit Date` desc                  | —                 |
| **📓 By Quality**       | board    | `Status` = `Closed`                                        | `Entry Date` desc                 | `Setup Quality`   |
| **📓 A+ Only**          | gallery  | `Setup Quality` = `A+`                                     | `Entry Date` desc                 | —                 |
| **📓 Rule Breaks**      | table    | `Rule Broken` is not empty                                 | `Entry Date` desc                 | `Rule Broken`     |
| **📓 By Emotion**       | board    | `Status` = `Closed`                                        | `Entry Date` desc                 | `Emotion at Entry`|
| **📓 Plan Adherence**   | board    | `Status` = `Closed`                                        | `R-multiple` desc                 | `Followed Plan?`  |
| **📓 Mistakes by Type** | board    | `Mistake Category` is not empty AND `Mistake Category` ≠ `None` | `Entry Date` desc            | `Mistake Category`|
| **📓 Lessons Library**  | table    | `Lesson` is not empty                                      | `Entry Date` desc                 | `Mistake Category`|
| **📓 Never Again**      | table    | `Do Again?` = `Never`                                      | `Entry Date` desc                 | —                 |

_The 📓 views are the **journaling views** — separate from the P&L / operational views so you can review the process, not the money._

### Strategies
| View            | Layout | Filter               | Sort                  | Group      |
| --------------- | ------ | -------------------- | --------------------- | ---------- |
| **Active**      | table  | `Status` = `Active`  | `Win Rate %` desc     | —          |
| **By Type**     | board  | `Status` ≠ `Retired` | —                     | `Type`     |
| **Retired**     | table  | `Status` = `Retired` | `Name` asc            | —          |

### Trading Journal
Standard date-log views ([00-conventions.md § 7](00-conventions.md#7-view-patterns-reuse-across-dbs)) plus:
| View               | Layout   | Filter                       | Sort         |
| ------------------ | -------- | ---------------------------- | ------------ |
| **Bad Days**       | table    | `Mood` ≤ `2`                 | `Date` desc  |
| **Bull Days**      | table    | `Market Conditions` = `Bullish` | `Date` desc  |

### Trading Tasks
All five standard task views from [00-conventions.md § 7](00-conventions.md#7-view-patterns-reuse-across-dbs).

### Watchlist
| View          | Layout | Filter                              | Sort                | Group      |
| ------------- | ------ | ----------------------------------- | ------------------- | ---------- |
| **Watching**  | board  | `Status` = `Watching`               | —                   | `Sector`   |
| **By Sector** | table  | `Status` ≠ `Skipped`                | `Sector` asc        | `Sector`   |
| **Entered**   | table  | `Status` = `Entered`                | `Ticker` asc        | —          |
| **Skipped**   | table  | `Status` = `Skipped`                | `Ticker` asc        | —          |

---

## Templates

### Trades → template "New Trade" (full journaling template)
Icon: 📈. Body:

```markdown
> **Workflow:**
> 1. Fill Group A + B + C + D properties BEFORE clicking buy (Instrument, Direction, Timeframe, Entry, Stop, Targets, Size, Risk, Setup Quality, Conviction, Emotion at Entry, etc.)
> 2. Write the **Pre-trade** section below.
> 3. Take the trade. Log during if useful.
> 4. Fill exit props + write the **Post-trade** review within 15 min of close.
> 5. Tick **Reviewed?** — this trade is now "closed" for you.
>
> Every heading is a prompt. Delete what you don't need. Screenshots go directly under each section — paste with Ctrl+V.

---

## 🧠 Pre-trade — thesis
_Why am I taking this trade? What do I see that others don't (or think they see wrong)?_

### The signal
_Describe the exact trigger as if teaching it. If you can't name it in one sentence, you probably shouldn't be in the trade._

### Higher-timeframe context
_HTF trend direction, key levels above/below, market structure (HH/HL vs LH/LL), volatility regime._

### Catalyst / driver
_News? Earnings? Sector move? Just technical? "Nothing specific" is a valid answer — write it._

### Alternative interpretation
_Steel-man the opposite side. If this trade is wrong, what will the chart look like in 2 hours?_

### 📸 Chart: entry setup
_(Paste screenshot here — Ctrl+V into Notion. Annotate the trigger, key levels, stop, targets.)_

---

## 🎯 Plan (written BEFORE clicking buy)

| Field           | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| Entry           |                                                              |
| Stop            |                                                              |
| Stop invalidated by | _(what specifically has to happen for you to be wrong)_  |
| Target 1        |                                                              |
| Target 2        |                                                              |
| Position size   |                                                              |
| Risk (₹)        |                                                              |
| R:R at T1 / T2  |                                                              |
| Time stop       | _(if it hasn't moved by X min / N candles, exit)_            |
| Setup Quality   | _(match the property)_                                        |
| Conviction      | _(match the property)_                                        |
| Emotion now     | _(match the property)_                                        |

**Pre-trade checklist** (tick ALL before entry, or don't take it):
- [ ] Higher-timeframe trend is with me (or I have an explicit reason to fade)
- [ ] Stop is at a level, not a random distance
- [ ] Risk (₹) ≤ my per-trade risk limit
- [ ] Not revenge-trading a prior loss today
- [ ] Not fighting a news event I don't understand
- [ ] I would tell my accountability partner about this trade with a straight face

---

## ⏱️ During the trade — live log
_(Timestamped notes as it unfolds. Delete this whole section if the trade was in and out quickly.)_

- HH:MM — 
- HH:MM — 
- HH:MM — 

---

## 🚪 Exit

| Field              | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| Exit price         |                                                               |
| Exit reason        | _(hit T1 / T2 / stop / trailed stop / time stop / manual)_    |
| Followed plan?     | _(Fully / Mostly / Partially / No — match property)_          |
| Rule(s) broken     | _(list — match `Rule Broken` multi-select)_                   |
| Emotion at exit    | _(match property)_                                             |

### 📸 Chart: exit
_(Paste screenshot showing final structure — where you exited vs. where price went after.)_

---

## 🔍 Post-trade review (fill within 15 min of exit)

### What went right
- 
- 

### What went wrong
- 
- 

### Was the setup actually as good as I graded it at entry?
_(Honest re-grade in hindsight. If entry-grade was A+ and hindsight-grade is B, that's a signal about your setup-selection eye.)_

### The ONE mistake to not repeat
_(Distil to one sentence. Copy verbatim into the **Lesson** property — this feeds the Lessons Library view.)_

### Rule breaks — root cause
_(For each rule broken above, why? "Impatient", "market moved fast", "revenge", "distracted"…)_

### If I could rewind, I would…
- 

### Would I take this exact trade again knowing what I know now?
_(Match the `Do Again?` property. "Only if A+" is often the honest answer.)_

### 📸 Chart: annotated with hindsight
_(Mark up the chart showing ideal entry, ideal exit, and where reality differed.)_

---

## 💬 Feedback to the strategy
_(Anything to feed back into the linked Strategies page? Does this trade change the rules, add a filter, add an exception?)_

- 
```

### Trades → template "Quick Scalp" (short-form, for intraday high-frequency trades)
Icon: ⚡. Body:

```markdown
> Use this for scalps where the full template is overkill. Set properties as usual; keep body minimal.

## Thesis (1 line)


## Plan
- Entry / Stop / T1: 
- Risk: 
- Setup Quality: 

## Result
- Exit: 
- Followed plan? 
- Lesson (1 line): 
```


### Trading Journal → template "Daily Journal"
Icon: 📓. Body:

```markdown
## Market recap
_Nifty/Bank Nifty/SPX levels, key moves, news._

## What I did
_Trades taken, held, cut. Link to Trades below._

## What I felt
_Fear, FOMO, revenge, boredom, calm._

## Wins
- 

## Mistakes
- 

## Lesson for tomorrow
_One sentence._
```

### Strategies → template "New Strategy"
Icon: 🧠. Body:

```markdown
## One-line description


## Preconditions (must ALL be true)
- [ ] 
- [ ] 

## Entry
_Exact trigger. If you can't describe it, you haven't found it._

## Stop
_Where and why._

## Target(s)
_Fixed R? Trailing? Time-based exit?_

## Position sizing rule
_% of capital or fixed ₹ risk per trade._

## Invalidation
_At what point do you retire this strategy? Drawdown %? Win-rate floor? Sample size?_
```

---

## Seed rows (2–3 per DB, so views light up on first open)

### Strategies (seed FIRST so trades can reference)
| Name                     | Type      | Status | Rules (short)                             |
| ------------------------ | --------- | ------ | ----------------------------------------- |
| ORB 15-min               | Intraday  | Active | Break of first 15-min range, RR 1:2       |
| Weekly Trend Pullback    | Swing     | Active | Buy pullbacks in stocks above 50-DMA      |
| Earnings Momentum        | Swing     | Paused | Enter on gap-up post beat, stop at gap    |

### Trades
Basic trade columns (identity + risk/performance):

| Instrument | Direction | Status | Entry Date | Entry | Exit Date  | Exit  | Size | Setup      | Strategy               | Risk per Trade | Fees & Slippage |
| ---------- | --------- | ------ | ---------- | ----- | ---------- | ----- | ---- | ---------- | ---------------------- | -------------- | --------------- |
| RELIANCE   | LONG      | Closed | 2026-06-15 | 2820  | 2026-06-19 | 2895  | 20   | Breakout   | Weekly Trend Pullback  | 1500           | 60              |
| BANKNIFTY  | SHORT     | Closed | 2026-06-24 | 51200 | 2026-06-24 | 51050 | 15   | Reversal   | ORB 15-min             | 2250           | 120             |
| INFY       | LONG      | Open   | 2026-07-01 | 1690  |            |       | 30   | Trend      | Weekly Trend Pullback  | 1800           |                 |

Same 3 rows — journaling columns (Groups C, D, E):

| Instrument | Timeframe | Session      | Setup Quality | Conviction | Followed Plan? | Emotion at Entry | Emotion at Exit | Rule Broken            | Mistake Category | Reviewed? | Do Again?    | Lesson                                                                    |
| ---------- | --------- | ------------ | ------------- | ---------- | -------------- | ---------------- | --------------- | ---------------------- | ---------------- | --------- | ------------ | ------------------------------------------------------------------------- |
| RELIANCE   | Daily     | Opening      | A             | High       | Fully          | Calm             | Confident       | *(none)*               | None             | ✓         | Yes          | HTF trend alignment + patient entry = biggest edge. Do more of this.       |
| BANKNIFTY  | 5m        | Opening      | C             | Low        | No             | Revenge          | Anxious         | Revenge trade, No stop | Psychology       | ✓         | Never        | If I'm already down for the day, close the terminal for 30 min. Non-negotiable.|
| INFY       | 4h        | Mid-morning  | B             | Medium     | *(open)*       | Confident        | *(open)*        |                        |                  | ✗         | *(open)*     |                                                                            |

### Trading Journal
| Date       | Market Conditions | Mood | Lessons (short)                          |
| ---------- | ----------------- | ---- | ---------------------------------------- |
| 2026-06-15 | Bullish           | 4    | Held winner instead of scaling out early |
| 2026-06-24 | Volatile          | 2    | Revenge-traded after morning stop        |
| 2026-07-01 | Rangebound        | 3    | Waited for setup — no forced trades      |

### Trading Tasks
| Title                                | Status | Priority | Type            | Due        |
| ------------------------------------ | ------ | -------- | --------------- | ---------- |
| Backtest ORB on Bank Nifty (30d)     | Todo   | P2       | Backtest        | 2026-07-10 |
| Weekly journal review                | Todo   | P1       | Journal Review  | 2026-07-05 |
| Set up TradingView alerts for pullbacks | Doing | P3      | Setup           | 2026-07-07 |

### Watchlist
| Ticker    | Sector      | Status   | Target Price | Stop Loss |
| --------- | ----------- | -------- | ------------ | --------- |
| HDFCBANK  | Finance     | Watching | 1720         | 1610      |
| TCS       | Tech        | Watching | 4200         | 3950      |
| ADANIENT  | Industrials | Skipped  |              |           |
