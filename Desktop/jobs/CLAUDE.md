# CLAUDE.md

<!--
Golden Test: "Would removing this rule cause Claude to make mistakes?"
If not — cut it. Don't restate defaults Claude already knows
(TypeScript strict mode, ESLint/Prettier, React/NestJS docs).
Rules below only encode THIS project's decisions and the things
Claude tends to get wrong without being told.
-->

**Project:** NexaHire — an AI Job-Application Copilot.
**Stack:** Turborepo monorepo · React 19 + Vite (web) · NestJS 11 (api) · PostgreSQL + Prisma · Redis + BullMQ · Anthropic SDK.
**Goal:** A real tool that helps land a contract fast, AND a portfolio piece that signals senior-level engineering.

---

# Section A — General Engineering Rules

## 1) Architecture & Separation of Concerns (YOU MUST FOLLOW)
- Respect layer boundaries strictly. API: `controller → service (use case) → repository`. Web: `route/page → feature hook → api client`.
- A controller/route holds ZERO business logic — only validation, delegation, and shaping the response.
- Business rules live in services (use cases). Data access (DB, external job-source APIs, Anthropic) lives behind a repository or a typed client — never called directly from a controller or a React component.
- Do not introduce a new pattern or abstraction without justification. Match what already exists.

## 2) Shared Code (IMPORTANT)
- Anything reused in 2+ places (types, DTOs, constants, utils, validation schemas) goes in `packages/` (`@nexahire/types`, `@nexahire/config`), not copied between `apps/web` and `apps/api`.
- Check `packages/` before writing new shared code. Never duplicate a type across the web/api boundary — define it once and import it.

## 3) Error Handling (Result pattern — project decision)
- Services return a typed `Result<T, AppError>` — they do NOT throw for expected failures (not found, validation, external-API failure, rate limit).
- `throw` is reserved for truly unexpected/unrecoverable states. Catch external errors at the boundary (repository / client) and map them to a typed `AppError`.
- Every async UI state must handle loading, empty, error, and success explicitly. No silent failures, no unhandled promise rejections.

## 4) Change Discipline
- Make the smallest change that solves the problem. Fix root causes, not symptoms.
- Don't refactor unrelated code unless explicitly asked. Never break an existing API, route, flow, or UX without being told.
- Read the relevant code before modifying it. State your assumptions when something is unclear instead of guessing.

## 5) Dependencies
- Don't add a package without justification. Any new one must be: latest stable, actively maintained, production-grade.
- Prefer the platform and what's already installed over a new dependency.

## 6) Security (this app handles personal data + API keys)
- Never hardcode secrets, tokens, or credentials. All config comes from validated env (`@nexahire/config`), never `process.env` read ad-hoc.
- The `ANTHROPIC_API_KEY` lives ONLY in the api service. The web app NEVER calls Anthropic directly — it goes through the api. No AI keys in the browser bundle, ever.
- Validate every external input at the boundary with Zod (web) / class-validator DTOs (api).
- Never log secrets, full CVs, or auth tokens. Proactively flag security risks when you spot them.

## 7) Testing
- Write tests for services (use cases) and for every job-source adapter (use a recorded fixture, never hit the live API in tests).
- A bug fix must include a test that reproduces the bug first.
- Tests must be deterministic — no real network, no real time, no flakiness. One behavior per test.

## 8) Workflow (Mandatory)
- Before scaffolding any new feature → invoke the `/feature-scaffold` skill first for structure and layer references.
- Before adding a new job source → invoke the `/job-source-adapter` skill.
- Before marking any task done → run the `/code-review` skill. "Done" means **green checks**: `/code-review` runs typecheck + lint + test across every workspace. Never call a task done on a red build, and a spec that collects **0 tests is failing**, not passing.
- After a task is approved → use the `/pr` skill (or the `@git-expert` agent) for branch, commit, and PR.
- Work **one sprint at a time**, with its own PR. Do not build several sprints in one pass — that is how 73 type errors accumulate unseen.

## 9) Agents — Proactively Suggest (YOU MUST FOLLOW)
Suggest the right agent when the situation matches. Don't wait to be asked.
- `@debugger` — on any bug, crash, error, or unexpected behavior.
- `@code-reviewer` — after `/code-review` passes, ALWAYS suggest a deeper independent review before PR.
- `@test-writer` — when code is added/changed without matching tests.
- `@git-expert` — for branches, commits, PRs, merge conflicts, or rebases.

---

# Section B — NestJS (api) Specific Rules

## 1) Module Structure (feature-first)
- One module per feature under `src/modules/{feature}/`, each with: `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `dto/`, and `{feature}.module.ts`.
- Cross-cutting concerns (auth, config, prisma, queue, ai) live under `src/core/` and are imported, never duplicated.

## 2) The Result Pattern Contract
- Repository: catch external/Prisma exceptions → return `Result<T, AppError>`.
- Service: compose repositories, apply business rules → return `Result<T, AppError>`.
- Controller: unwrap the `Result`. On error, map `AppError` to the correct HTTP status via a single shared mapper — controllers never build ad-hoc error responses.

## 3) Validation & DTOs
- Every request body/query is a DTO class with `class-validator` decorators, validated by a global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`).
- Never trust a payload that hasn't passed a DTO. Response shapes are explicit DTOs too — never leak a Prisma entity directly.

