# NexaHire

> An AI Job-Application Copilot — a real tool to land a contract fast, and a
> portfolio piece that signals senior-level engineering.
> *(NexaHire is a working codename — rename freely.)*

## What it does

- **Tracks** your applications on a Kanban board with response-rate analytics.
- **Scores & tailors** your CV per job (ATS match score + missing keywords + tailored bullets).
- **Aggregates** eligible jobs from legitimate APIs (Arbeitnow, the German
  Bundesagentur, remote boards, per-company Greenhouse/Lever) and tags each by
  visa eligibility (2026 thresholds).
- **Stays with you** — installable PWA with push + a Telegram bot, follow-up
  reminders, and a daily 3-task focus.
- **Drafts outreach** to recruiters and runs **salary-negotiation drills**.
- **Preps you** for interviews and renders a **public portfolio page**.

## Stack

Turborepo + pnpm · React 19 + Vite · NestJS 11 · PostgreSQL + Prisma · Redis +
BullMQ · Anthropic SDK. Latest stable versions throughout.

## Repo map

```
nexahire/
├── CLAUDE.md                 # the rules Claude Code follows (start here)
├── docs/
│   ├── architecture.md       # where code lives and why (layers, patterns)
│   ├── system-design.md      # how it runs (diagrams, sourcing, data model, AI, scaling)
│   └── sprints.md            # the plan + master prompt + 8 sprint prompts
└── .claude/skills/
    ├── feature-scaffold/     # scaffold a feature in project conventions
    ├── code-review/          # pre-PR review against conventions
    └── job-source-adapter/   # add a new job source the right way
```

## Read in this order

1. **`docs/sprints.md`** — the plan, the dual-track schedule, and the prompts to paste.
2. **`CLAUDE.md`** — the engineering rules (auto-loads in Claude Code).
3. **`docs/architecture.md`** then **`docs/system-design.md`** — the deeper design.

## How to start (today)

1. Create the repo, drop these files in at the paths shown above.
2. Open a Claude Code session in the repo — `CLAUDE.md` loads automatically.
3. Paste the **Master prompt** from `docs/sprints.md`, then the **Sprint 0** prompt.
4. In parallel, start **Track A** (the hunt) from `docs/sprints.md` — don't wait
   for the tool to be finished to start applying.

## The one rule that matters most

Two tracks run at once: **hunt now (Track A)** while you **build the tool (Track B)**.
Each sprint ships something you use on your real applications immediately. The tool
makes the hunt faster — it is not a prerequisite for starting it.
