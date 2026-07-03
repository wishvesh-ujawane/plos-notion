# ☁️ Salesforce Career — full spec

Layers on top of the schema in [WORKSPACE-DESIGN.md § Salesforce Career](../WORKSPACE-DESIGN.md). Conventions: [00-conventions.md](00-conventions.md).

Area page icon: ☁️. Area page body: heading `Salesforce Career` + one text line "Learning path, certifications, portfolio, job pipeline — all in one place." + a linked-database block per DB.

---

## Extra properties (add beyond WORKSPACE-DESIGN.md)

### Learning (SF) — add
- **Certifications Using This** — relation reverse of `Certifications → Study Materials`
- **Days Since Started** — formula: `if(empty(prop("Started")), "", format(dateBetween(now(), prop("Started"), "days")) + "d")`
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar)

### Certifications — add
- **Days to Exam** — formula → [00-conventions.md § 6.1](00-conventions.md#61-days-until-due) (using `Exam Date` as `Due`)
- **Days to Expiry** — formula: `if(empty(prop("Expiry Date")), "", if(dateBetween(prop("Expiry Date"), now(), "days") < 0, "Expired", format(dateBetween(prop("Expiry Date"), now(), "days")) + "d"))`
- **Total Study Hours** — number (manual; you log against it)

### SF Projects — add
- **Related Learning** — relation → Learning (SF), multi
- **Related Certifications** — relation → Certifications, multi
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar) (requires adding `Progress %` number property to SF Projects too)

