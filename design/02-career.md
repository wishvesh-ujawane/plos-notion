# 💼 Career — full spec

Layers on top of the schema in [WORKSPACE-DESIGN.md § Career](../WORKSPACE-DESIGN.md). Conventions: [00-conventions.md](00-conventions.md).

Area page icon: 💼. Area page body: heading `Career` + one text line "Learning, building, applying, interviewing — every career move in one place." + a linked-database block per DB.

> **Scope note.** This area handles *all* career-related activity:
> - **Learning** — courses, books, certifications, videos, blogs, deliberately-built skills.
> - **Implementing** — portfolio-worthy builds that demonstrate a capability (Salesforce apps, web apps, data projects, writing, talks, OSS contributions).
> - **Certifications** — anything with an exam and an expiry date.
> - **Job switching** — pipeline of applications, contacts, stages.
> - **Preparations** — interview prep, resume iterations, take-home assignments, networking cadence (tracked as Career Tasks with `Type = Interview Prep / Application / Networking / Portfolio / Study`).
>
> Salesforce vocabulary (Trailhead, Apex, LWC, Flow) survives as first-class values in the multi-selects so nothing you currently do is lost — but the schema no longer *assumes* Salesforce.

---

## DB renames from the older "Salesforce Career" area

| Old name         | New name             | Key (manifest)      | Notes                                                                 |
| ---------------- | -------------------- | ------------------- | --------------------------------------------------------------------- |
| Learning (SF)    | **Learning**         | `learning`          | Domain-agnostic. `Domain` multi-select tracks Salesforce / Web / etc. |
| Certifications   | Certifications       | `certifications`    | No rename — already generic.                                          |
| SF Projects      | **Portfolio Projects** | `portfolioProjects` | Broader — any build worth showing.                                    |
| Career Pipeline  | Career Pipeline      | `careerPipeline`    | No rename — already generic.                                          |
| Career Tasks     | Career Tasks         | `careerTasks`       | No rename — already generic.                                          |

---

## Extra properties (add beyond WORKSPACE-DESIGN.md)

### Learning — add
- **Domain** — multi-select: `Salesforce`, `Web Dev`, `Data / AI`, `Cloud / DevOps`, `Product / PM`, `Design`, `Leadership`, `Communication`, `System Design`, `Career Skills`, `Other`
- **Certifications Using This** — relation reverse of `Certifications → Study Materials`
- **Portfolio Projects Using This** — relation reverse of `Portfolio Projects → Related Learning`
- **Days Since Started** — formula: `if(empty(prop("Started")), "", format(dateBetween(now(), prop("Started"), "days")) + "d")`
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar)

_Also **broaden `Type` select** in the base schema — see the [WORKSPACE-DESIGN.md](../WORKSPACE-DESIGN.md) Career section for the full option list: `Course`, `Certification`, `Book`, `Video / Podcast`, `Article / Blog`, `Workshop`, `Practice Project`, `Trailhead`, `Skill`._