## 4) Background Work (NEVER block a request)
- Anything slow or external — job aggregation, AI calls, sending notifications, follow-up reminders — is a BullMQ job, not inline in a request handler.
- Producers enqueue; processors live in `src/modules/{feature}/processors/`. Processors are idempotent and safe to retry.

## 5) AI Calls (one gateway)
- All Anthropic calls go through `core/ai/ai.service.ts`. Features call typed methods (`tailorCv`, `scoreAts`, `draftOutreach`) — they never construct raw API requests.
- Prompts live in `core/ai/prompts/` as versioned constants, not inline strings. Always set `max_tokens` and handle the API error + rate-limit path explicitly.

## 6) Database (Prisma)
- The schema is the single source of truth. Migrations are committed; never edit the DB by hand.
- Queries that can return many rows MUST be paginated (cursor-based). No unbounded `findMany`.
- Repositories own all Prisma access. Services never touch `prisma` directly.

---

# Section C — React 19 (web) Specific Rules

## 1) State: server vs client (project decision)
- **Server state** (anything from the api) → TanStack Query. Never store fetched data in `useState`/Zustand.
- **Global client state** (auth session, theme, UI prefs) → Zustand, one store per concern.
- **Local UI state** (open/closed, focus, form fields) → `useState`/`useReducer`, scoped to the smallest component.
- If you reach for `useEffect` to sync server data, stop — that's a TanStack Query.

## 2) Data Fetching
- All network access goes through the typed api client in `src/lib/api/`. Components never call `fetch`/`axios` directly.
- Every query/mutation handles `isPending`, `isError`, and empty states in the UI. No spinner-less awaits, no swallowed errors.

## 3) Forms
- React Hook Form + a Zod schema per form. The Zod schema is imported from `@nexahire/types` when the same shape is validated on the api — define once, share.

## 4) Component Discipline
- Feature code lives in `src/features/{feature}/`; only truly shared, presentational components go in `src/components/`.
- Keep components small and composed. No business logic in components — push it into a feature hook (`useApplications`, `useAtsScore`).
- Co-locate: a feature's components, hooks, and types stay in its folder.

## 5) React 19 Notes
- Use the new `use()` hook and Actions where they genuinely simplify — don't retrofit everything. Prefer `const` and stable references; don't create new functions/objects in render paths that feed memoized children.
- No `localStorage` for sensitive data (tokens go in httpOnly cookies handled by the api).

## 6) Accessibility & UX baseline
- Every interactive element is keyboard-reachable and labeled. Loading and error states are visible, not just logged. This is a portfolio piece — polish counts.

---

# Section D — Guardrails (learned the hard way — do NOT regress)

Each rule below maps to a real bug found in review. Breaking one reintroduces a
shipped defect.

## 1) One definition of the error contract
- `Result<T, E>`, `ok`, `err`, and the `AppError` class live **only** in
  `apps/api/src/core/result/` — one file, imported everywhere in the api.
- The `AppErrorKind` union and the error-body Zod schema live **only** in
  `packages/types` (the web client parses the same shape). Nothing redefines them.
- There is **one** http mapper, and it covers **every** `AppErrorKind`
  (`Validation`, `NotFound`, `Unauthorized`, `Forbidden`, `Conflict`, `RateLimited`,
  `ExternalFailure`, `Unexpected`). A missing case silently becomes a 500 — not allowed.
- The error response body is `{ error: { kind, message, details? } }`. The api emits it;
  the web `ApiError` parses it. Same shape both sides.

## 2) Config only through validated env
- **Never** read `process.env` directly — not in `main.ts`, a controller, a service, or
  anywhere. Read through `@nexahire/config` (one validated schema, one file). The app
  fails fast at boot on a bad/missing var.
- There is **one** env schema. No second copy with different rules (e.g. `JWT_SECRET`
  min 16 vs 32).

## 3) Auth must work end-to-end
- The web api client sends `credentials: 'include'` on every request, or the httpOnly
  JWT cookie is never sent and every guarded call 401s.
- The cookie name the api sets and the flow the client expects must match. After login,
  `/auth/me` must succeed and the guarded UI must load — verify the whole loop, not just
  that login returns 200.

## 4) AI model id from config, once
- The model comes from `ANTHROPIC_MODEL` (config), defined as a single constant in
  `core/ai`. Never paste a model literal (`'claude-3-5-...'`) into each method. Default
  to the current model — `claude-opus-4-8` — not a stale one.

## 5) Never return a raw Prisma entity
- Repositories return entities internally; the controller maps to an explicit response
  DTO before sending. A `Date` field is serialized to an ISO string and typed as such.

## 6) Tests must actually run
- Vitest is the runner. Use `import { describe, it, expect, vi } from 'vitest'` (or
  enable `globals`). **Do not** use Jest globals (`jest.Mocked`, bare `describe`) — they
  throw `describe is not defined` and the suite silently collects **0 tests**.
- A spec that runs 0 tests counts as a failing spec, never as “passing.”

## 7) No build output in source
- `*.js` / `*.d.ts` / `*.map` belong in `dist/` and are git-ignored. Never commit build
  artifacts into `packages/*/src` or `apps/*/src`.

## 8) No dead UI
- Every built web feature (page + hook) is reachable through a route in the app shell.
  If you build `features/x`, wire its route in the same change — an unrouted feature is
  dead code, not a feature.

## 9) Verify, don't assume
- Before saying anything compiles/works, run it: `pnpm db:generate` (api needs the Prisma
  client) → `pnpm -r typecheck` → `pnpm -r lint` → `pnpm -r test`. Quote the real numbers.