### Career Pipeline — add
- **Days in Stage** — formula: `if(empty(prop("Applied Date")), "", format(dateBetween(now(), prop("Applied Date"), "days")) + "d")`
- **Priority Score** — formula → [00-conventions.md § 6.2](00-conventions.md#62-priority-score) (add a `Priority` P1–P4 select first)
- **Next Step Overdue** — formula: `if(empty(prop("Next Step Date")), "", if(dateBetween(prop("Next Step Date"), now(), "days") < 0, "⚠️ overdue", ""))`

### Career Tasks — add
- **Today** — checkbox (matches convention)
- **Priority Score** — formula → [00-conventions.md § 6.2](00-conventions.md#62-priority-score)
- **Days Until Due** — formula → [00-conventions.md § 6.1](00-conventions.md#61-days-until-due)

---

## Views

### Learning (SF)
| View          | Layout | Filter                                   | Sort               | Group    |
| ------------- | ------ | ---------------------------------------- | ------------------ | -------- |
| **Active**    | board  | `Status` = `Active`                      | —                  | `Type`   |
| **In Progress** | table | `Status` = `Active` AND `Progress %` > 0 | `Started` desc     | —        |
| **Completed** | table  | `Status` = `Completed`                   | `Completed` desc   | —        |
| **All**       | table  | —                                        | `Title` asc        | —        |

### Certifications
| View            | Layout   | Filter                                | Sort              | Group    |
| --------------- | -------- | ------------------------------------- | ----------------- | -------- |
| **Roadmap**     | board    | —                                     | —                 | `Status` |
| **Upcoming**    | table    | `Status` = `Scheduled` OR `Studying`  | `Exam Date` asc   | —        |
| **Passed**      | table    | `Status` = `Passed`                   | `Exam Date` desc  | —        |
| **Expiring**    | table    | `Days to Expiry` contains value       | `Days to Expiry` asc | —     |

### SF Projects
| View            | Layout | Filter                        | Sort             | Group    |
| --------------- | ------ | ----------------------------- | ---------------- | -------- |
| **Board**       | board  | `Status` ≠ `Archived`         | —                | `Status` |
| **In Progress** | gallery| `Status` = `In Progress`      | `Started` desc   | —        |
| **Portfolio**   | gallery| `Type` = `Portfolio` AND `Status` = `Done` | `Completed` desc | — |
| **All**         | table  | —                             | `Title` asc      | —        |

### Career Pipeline
| View            | Layout | Filter                              | Sort                   | Group   |
| --------------- | ------ | ----------------------------------- | ---------------------- | ------- |
| **Pipeline**    | board  | `Stage` ≠ `Rejected` AND ≠ `Withdrawn` | —                   | `Stage` |
| **Active**      | table  | `Stage` in [Applied, Screen, Assessment, Onsite] | `Next Step Date` asc | — |
| **Follow-ups**  | table  | `Next Step Overdue` = `⚠️ overdue`  | `Next Step Date` asc   | —       |
| **Won**         | table  | `Stage` = `Offer`                   | `Applied Date` desc    | —       |
| **Archive**     | table  | `Stage` = `Rejected` OR `Withdrawn` | `Applied Date` desc    | —       |

### Career Tasks
All five standard task views from [00-conventions.md § 7](00-conventions.md#7-view-patterns-reuse-across-dbs).

---

## Templates

### Learning (SF) → template "New Course/Book"
Icon: 📚. Body:

```markdown
## Why I'm doing this
_Which cert/role/project does this feed into?_

## Study plan
- [ ] Chapter 1
- [ ] Chapter 2
- [ ] Chapter 3

## Notes
_Key concepts I want to remember. Link out to Personal Learning if it's a bigger topic._

## Practice
_Trailhead badges, quizzes, mini-projects. Link SF Projects that came out of this._
```

### Certifications → template "New Certification"
Icon: 🎖️. Body:

```markdown
## Cert overview
- Official page:
- Exam guide URL:
- Passing score:
- Cost:

## Prerequisites
_(Which certs/skills must exist first?)_

## Study plan
- [ ] Trailhead trail:
- [ ] Focus on Force (or equivalent)
- [ ] Practice exam ≥ 80%
- [ ] Schedule exam

## Weak areas
_(Fill during study — track what you keep getting wrong.)_

## Post-exam retro
_(Filled after exam)_
```

### SF Projects → template "New Portfolio Project"
Icon: 🛠️. Body:

```markdown
## Problem statement
_One paragraph. Whose problem, why it matters._

## Users
_Personas. Even if hypothetical._

## Data model
_Objects, relationships, key fields._

## Automation
_Flows, Apex triggers, batches — with justification for each choice._

## UI
_LWC, Experience Cloud, Screen Flow — with a screenshot._

## Deployment
_SFDX project? Managed package? Change set?_

## What I'd do differently
_(Filled at end)_

## Links
- GitHub repo:
- Demo video:
- Live org:
```

### Career Pipeline → template "New Application"
Icon: 💼. Body:

```markdown
## Company research
_What they do, why I want to work there, recent news._

## Role fit
_Which of my strengths map to the JD? Which gaps?_

## Application material used
- Resume version:
- Cover letter link:
- Portfolio pieces highlighted:

## Interview prep
- [ ] Company background
- [ ] Interviewer LinkedIn
- [ ] Behavioral stories (STAR)
- [ ] Technical topics to review
- [ ] Questions to ask them

## Interview notes
_(Filled after each round)_

## Post-mortem
_(Filled when closed — offer, reject, withdraw)_
```

---

## Seed rows

### Learning (SF)
| Title                                | Type          | Status    | Provider     | Progress % |
| ------------------------------------ | ------------- | --------- | ------------ | ---------- |
| Apex Specialist Superbadge           | Trailhead     | Active    | Trailhead    | 40         |
| Salesforce Certified Administrator   | Certification | Completed | Salesforce   | 100        |
| LWC Fundamentals Course              | Course        | Active    | Focus on Force | 65       |

### Certifications
| Cert Name                                    | Status    | Exam Date  | Score |
| -------------------------------------------- | --------- | ---------- | ----- |
| Salesforce Certified Administrator           | Passed    | 2025-11-20 | 78    |
| Salesforce Certified Platform Developer I    | Studying  | 2026-08-15 |       |
| Salesforce Certified Platform App Builder    | Planned   |            |       |

### SF Projects
| Title                        | Type         | Status      | Tech (short)              |
| ---------------------------- | ------------ | ----------- | ------------------------- |
| Cohort Management App        | Portfolio    | In Progress | Apex, LWC, Flow           |
| PLOS integration prototype   | Personal     | Backlog     | Integration, Apex         |
| Superbadge — Business Admin  | Trailhead Superbadge | Done | Flow, Reports             |

### Career Pipeline
| Company            | Role                  | Stage       | Applied Date | Next Step                     | Next Step Date |
| ------------------ | --------------------- | ----------- | ------------ | ----------------------------- | -------------- |
| Deloitte           | SF Consultant         | Screen      | 2026-06-22   | Recruiter call                | 2026-07-05     |
| Salesforce         | Associate SE          | Applied     | 2026-06-30   | Wait 5 business days          | 2026-07-08     |
| ThoughtSpot        | SF Admin (contract)   | Prospecting |              | Cold outreach to hiring mgr   | 2026-07-04     |

### Career Tasks
| Title                                 | Type            | Status | Priority | Due        |
| ------------------------------------- | --------------- | ------ | -------- | ---------- |
| Rehearse "tell me about yourself" (3 min) | Interview Prep | Todo | P1       | 2026-07-04 |
| Publish portfolio project #1 to GitHub    | Portfolio      | Doing | P2       | 2026-07-10 |
| Weekly LinkedIn engagement (comment on 5) | Networking     | Todo  | P3       | 2026-07-07 |
