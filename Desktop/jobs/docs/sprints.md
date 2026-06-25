# NexaHire — Plan & Sprints

The execution plan. Two tracks run **in parallel**: you hunt for a job from day
one (Track A) while you build the tool that accelerates the hunt (Track B). Do
not wait for the tool to start applying — that's the mistake that costs the
fast offer.

---

## The honest framing

Two different timelines, don't confuse them:

- **Remote contract paid in EUR/USD → realistic in ~1 month** (you already work
  remotely for a German company; this is the Track A target).
- **Relocation + visa to Europe → 2026–2027 goal.** The realistic 2027 target is
  *landing in Europe at mid-level with sponsorship*, which is a big win and the
  natural stepping stone to a Senior title 1–2 years later. Your German Blue Card
  "IT specialist without degree" route opens once you hit ~3 years of experience
  (~2027) at the lower 2026 threshold of €45,934.20; the Netherlands HSM route
  doesn't require a degree at all (~€4,357/mo if under 30 in 2026).

---

## Track A — The Hunt (starts today, not after the tool)

| Week | Focus |
|------|-------|
| 1 | Finalize CV versions · build a 30-company target list (NL recognized sponsors + remote-EUR + Gulf) · 20 outreach messages |
| 2–3 | Intensive tailored applications · follow-ups · first interviews |
| 4 | Close an offer · negotiate |

Track A uses the tool's features the moment each ships — the tracker in week 1,
the ATS optimizer in week 2, and so on.

---

## Track B — Build the tool (8 sprints, 1 week each)

Ordered so each sprint gives you something you use on your real hunt immediately.

| Sprint | Name | You can use it for… |
|--------|------|---------------------|
| 0 | Setup & Foundations | the repo, CI, auth — nothing user-facing yet |
| 1 | Application Tracker | tracking your real applications from day one |
| 2 | ATS Optimizer + Tailored CV | scoring & tailoring every application |
| 3 | Job Aggregator + Visa Filter | a daily feed of eligible roles |
| 4 | Companion Layer (PWA + Telegram + Follow-ups) | "always with me" + never missing a follow-up |
| 5 | Outreach + Negotiation Simulator | direct recruiter contact + raise-the-offer prep |
| 6 | Prep + Public Portfolio + Analytics | interview prep + a public page for your CV |
| 7 | Production Hardening | the senior-signal layer (tests, observability, security) |

---

## How to run a sprint (system 2027)

1. Start a fresh Claude Code session in the repo (CLAUDE.md auto-loads).
2. Paste the **sprint prompt** below.
3. Claude invokes `/feature-scaffold` (and `/job-source-adapter` for sources)
   before writing code.
4. Build the slice end-to-end (api → web), with tests on services/adapters.
5. Run `/code-review`, then suggest `@code-reviewer`, then `@git-expert` for the PR.
6. Use the shipped feature on your real applications before moving on.

Each sprint carries one **Golden Test** — the single sentence that says whether
the sprint actually succeeded.

---

## Master prompt (paste once at the very start)

```
You are my senior engineering partner on NexaHire, an AI Job-Application Copilot.

Read CLAUDE.md, docs/architecture.md, and docs/system-design.md before writing
any code, and follow them strictly — especially: layer boundaries, the Result
pattern, the adapter pattern for job sources, the single AI gateway, server
state via TanStack Query, and the shared contract in packages/types.

Stack: Turborepo + pnpm · React 19 + Vite · NestJS 11 · PostgreSQL + Prisma ·
Redis + BullMQ · Anthropic SDK. Latest stable versions.

Work one sprint at a time. For each sprint: confirm the plan in 3–5 bullets,
invoke /feature-scaffold first, build the slice end-to-end with tests on
services and adapters, then run /code-review before we consider it done. Keep
changes minimal and ask before introducing any new pattern or dependency.

Acknowledge that you've read the three docs, then wait for the sprint prompt.
```

---

## Sprint 0 — Setup & Foundations

**Goal:** a running monorepo skeleton you can build features into.
**Scope:**
- Turborepo + pnpm workspace: `apps/web`, `apps/api`, `packages/{types,config,tsconfig}`.
- `docker-compose.yml` with Postgres + Redis.
- NestJS: `core/` with config (validated env), Prisma, the `Result<T, AppError>`
  type + http mapper, BullMQ setup, and the AI gateway shell (no prompts yet).
