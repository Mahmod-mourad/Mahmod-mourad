# NexaHire — System Design

How the pieces behave at runtime. Read `architecture.md` first for *where code lives*;
this doc is *how it runs*. Diagrams are Mermaid (render on GitHub and in most viewers).

---

## 1. High-level components

```mermaid
flowchart TB
    subgraph Client
        WEB[React 19 PWA<br/>installable + push]
        TG[Telegram Bot]
    end

    subgraph Server["API service (NestJS monolith)"]
        API[REST API<br/>controllers + services]
        WORKER[BullMQ Worker<br/>same codebase, separate process]
        AI[AI Gateway<br/>Anthropic SDK]
    end

    subgraph Data
        PG[(PostgreSQL<br/>Prisma)]
        REDIS[(Redis<br/>queues + cache)]
    end

    subgraph External
        SRC[Job Sources<br/>Arbeitnow · Bundesagentur · Greenhouse · Lever]
        ANTH[Anthropic API]
        PUSH[Web Push / Telegram API]
    end

    WEB -->|HTTPS / JSON| API
    TG <-->|webhook| API
    API --> PG
    API --> REDIS
    API --> AI
    AI --> ANTH
    WORKER --> PG
    WORKER --> REDIS
    WORKER -->|pull jobs| SRC
    WORKER --> AI
    WORKER -->|notifications| PUSH
    API -.enqueue.-> REDIS
    REDIS -.deliver.-> WORKER
```

Two processes, one codebase: the **API** answers requests fast; the **Worker**
does everything slow or external (aggregation, AI, notifications). They share
Postgres and Redis. This is the smallest setup that still keeps requests snappy.

---

## 2. Core request flow (sync path)

Example: user opens the board.

```mermaid
sequenceDiagram
    participant U as Web (TanStack Query)
    participant C as Controller
    participant S as Service
    participant R as Repository
    participant DB as Postgres

    U->>C: GET /applications?cursor=...
    C->>C: validate query DTO
    C->>S: list(userId, cursor)
    S->>R: findPage(userId, cursor)
    R->>DB: prisma.application.findMany (cursor paginated)
    DB-->>R: rows
    R-->>S: ok(rows)
    S-->>C: ok(page)
    C-->>U: 200 + ApplicationResponseDto[]
```

No external calls on the request path — so the UI is always fast. Anything that
would block goes to the queue (next section).

---

## 3. Async flow (the queue is the backbone)

Example: a job-aggregation run.

```mermaid
sequenceDiagram
    participant CRON as Scheduler
    participant Q as BullMQ (Redis)
    participant W as Worker
    participant SRC as Job Sources
    participant DB as Postgres

    CRON->>Q: enqueue "aggregate" (every 6h)
    Q->>W: deliver job
    loop each registered adapter
        W->>SRC: fetch(JobQuery)
        SRC-->>W: raw jobs
        W->>W: normalize + dedupe (hash on source+externalId)
    end
    W->>DB: upsert NormalizedJob rows
    W->>Q: enqueue "match" per new job
    Note over W,DB: matching + notifications run as their own jobs
```

**Queues:** `aggregate`, `match`, `tailor-cv`, `ats-score`, `outreach`,
`notify`, `follow-up`. Every processor is **idempotent** (safe to retry) and
**dedupes** by a stable key, because sources re-post the same listing.

---

## 4. The job-sourcing engine (the heart of the product)

The honest reality: there is no single API for "all jobs." We aggregate
legitimate, stable sources through one adapter interface, and deep-link the rest.

```mermaid
flowchart LR
    ENGINE[Aggregation Engine] --> REG{Adapter Registry}
    REG --> A1[ArbeitnowAdapter<br/>tier 1 · free public API<br/>visa_sponsorship=true]
    REG --> A2[BundesagenturAdapter<br/>tier 1 · official DE API]
    REG --> A3[RemoteAggregatorAdapter<br/>tier 1 · RemoteOK/Remotive/Jobicy/Himalayas]
    REG --> A4[GreenhouseAdapter<br/>tier 2 · per-company ATS]
    REG --> A5[LeverAdapter<br/>tier 2 · per-company ATS]
    A1 --> NORM[Normalize → canonical Job]
    A2 --> NORM
    A3 --> NORM
    A4 --> NORM
    A5 --> NORM
    NORM --> DEDUPE[Dedupe + upsert]
```

**Three tiers (see `architecture.md` §5b for the interface):**

- **Tier 1 — direct public APIs (the backbone).** Free, stable, no auth or
  trivial header. `Arbeitnow` (has a `visa_sponsorship=true` param, data sourced
  from ATSs), the official German `Bundesagentur für Arbeit` API
  (`rest.arbeitsagentur.de`, header `X-API-Key: jobboerse-jobsuche`, 1M+ jobs),
  and remote aggregators (RemoteOK / Remotive / Jobicy / Himalayas).
- **Tier 2 — per-company ATS APIs (the senior move).** Maintain a target-company
  list (NL recognized sponsors + Gulf companies + EU startups), detect each
  company's ATS, and pull structured JSON straight from the employer:
  - Greenhouse: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
  - Lever: `https://api.lever.co/v0/postings/{company}?mode=json`
  - (Ashby / Workable: same idea.)
  Zero anti-bot, never breaks, and surfaces roles before they hit aggregators.
- **Tier 3 — deep-link, don't scrape.** For LinkedIn / Bayt / Indeed / Wellfound,
  generate a pre-filtered search URL the user opens in one click. Apply manually,
  zero friction, fully within terms of service.

> **Hard rule:** no HTML scraping of boards that prohibit it. It violates ToS,
> risks account bans, and breaks on every markup change. The tiers above avoid it.