### Certifications — add
- **Days to Exam** — formula → [00-conventions.md § 6.1](00-conventions.md#61-days-until-due) (using `Exam Date` as `Due`)
- **Days to Expiry** — formula: `if(empty(prop("Expiry Date")), "", if(dateBetween(prop("Expiry Date"), now(), "days") < 0, "Expired", format(dateBetween(prop("Expiry Date"), now(), "days")) + "d"))`
- **Total Study Hours** — number (manual; you log against it)

### Portfolio Projects — add
- **Domain** — multi-select: same options as Learning.Domain
- **Related Learning** — relation → Learning, multi
- **Related Certifications** — relation → Certifications, multi
- **Progress %** — number (percent format)
- **Progress Bar** — formula → [00-conventions.md § 6.4](00-conventions.md#64-progress-emoji-bar)
- **Shipped?** — checkbox (public URL / repo is live)

_The base schema's `Tech` multi-select stays — see the [WORKSPACE-DESIGN.md](../WORKSPACE-DESIGN.md) Career section for the broadened option list covering Salesforce (`Apex`, `LWC`, `Flow`, …), Web (`React`, `Next.js`, `Node`, …), Data (`Python`, `SQL`, `dbt`, …), Cloud (`AWS`, `Docker`, `K8s`, …)._

### Career Pipeline — add
- **Priority** — select: `P1`, `P2`, `P3`, `P4` (add BEFORE Priority Score formula)
- **Priority Score** — formula → [00-conventions.md § 6.2](00-conventions.md#62-priority-score)
- **Days in Stage** — formula: `if(empty(prop("Applied Date")), "", format(dateBetween(now(), prop("Applied Date"), "days")) + "d")`
- **Next Step Overdue** — formula: `if(empty(prop("Next Step Date")), "", if(dateBetween(prop("Next Step Date"), now(), "days") < 0, "⚠️ overdue", ""))`
- **Role Type** — select: `Full-time`, `Contract`, `Freelance`, `Internship`, `Fractional`
- **Work Mode** — select: `Remote`, `Hybrid`, `Onsite`
- **Domain** — multi-select: same as Learning.Domain (so you can filter pipeline by career track you're pursuing)

### Career Tasks — add
- **Today** — checkbox (matches convention)
- **Priority Score** — formula → [00-conventions.md § 6.2](00-conventions.md#62-priority-score)
- **Days Until Due** — formula → [00-conventions.md § 6.1](00-conventions.md#61-days-until-due)

_The base schema's `Type` select covers all career prep flavors: `Study`, `Application`, `Networking`, `Interview Prep`, `Portfolio`. No new DB is needed for "interview prep" — use `Type = Interview Prep` and filter._

---

## Views

### Learning
| View            | Layout | Filter                                                    | Sort               | Group    |
| --------------- | ------ | --------------------------------------------------------- | ------------------ | -------- |
| **Active**      | board  | `Status` = `Active`                                       | —                  | `Type`   |
| **In Progress** | table  | `Status` = `Active` AND `Progress %` > 0                  | `Started` desc     | —        |
| **By Domain**   | board  | `Status` = `Active`                                       | —                  | `Domain` |
| **Salesforce track** | table | `Domain` includes `Salesforce`                        | `Started` desc     | `Status` |
| **Completed**   | gallery| `Status` = `Completed`                                    | `Completed` desc   | `Type`   |
| **All**         | table  | —                                                         | `Title` asc        | —        |

### Certifications
| View          | Layout   | Filter                                | Sort                 | Group    |
| ------------- | -------- | ------------------------------------- | -------------------- | -------- |
| **Roadmap**   | board    | —                                     | —                    | `Status` |
| **Upcoming**  | table    | `Status` in [`Scheduled`, `Studying`] | `Exam Date` asc      | —        |
| **Passed**    | gallery  | `Status` = `Passed`                   | `Exam Date` desc     | —        |
| **Expiring**  | table    | `Days to Expiry` is not empty         | `Days to Expiry` asc | —        |

### Portfolio Projects
| View            | Layout  | Filter                                          | Sort               | Group    |
| --------------- | ------- | ----------------------------------------------- | ------------------ | -------- |
| **Board**       | board   | `Status` ≠ `Archived`                           | —                  | `Status` |
| **In Progress** | gallery | `Status` = `In Progress`                        | `Started` desc     | —        |
| **Shipped**     | gallery | `Shipped?` = ✓                                  | `Completed` desc   | —        |
| **By Domain**   | board   | `Status` ≠ `Archived`                           | —                  | `Domain` |
| **Portfolio (public)** | gallery | `Type` = `Portfolio` AND `Shipped?` = ✓  | `Completed` desc   | —        |
| **All**         | table   | —                                               | `Title` asc        | —        |

### Career Pipeline
| View               | Layout | Filter                                            | Sort                   | Group      |
| ------------------ | ------ | ------------------------------------------------- | ---------------------- | ---------- |
| **Pipeline**       | board  | `Stage` ≠ `Rejected` AND ≠ `Withdrawn`            | —                      | `Stage`    |
| **Active**         | table  | `Stage` in [Applied, Screen, Assessment, Onsite]  | `Next Step Date` asc   | —          |
| **Follow-ups due** | table  | `Next Step Overdue` = `⚠️ overdue`                | `Next Step Date` asc   | —          |
| **By Domain**      | board  | `Stage` ≠ `Rejected` AND ≠ `Withdrawn`            | —                      | `Domain`   |
| **Remote only**    | table  | `Work Mode` = `Remote` AND `Stage` ≠ `Rejected`   | `Applied Date` desc    | `Stage`    |
| **Won**            | table  | `Stage` = `Offer`                                 | `Applied Date` desc    | —          |
| **Archive**        | table  | `Stage` in [`Rejected`, `Withdrawn`]              | `Applied Date` desc    | —          |

### Career Tasks
Five standard task views from [00-conventions.md § 7](00-conventions.md#7-view-patterns-reuse-across-dbs) plus:
| View                | Layout | Filter                                       | Sort              | Group    |
| ------------------- | ------ | -------------------------------------------- | ----------------- | -------- |
| **By Type**         | board  | `Status` ≠ `Done`                            | `Due` asc         | `Type`   |
| **Interview Prep**  | table  | `Type` = `Interview Prep` AND `Status` ≠ `Done` | `Due` asc      | —        |
| **Networking cadence** | table | `Type` = `Networking` AND `Status` ≠ `Done` | `Due` asc         | —        |

---

## Templates

### Learning → template "New Learning Item"
Icon: 📚. Body:

```markdown
## Why I'm doing this
_Which role, cert, project, or curiosity does this feed?_

## Domain / adjacent topics


## Study plan
- [ ] 
- [ ] 
- [ ] 

## Notes
_Key concepts I want to remember. Link out to related Portfolio Projects or Certifications._

## Practice
_Exercises, quizzes, mini-projects — link Portfolio Projects that came out of this._

## What I'll do with this
_A specific behavior change or output (e.g. "use in Portfolio Project X", "answer this in interviews", "explain it to a colleague")._
```

### Certifications → template "New Certification"
Icon: 🎖️. Body:

```markdown
## Cert overview
- Domain:
- Official page:
- Exam guide URL:
- Passing score:
- Cost:
- Expiry (if any):

## Prerequisites
_(Which certs/skills must exist first?)_

## Study plan
- [ ] Official learning path
- [ ] Practice exams ≥ 80%
- [ ] Book / third-party course (if any)
- [ ] Schedule exam

## Weak areas
_(Fill during study — track what you keep getting wrong.)_

## Post-exam retro
_(Filled after exam — what worked, what to warn others about.)_
```

### Portfolio Projects → template "New Portfolio Project" (domain-agnostic)
Icon: 🛠️. Body:

```markdown
## Problem statement
_One paragraph. Whose problem, why it matters. Even a personal / hypothetical user works._

## Users
_Personas. What outcome do they get?_

## Design / architecture
_High level: data model, components, integrations, key decisions._

## Implementation notes
_The interesting parts — not a code dump. What was hard, what tradeoff was chosen, what you'd tell a future you to watch out for._

## Deployment / hosting
_Where does it live? How is it accessed? CI/CD?_

## Screenshots / demo
_(Paste inline — Ctrl+V.)_

## What I'd do differently
_(Filled at end.)_

## Links
- Repo:
- Live URL:
- Demo video:
- Blog post / writeup:
```

### Portfolio Projects → template "Salesforce Project" (variant, keeps Salesforce-specific sections)
Icon: ☁️. Body:

```markdown
## Problem statement


## Users / personas


## Data model
_Objects, relationships, key fields, sharing model._

## Automation
_Flows, Apex triggers, batches, platform events — with justification for each choice._

## UI
_LWC, Experience Cloud, Screen Flow, App Builder — with a screenshot._

## Deployment
_SFDX project? Managed package? Change set?_

## Testing
_Apex test classes, LWC Jest, manual test cases._

## What I'd do differently


## Links
- GitHub repo:
- Demo video:
- Live org URL:
```

### Career Pipeline → template "New Application"
Icon: 💼. Body:

```markdown
## Company research
_What they do, why I want to work there, recent news, funding, team._

## Role fit
_Which of my strengths map to the JD? Which are gaps? Which gaps am I fine with, and which need work?_

## Application material used
- Resume version:
- Cover letter link:
- Portfolio pieces highlighted:
- Referrer (if any):

## Interview prep
- [ ] Company background & recent news
- [ ] Interviewer(s) LinkedIn
- [ ] Behavioral stories (STAR — 4–5 rehearsed)
- [ ] Technical topics to review
- [ ] Domain-specific prep (system design / SF trailhead / Leetcode / take-home)
- [ ] Questions to ask them (3–5 specific ones)

## Interview notes
_(One sub-heading per round.)_

### Round 1 —
- Interviewer:
- Format:
- Went well:
- Bombed:
- Follow-up asked?

### Round 2 —

## Take-home / assignment
_(If any — link the repo / doc.)_

## Salary + comp discussion
- Their initial range:
- My ask:
- Signing bonus / equity / notice period notes:

## Post-mortem
_(Filled when closed — offer accepted / declined / rejected / withdrew. What did I learn about myself, about the market, about interviewing?)_
```

### Career Tasks → template "Interview Prep Session"
Icon: 🎤. Body:

```markdown
## Session focus (pick ONE)
- [ ] Behavioral / STAR stories
- [ ] System design
- [ ] Coding / Leetcode
- [ ] Take-home walkthrough
- [ ] Domain deep-dive (topic: ___)
- [ ] Mock interview

## Prep material


## Notes / weak spots exposed


## Follow-up
_(Which tasks does this spawn? Create as Career Tasks.)_
```

---

## Seed rows

### Learning
| Title                              | Type          | Domain              | Status    | Provider       | Progress % |
| ---------------------------------- | ------------- | ------------------- | --------- | -------------- | ---------- |
| Apex Specialist Superbadge         | Trailhead     | Salesforce          | Active    | Trailhead      | 40         |
| Salesforce Certified Administrator | Certification | Salesforce          | Completed | Salesforce     | 100        |
| LWC Fundamentals Course            | Course        | Salesforce, Web Dev | Active    | Focus on Force | 65         |
| System Design Interview (Vol. 1)   | Book          | System Design       | Active    | Alex Xu        | 30         |
| Grokking Behavioral Interviews     | Course        | Career Skills       | Active    | Design Gurus   | 20         |

### Certifications
| Cert Name                                    | Status   | Exam Date  | Score |
| -------------------------------------------- | -------- | ---------- | ----- |
| Salesforce Certified Administrator           | Passed   | 2025-11-20 | 78    |
| Salesforce Certified Platform Developer I    | Studying | 2026-08-15 |       |
| Salesforce Certified Platform App Builder    | Planned  |            |       |
| AWS Certified Cloud Practitioner             | Planned  |            |       |

### Portfolio Projects
| Title                        | Type                 | Domain          | Status      | Tech (short)             | Shipped? |
| ---------------------------- | -------------------- | --------------- | ----------- | ------------------------ | -------- |
| Cohort Management App        | Portfolio            | Salesforce      | In Progress | Apex, LWC, Flow          | ✗        |
| PLOS integration prototype   | Personal             | Salesforce, Web Dev | Backlog | Integration, Apex, Node  | ✗        |
| Superbadge — Business Admin  | Trailhead Superbadge | Salesforce      | Done        | Flow, Reports            | ✓        |
| Personal blog (SSG)          | Portfolio            | Web Dev         | In Progress | Next.js, Vercel          | ✗        |
| SQL practice notebook (public) | Personal            | Data / AI       | Done        | SQL, Postgres            | ✓        |

### Career Pipeline
| Company            | Role                   | Stage       | Role Type | Work Mode | Domain          | Applied Date | Next Step                   | Next Step Date |
| ------------------ | ---------------------- | ----------- | --------- | --------- | --------------- | ------------ | --------------------------- | -------------- |
| Deloitte           | SF Consultant          | Screen      | Full-time | Hybrid    | Salesforce      | 2026-06-22   | Recruiter call              | 2026-07-05     |
| Salesforce         | Associate SE           | Applied     | Full-time | Remote    | Salesforce      | 2026-06-30   | Wait 5 business days        | 2026-07-08     |
| ThoughtSpot        | SF Admin (contract)    | Prospecting | Contract  | Remote    | Salesforce      |              | Cold outreach to hiring mgr | 2026-07-04     |
| Startup XYZ        | Full-stack Engineer    | Prospecting | Full-time | Remote    | Web Dev         |              | Craft custom cover letter   | 2026-07-10     |

### Career Tasks
| Title                                     | Type            | Status | Priority | Due        |
| ----------------------------------------- | --------------- | ------ | -------- | ---------- |
| Rehearse "tell me about yourself" (3 min) | Interview Prep  | Todo   | P1       | 2026-07-04 |
| Publish portfolio project #1 to GitHub    | Portfolio       | Doing  | P2       | 2026-07-10 |
| Weekly LinkedIn engagement (comment on 5) | Networking      | Todo   | P3       | 2026-07-07 |
| Refactor resume for full-stack track      | Application     | Todo   | P2       | 2026-07-12 |
| System design: rate limiter walk-through  | Study           | Todo   | P2       | 2026-07-09 |
| Mock interview with peer (behavioral)     | Interview Prep  | Todo   | P1       | 2026-07-11 |