- React: Vite app shell, routing, TanStack Query + Zustand providers, typed api
  client skeleton.
- Auth: email/password → JWT in httpOnly cookie, guard, `/auth` module + login UI.
- GitHub Actions: install → lint → typecheck → test.
- `.claude/skills/` present and discoverable.

**Golden Test:** *I can register, log in, hit a guarded `/me` endpoint from the
web app, and CI passes on a PR.*

**Prompt:**
```
Sprint 0 — Setup & Foundations. Scaffold the monorepo exactly as docs/architecture.md
§2 describes. Set up core/ (config, database, result, queue, ai-shell), email/password
auth with JWT in an httpOnly cookie + a guard, a /me endpoint, and a minimal login
screen wired through the typed api client and TanStack Query. Add docker-compose for
Postgres + Redis and a GitHub Actions pipeline (install, lint, typecheck, test).
Confirm the plan first, then build. End state must satisfy the Golden Test.
```

---

## Sprint 1 — Application Tracker

**Goal:** a Kanban tracker you start using on real applications immediately.
**Scope:** `applications` module (CRUD, cursor pagination, Result pattern, DTOs,
service tests); Kanban board UI (applied → screening → interview → offer →
rejected) with optimistic updates via TanStack Query mutations; basic stats
(count per stage, response rate).

**Golden Test:** *I can add a real application, drag it across stages, and the
state survives a refresh.*

**Prompt:**
```
Sprint 1 — Application Tracker. Invoke /feature-scaffold for an `applications`
module. Build CRUD with cursor pagination and the Result pattern (tests on the
service), then a Kanban UI with the five stages and optimistic drag-to-update via
TanStack Query. Add a small stats strip (per-stage counts + response rate). Satisfy
the Golden Test, then run /code-review.
```

---

## Sprint 2 — ATS Optimizer + Tailored CV

**Goal:** the highest-leverage hunting feature — score and tailor every application.
**Scope:** wire the AI gateway prompts `scoreAts` and `tailorCv`; run them as
BullMQ jobs; `CvVersion` model + management UI; a "paste JD" flow that returns a
0–100 match score, missing keywords, and tailored bullets; save a tailored CV to
an application. Structured JSON output validated with Zod.

**Golden Test:** *I paste a real JD, get a believable ATS score with concrete
missing keywords, and can save the tailored CV onto an application.*

**Prompt:**
```
Sprint 2 — ATS Optimizer + Tailored CV. Add scoreAts and tailorCv to core/ai with
versioned prompts and structured JSON output (Zod-validated). Run them as queue jobs,
never inline. Add the CvVersion model + UI, and a "paste JD → score + missing keywords
+ tailored bullets" flow that can attach the result to an application. Tests cover the
gateway parsing and the service. Satisfy the Golden Test, then /code-review.
```

---

## Sprint 3 — Job Aggregator + Visa Filter

**Goal:** a daily feed of roles you're actually eligible for.
**Scope:** implement the `JobSource` adapter interface; ship Tier-1 adapters
(Arbeitnow with `visa_sponsorship=true`, Bundesagentur, one remote aggregator)
and one Tier-2 ATS adapter (Greenhouse or Lever); the `aggregate` + `match` queue
jobs with dedupe; `Job`/`Company` models; a board UI with a **visa-eligibility
filter** using the 2026 thresholds; Tier-3 deep-link generator for LinkedIn/Bayt.

**Golden Test:** *A scheduled run fills my board with deduped, visa-tagged jobs,
and I can filter to "NL HSM eligible" and "remote-EUR".*

**Prompt:**
```
Sprint 3 — Job Aggregator + Visa Filter. Invoke /job-source-adapter. Build the
JobSource interface and the aggregation engine (registry + normalize + dedupe by
sha1(source+externalId)). Implement Arbeitnow (visa_sponsorship=true), Bundesagentur
(X-API-Key: jobboerse-jobsuche), one remote aggregator, and one Greenhouse/Lever
per-company adapter — each with a recorded fixture test. Add aggregate+match queue
jobs on a 6h schedule, the Job/Company models, a board UI with a visa-eligibility
filter (2026 thresholds), and a Tier-3 deep-link generator. Satisfy the Golden Test,
then /code-review.
```