**Eligibility tagging.** Each normalized job is tagged against the user's visa
options (NL Highly-Skilled-Migrant, DE Blue Card / IT-specialist route, Gulf,
remote-EUR) using the 2026 thresholds, so the board can filter to roles the user
can actually take.

---

## 5. Data model

```mermaid
erDiagram
    User ||--o{ CvVersion : has
    User ||--o{ Application : tracks
    User ||--o{ OutreachMessage : sends
    User ||--o{ NotificationPref : configures
    Company ||--o{ Job : posts
    Job ||--o{ Application : "applied to"
    Application ||--o{ InterviewLog : has
    Application ||--o{ FollowUp : schedules
    Application }o--|| CvVersion : "tailored from"

    User {
        uuid id PK
        string email
        string passwordHash
        json visaProfile "age, degree?, yearsExp"
    }
    CvVersion {
        uuid id PK
        uuid userId FK
        string label "Backend / Fullstack / Frontend"
        text content
    }
    Company {
        uuid id PK
        string name
        string atsType "greenhouse|lever|null"
        bool sponsorsVisa
        string region "EU|Gulf|Remote"
    }
    Job {
        uuid id PK
        uuid companyId FK
        string source "arbeitnow|greenhouse:acme|..."
        string externalId
        string dedupeHash UK
        string title
        json visaTags
        string applyUrl
        timestamp postedAt
    }
    Application {
        uuid id PK
        uuid userId FK
        uuid jobId FK
        uuid cvVersionId FK
        enum status "applied|screening|interview|offer|rejected"
        int atsScore
        timestamp appliedAt
    }
    InterviewLog {
        uuid id PK
        uuid applicationId FK
        text questionsAsked
        text reflection
    }
    FollowUp {
        uuid id PK
        uuid applicationId FK
        timestamp dueAt
        bool done
    }
    OutreachMessage {
        uuid id PK
        uuid userId FK
        uuid companyId FK
        text body
        string channel "linkedin|email"
    }
```

`Job.dedupeHash` (unique) is `sha1(source + externalId)` — the safety net against
the same listing arriving from two sources.

---

## 6. AI integration

All model use is behind `core/ai/ai.service.ts`. Each capability is a typed
method with a versioned prompt; the web app never touches Anthropic (key stays
server-side).

| Capability             | Input                       | Output (structured)              |
|------------------------|-----------------------------|----------------------------------|
| `scoreAts`             | JD + CV                     | score 0–100, missing keywords    |
| `tailorCv`             | base CV + JD                | rewritten bullets per role       |
| `draftOutreach`        | company card + role         | LinkedIn/email message           |
| `simulateNegotiation`  | offer + target + transcript | recruiter turn + coaching note   |
| `companyResearchCard`  | company + recent web search | tech stack, news, sponsor signal |

**Practices:** request structured JSON (parse + validate with Zod, never regex);
always set `max_tokens`; handle the rate-limit/error branch as a first-class path;
use **prompt caching** for the stable parts (base CV, system prompt) to cut cost;
run all of it as `tailor-cv` / `ats-score` queue jobs so requests never block.

---

## 7. Companion layer — "always with me"

```mermaid
flowchart LR
    subgraph Notify
        DISPATCH[notify job]
    end
    DISPATCH --> WPUSH[Web Push<br/>PWA on phone]
    DISPATCH --> TGRAM[Telegram bot]
    TRIGGERS[Triggers:<br/>new matching job ·<br/>follow-up due ·<br/>daily 3-task focus] --> DISPATCH
```

- **PWA + Web Push** — the React app installs to the home screen and receives
  push (new match, follow-up reminder, today's tasks). Service worker + VAPID.
- **Telegram bot** — same NestJS backend via webhook. Pushes new jobs and the
  daily focus list; accepts commands (`/today`, `/applied <id>`). This is the
  simplest literal "always with you" channel.
- **Daily Focus** — morning: 3 tasks (apply to 3, reach out to 2); evening: log
  done + streak. Daily discipline is what actually produces an offer in weeks.

---

## 8. Deployment topology

```mermaid
flowchart TB
    subgraph Host["Railway / Fly.io"]
        WEBC[web container<br/>static + service worker]
        APIC[api container]
        WRKC[worker container]
    end
    PGC[(Managed Postgres)]
    RDC[(Managed Redis)]
    WEBC --> APIC
    APIC --> PGC
    APIC --> RDC
    WRKC --> PGC
    WRKC --> RDC
```

Three small containers from one repo (web, api, worker) + managed Postgres &
Redis. GitHub Actions runs lint + typecheck + tests on PR, builds images, and
deploys on merge to `main`. Cheap enough to run on a hobby budget.

---

## 9. Cross-cutting concerns

- **Auth** — email/password → JWT in an httpOnly cookie. Guard on every private
  route. No tokens in `localStorage`.
- **Config** — validated once at boot (`@nexahire/config`). The app refuses to
  start with a missing/invalid env var — fail fast, not at 2 a.m.
- **Observability** — structured logging (pino) with a request id; a `/health`
  endpoint; counts for jobs aggregated, AI tokens used, notifications sent. This
  is the Sprint 7 "senior signal" layer.
- **Rate limiting & cost** — throttle AI endpoints per user; cache company
  research; respect each source's rate limits in the adapter.
- **Security** — Helmet headers, CORS allow-list, DTO validation everywhere,
  secrets only in env, dependency audit in CI.

---

## 10. Scaling story (what you say in an interview)

The monolith handles a single user (you) effortlessly and would serve thousands.
If load ever demanded it: the **worker scales horizontally first** (more BullMQ
consumers — aggregation and AI are the heavy parts), then Postgres gets read
replicas, then a hot module (e.g. sourcing) can be peeled into its own service
because the adapter boundary already isolates it. Designed to split, not split
prematurely — that sentence alone is a senior signal.
