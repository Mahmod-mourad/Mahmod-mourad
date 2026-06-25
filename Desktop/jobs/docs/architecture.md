# NexaHire — Architecture

This document is the map. It explains *where things go and why*, so that every
feature is built the same way. The system design doc (`system-design.md`) covers
*how the pieces talk to each other at runtime*.

## 1. Why this shape

Three forces drive the design:

1. **Ship fast, hunt from day one.** The tracker must be usable on real
   applications in week one, so the architecture favors vertical feature slices
   over horizontal "build all the infra first" layers.
2. **Senior signal.** Clear boundaries, a typed error contract, the adapter
   pattern, background jobs, and tests are exactly what a European tech lead
   reads as "this person operates at a senior level."
3. **Cheap to run.** A modular monolith (not microservices) keeps hosting to one
   small box + Postgres + Redis. Easy to deploy, easy to reason about, and you
   can split a module out later if you ever need to.

## 2. Monorepo layout (Turborepo + pnpm)

```
nexahire/
├── apps/
│   ├── web/                 # React 19 + Vite
│   │   └── src/
│   │       ├── app/                 # routing, providers, shell
│   │       ├── features/{feature}/  # components + hooks + types per feature
│   │       ├── components/          # shared presentational components
│   │       └── lib/
│   │           ├── api/             # typed api client (the ONLY network layer)
│   │           └── query/           # TanStack Query setup
│   └── api/                 # NestJS 11
│       └── src/
│           ├── core/                # cross-cutting: config, prisma, auth, queue, ai
│           │   ├── config/
│           │   ├── database/        # PrismaModule + PrismaService
│           │   ├── auth/
│           │   ├── queue/           # BullMQ setup
│           │   ├── ai/              # the single Anthropic gateway
│           │   └── result/          # Result<T, E> + AppError + http mapper
│           └── modules/{feature}/   # one module per feature (see §4)
├── packages/
│   ├── types/               # shared TS types + Zod schemas (the contract)
│   ├── config/              # shared, validated env loading
│   └── tsconfig/            # base tsconfigs
├── docker-compose.yml       # postgres + redis for local dev
├── turbo.json
└── CLAUDE.md
```

**The contract lives in `packages/types`.** A DTO shape that the api validates and
the web app submits is defined *once* there as a Zod schema, and both sides import
it. This is what keeps the two apps from drifting apart and is a big part of the
"typed end to end" senior signal.

## 3. Layer boundaries

### api (NestJS)

```
HTTP → Controller → Service (use case) → Repository → Prisma / external client
                         │
                         └── core/ai, core/queue (for slow/external work)
```

- **Controller** — validate (DTO) → call service → unwrap `Result` → respond. No logic.
- **Service** — the business rules. Returns `Result<T, AppError>`. Knows nothing about HTTP.
- **Repository** — the only place Prisma or an external API is touched. Maps thrown
  exceptions into typed `AppError`s.

A controller must never import Prisma. A service must never import `@nestjs/common`
HTTP decorators. If you find yourself wanting to, the responsibility is in the wrong layer.

### web (React)

```
Route/Page → Feature hook (useX) → api client → api
                  │
                  └── TanStack Query (server state) / Zustand (client state)
```

- **Page/route** — composition and layout only.
- **Feature hook** — wraps TanStack Query/mutations, exposes a clean interface to the UI.
- **api client** — typed functions, the single network boundary.

Components never call the network and never hold server data in `useState`.

## 4. Anatomy of a feature module (api)

Every feature is the same shape, which is what `/feature-scaffold` generates:

```
modules/applications/
├── applications.controller.ts     # HTTP, thin
├── applications.service.ts        # use cases, returns Result
├── applications.repository.ts     # Prisma access, returns Result
├── applications.module.ts
├── dto/
│   ├── create-application.dto.ts
│   └── application-response.dto.ts
├── processors/                    # BullMQ processors (if the feature has async work)
└── applications.service.spec.ts   # tests
```

## 5. Core patterns (the three that matter most)

### a) Result pattern — typed errors, no surprise throws
Expected failures are values, not exceptions. A service returns
`Result<Application, AppError>`. The controller maps `AppError.kind`
(`NotFound`, `Validation`, `Unauthorized`, `ExternalFailure`, `RateLimited`) to an
HTTP status through one shared mapper. Benefits: every failure path is visible in
the type system, and you can't forget to handle one.

### b) Adapter pattern — pluggable job sources
Every job source implements one interface:

```ts
interface JobSource {
  readonly id: string;                       // 'arbeitnow', 'greenhouse:acme'
  fetch(params: JobQuery): Promise<Result<RawJob[], AppError>>;
  normalize(raw: RawJob): NormalizedJob;     // map to our canonical shape
}
```

Adding Arbeitnow, the German Bundesagentur API, or a per-company Greenhouse/Lever
board is "write one adapter." The aggregation engine loops over registered adapters
and never knows their internals. This is the cleanest, most extensible part of the
system — see `system-design.md` §4 and the `/job-source-adapter` skill.

### c) AI gateway — one door to Anthropic
All model calls funnel through `core/ai/ai.service.ts`, which exposes typed methods
(`tailorCv`, `scoreAts`, `draftOutreach`, `simulateNegotiation`). Prompts are
versioned constants. Features depend on the gateway's typed interface, not on the
Anthropic SDK. Swapping a model or adding prompt caching happens in one place.

## 6. The error contract (memorize this)

| Layer        | On failure does…                                              |
|--------------|---------------------------------------------------------------|
| Repository   | catches the exception, returns `err(AppError)`                |
| Service      | propagates or returns its own `err(AppError)`                 |
| Controller   | maps `AppError` → HTTP status via the shared mapper           |
| Web api client | throws a typed `ApiError` for TanStack Query to catch       |
| Web UI       | renders the error state from `isError` — never a blank screen |

## 7. What we deliberately do NOT do

- No microservices. One api process, scaled vertically; split later only if forced.
- No scraping LinkedIn/Indeed/Bayt — see system design §4. APIs and deep-links only.
- No GraphQL for v1. REST is enough and faster to ship; revisit if the UI needs it.
- No premature caching/CQRS. Add when a real bottleneck shows up, not before.