---

## Sprint 4 — Companion Layer (PWA + Telegram + Follow-ups)

**Goal:** the tool is literally always with you, and you never miss a follow-up.
**Scope:** make the web app an installable PWA with a service worker + Web Push
(VAPID); a Telegram bot via webhook on the same backend (`/today`, `/applied`);
the `FollowUp` model + the `follow-up` and `notify` queue jobs (remind 3–5 days
after applying, with a drafted message); the Daily Focus list (3 morning tasks,
evening streak log).

**Golden Test:** *I apply to a job, and 3 days later I get a push (and a Telegram
message) reminding me to follow up, with a draft ready.*

**Prompt:**
```
Sprint 4 — Companion Layer. Turn web into an installable PWA with a service worker
and Web Push (VAPID). Add a Telegram bot on the same NestJS backend via webhook
(/today, /applied <id>). Add the FollowUp model and the follow-up + notify queue
jobs (remind 3–5 days post-apply with a drafted follow-up message via the AI gateway).
Add the Daily Focus list (3 morning tasks, evening streak). Satisfy the Golden Test,
then /code-review.
```

---

## Sprint 5 — Outreach + Negotiation Simulator

**Goal:** direct recruiter contact + getting to a *good* offer.
**Scope:** `draftOutreach` (company research card → tailored LinkedIn/email
message) with a saved snippet bank; `OutreachMessage` model; the
`simulateNegotiation` flow where the AI plays the recruiter and coaches each turn;
a net-pay comparison helper (NL/DE/Gulf, post-tax).

**Golden Test:** *I generate a personalized outreach message for a real target,
and I can run a back-and-forth salary negotiation drill that gives useful coaching.*

**Prompt:**
```
Sprint 5 — Outreach + Negotiation Simulator. Add draftOutreach (uses a company
research card; produces LinkedIn/email variants) with a snippet bank and the
OutreachMessage model. Add simulateNegotiation as a multi-turn flow where the model
plays the recruiter and returns a coaching note each turn. Add a net-pay comparison
helper for NL/DE/Gulf. All AI via the gateway as queue jobs. Satisfy the Golden Test,
then /code-review.
```

---

## Sprint 6 — Prep + Public Portfolio + Analytics

**Goal:** interview readiness + a public page that doubles as portfolio.
**Scope:** Prep module (AI mock interviews, system-design question bank, STAR
stories, `InterviewLog` + post-interview debrief that improves next answers);
Response-Rate Analytics (which CV/source/outreach style yields interviews); a
**public portfolio mode** that renders a shareable page about you (links from your CV).

**Golden Test:** *I can run a mock interview, log the real ones, see which CV
version gets the most interviews, and share a public portfolio URL.*

**Prompt:**
```
Sprint 6 — Prep + Public Portfolio + Analytics. Build the Prep module (AI mock
interview, system-design question bank, STAR stories, InterviewLog + debrief loop).
Add Response-Rate Analytics (interviews by CV version / source / outreach style). Add
a public portfolio mode: a server-rendered shareable page about me. Satisfy the Golden
Test, then /code-review.
```

---

## Sprint 7 — Production Hardening (the senior-signal layer)

**Goal:** make it read as senior-built and run reliably.
**Scope:** raise test coverage on services + all adapters; structured logging
(pino + request id); `/health` + basic metrics (jobs aggregated, AI tokens,
notifications); Helmet + CORS allow-list + security headers; per-user rate limits
on AI endpoints; dependency audit in CI; a README with the architecture diagrams
and a short "engineering decisions" write-up.

**Golden Test:** *A stranger reading the repo sees tests, CI, observability,
security headers, and a clear architecture write-up — and concludes "senior."*

**Prompt:**
```
Sprint 7 — Production Hardening. Add/raise tests on services and every job-source
adapter (recorded fixtures). Add pino structured logging with request ids, a /health
endpoint, and basic metrics. Add Helmet, a CORS allow-list, security headers, and
per-user rate limiting on AI endpoints. Add a dependency audit step in CI. Write a
README that embeds the architecture + system-design diagrams and a concise
"engineering decisions" section. Satisfy the Golden Test, then /code-review.
```

