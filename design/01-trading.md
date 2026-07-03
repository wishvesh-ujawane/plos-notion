# 🧭 Trading — full spec

Layers on top of the schema in [WORKSPACE-DESIGN.md § Trading](../WORKSPACE-DESIGN.md). Conventions: [00-conventions.md](00-conventions.md).

Area page icon: 🧭. Area page body: one heading `Trading` + one text line "Live trades, journal, playbook. Nothing here is investment advice." + a linked-database block for each DB below.

---

## Extra properties (add beyond WORKSPACE-DESIGN.md)

### Trades — add
- **Risk per Trade** — number (currency; rupees or dollars — one currency per workspace)
- **R-multiple** — formula → [00-conventions.md § 6.6](00-conventions.md#66-trade-r-multiple-trading--add-this-property)
- **Days Held** — formula: `if(empty(prop("Exit Date")), dateBetween(now(), prop("Entry Date"), "days"), dateBetween(prop("Exit Date"), prop("Entry Date"), "days"))`
- **Outcome** — formula: `if(prop("Status") != "Closed", "—", if(prop("PnL") > 0, "Win", if(prop("PnL") < 0, "Loss", "Scratch")))`

### Strategies — add rollups (after Trades relation exists)
- **# Trades** — rollup of Trades → `Instrument` → count all
- **Win Rate %** — rollup of Trades → `Outcome` → percent per group where value = `Win` (Notion supports "percent per group"; if not, fall back to two rollups: count `Win` + count `Closed`, and a formula that divides them)
- **Total PnL** — rollup of Trades → `PnL` → sum

### Trading Journal — add
- **Trades on Date** — relation → Trades (multi; user manually links relevant trades)

---

## Views

### Trades
| View          | Layout   | Filter                                       | Sort                           | Group     |
| ------------- | -------- | -------------------------------------------- | ------------------------------ | --------- |
| **Open**      | table    | `Status` = `Open`                            | `Entry Date` desc              | —         |
| **This Week** | table    | `Entry Date` this week                       | `Entry Date` desc              | —         |
| **By Setup**  | board    | `Status` = `Closed`                          | `Entry Date` desc              | `Setup`   |
| **Winners**   | table    | `Outcome` = `Win`                            | `R-multiple` desc              | —         |
| **Losers**    | table    | `Outcome` = `Loss`                           | `R-multiple` asc               | —         |
| **Calendar**  | calendar | —                                            | on `Entry Date`                | —         |
| **All**       | table    | —                                            | `Entry Date` desc              | —         |

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

### Trades → template "New Trade"
Icon: 📈. Body:

```markdown
## Setup thesis
_Why this trade? What signal fired?_

## Entry plan
- Entry: 
- Stop: 
- Target 1: 
- Target 2: 
- Position size: 
- Risk (₹): 

## Screenshots
_Attach chart before entry._

## Post-trade review
_(Filled after exit)_
- What worked:
- What didn't:
- Do again? Y/N —
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
| Instrument | Direction | Status | Entry Date | Entry | Exit Date  | Exit  | Size | Setup      | Strategy               |
| ---------- | --------- | ------ | ---------- | ----- | ---------- | ----- | ---- | ---------- | ---------------------- |
| RELIANCE   | LONG      | Closed | 2026-06-15 | 2820  | 2026-06-19 | 2895  | 20   | Breakout   | Weekly Trend Pullback  |
| BANKNIFTY  | SHORT     | Closed | 2026-06-24 | 51200 | 2026-06-24 | 51050 | 15   | Reversal   | ORB 15-min             |
| INFY       | LONG      | Open   | 2026-07-01 | 1690  |            |       | 30   | Trend      | Weekly Trend Pullback  |

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