---

## Sprint 8 — Stabilization & Fix-up (paste this in a fresh chat)

**Goal:** make the whole system actually compile, the auth flow work end-to-end, the
tests run, and the conventions hold — **no new features**. This sprint pays down the
debt from building everything in one pass.

**Why it exists:** a full-repo `/code-review` found the app does not currently ship:
the web doesn't typecheck (73 errors), auth is broken end-to-end (the client never
sends the JWT cookie), the applications service spec runs 0 tests, and several
conventions drifted (duplicated `Result`/`AppError`, `process.env` read directly, the
AI model hardcoded). See `CLAUDE.md` Section D for the rules these violate.

**Scope (fix in this order):**
1. **Toolchain** — fix `pnpm-workspace.yaml` (remove the `set this to true or false`
   placeholders; set real `allowBuilds` / approve the prisma+esbuild builds) and `.npmrc`
   so `pnpm install` + `pnpm db:generate` run clean.
2. **One error contract** — keep `Result`/`ok`/`err`/`AppError` in `apps/api/src/core/result`
   only; keep `AppErrorKind` + the error-body schema in `packages/types` only. Delete the
   duplicates and the dead `http.ts`. Make the one mapper cover every kind and emit
   `{ error: { kind, message } }`.
3. **Web compiles** — fix the api client in `apps/web/src/lib/api/` so it has every method
   the hooks call and uses `credentials: 'include'`; fix `import type` (verbatimModuleSyntax);
   align `useApplications`/`ApplicationsPage` names. Target **0** web type errors.
4. **Auth works** — verify register → login → `/auth/me` → guarded board loads and
   survives refresh (the cookie is actually sent and accepted).
5. **Tests run** — rewrite `applications.service.spec.ts` for Vitest (`import` from
   `vitest`, `vi.fn()` mocks). 0-test specs are failures.
6. **Config & conventions** — remove every direct `process.env` (route through
   `@nexahire/config`); take the AI model from `ANTHROPIC_MODEL` as one constant; map
   repositories' Prisma entities to response DTOs; move build artifacts out of `src/`;
   wire a route for every built feature (or remove it).

**Golden Test:** *On a fresh clone, `pnpm install && pnpm db:generate && pnpm -r typecheck
&& pnpm -r lint && pnpm -r test` all pass; I can register, log in, see the guarded board,
and it survives a refresh; `/code-review` reports **Ready**.*

**Prompt:**
```
Sprint 8 — Stabilization & Fix-up. Read CLAUDE.md (especially Section D), docs/architecture.md,
and docs/system-design.md.

First run the /code-review skill in full-repo mode to get the baseline (it runs prisma
generate, then typecheck + lint + test across every workspace) and report the real numbers.

Then fix, in this priority order, committing nothing until each layer is green:
  1. Toolchain: pnpm-workspace.yaml placeholders + .npmrc so install and db:generate run clean.
  2. One error contract: Result/ok/err/AppError live only in apps/api/src/core/result;
     AppErrorKind + error-body schema only in packages/types. Delete the duplicate definitions
     and the dead http.ts. One mapper, every AppErrorKind covered, body { error: { kind, message } }.
  3. Web compiles to 0 errors: complete the src/lib/api client, set credentials:'include',
     fix import type, align useApplications with ApplicationsPage.
  4. Auth end-to-end: register -> login -> /auth/me -> guarded board loads and survives refresh.
  5. Tests run on Vitest (no jest globals); applications.service.spec actually executes.
  6. Conventions: no direct process.env (use @nexahire/config), AI model from ANTHROPIC_MODEL
     as one constant, map Prisma entities to response DTOs, no build artifacts in src/, route
     every built feature.

Do not add features. Re-run /code-review until it reports Ready, satisfy the Golden Test,
then use the /pr skill to open one PR titled "fix: stabilize monorepo (compile, auth, tests,
conventions)". Confirm the plan in 5 bullets before you start.
```

---

## After the sprints

The repo is now both your live hunting cockpit and your strongest portfolio piece.
Point your CV and LinkedIn at the public portfolio page, and keep Track A running —
the tool now makes each application faster than the last.
