---
name: code-review
description: Review NexaHire changes against the project's conventions AND prove they compile, lint, and pass tests — before a task is considered done or a PR is opened. Use this skill whenever the user says a feature is finished, asks for a review, is about to commit or open a PR, or asks "is this done" / "review the project" — even if they don't say the word "review." It runs the real checks first (typecheck, lint, test) so findings are grounded in output, not vibes, then audits layer boundaries, the Result pattern, the adapter pattern, the AI gateway, TanStack Query rules, security, and tests. Catches the mistakes that make code read as junior.
---

# Code Review

A pre-PR pass that does two things in order: **(1) run the checks** so every claim
is backed by real output, then **(2) audit the conventions** in `CLAUDE.md`. Read
`CLAUDE.md` if it isn't already in context — it is the source of truth and this
checklist mirrors it.

## Scope

- **Default — diff mode:** review only the changed files (`git diff`, `git status`).
- **Full-repo mode:** when the user says "review the whole project / from start to
  finish," audit every workspace. Same checklist, wider net.

## Step 1 — Run the checks first (never skip)

A review that wasn't compiled is a guess. Run these from the repo root and quote
the real numbers in the verdict. Prisma's client must be generated or the api
typecheck reports phantom errors.

```bash
# Prisma client (api typecheck depends on it; bypass pnpm's build-approval gate if needed)
pnpm --filter @nexahire/api db:generate \
  || node node_modules/.pnpm/prisma@*/node_modules/prisma/build/index.js generate --schema apps/api/prisma/schema.prisma

# Typecheck every workspace
pnpm -r typecheck            # or, per package: tsc -p <pkg>/tsconfig.json --noEmit ; web: tsc -b

# Lint and test
pnpm -r lint
pnpm -r test
```

Record, per workspace: **typecheck errors, lint errors/warnings, tests passed/failed.**
If a test file collects **0 tests**, treat it as failing — it is silently not running
(e.g. Jest globals like `describe`/`jest.Mocked` under a Vitest runner without
`globals: true`).

## Step 2 — Audit the conventions

For each item: **Pass / Issue**. For every Issue name the file:line, say why it
matters (not just "violates rule"), and give the concrete fix.

### Layer boundaries
- [ ] Controllers/routes hold no business logic — only validate, delegate, respond.
- [ ] Services contain no HTTP concerns and no direct Prisma access.
- [ ] Repository is the only place Prisma or an external API is called.
- [ ] React components hold no business logic and make no direct network calls.

### Error contract (Result pattern)
- [ ] Services return `Result<T, AppError>`; they don't throw for expected failures.
- [ ] External/Prisma exceptions are caught at the boundary and mapped to `AppError`.
- [ ] The http mapper covers **every** `AppErrorKind` (a missing case silently becomes 500).
- [ ] The error response body matches the shared contract in `packages/types` — the
      web `ApiError` parses the same shape the api emits.
- [ ] Every web query/mutation renders loading, empty, and error states. No silent failures.

### Shared contract (no duplication across the boundary)
- [ ] Types/Zod schemas used on both sides come from `packages/types` — defined once.
- [ ] `Result` / `AppError` / `AppErrorKind` have **one** definition, not a copy in
      both `packages/types` and `apps/api/src/core` — a duplicate guarantees drift.
- [ ] Response DTOs are explicit; no raw Prisma entity is returned to the client.

### Data & performance
- [ ] List endpoints are cursor-paginated; no unbounded `findMany`.
- [ ] Slow/external work (aggregation, AI, notifications) runs as a BullMQ job, not inline
      in a request handler.
- [ ] BullMQ processors are idempotent and dedupe on a stable key.

### AI gateway
- [ ] All Anthropic calls go through `core/ai`; no raw SDK use in a feature.
- [ ] Prompts are versioned constants in `core/ai/prompts/`, not inline strings.
- [ ] The model id comes from config (`ANTHROPIC_MODEL`) — not a string literal copied
      into every method.
- [ ] `max_tokens` is set; the rate-limit/error path is handled; output is Zod-validated.
- [ ] The web app never calls Anthropic — the key stays server-side only.

### Config & security
- [ ] Config is read through validated env (`@nexahire/config`) — never `process.env`
      ad-hoc in `main.ts`, a controller, or a service.
- [ ] No hardcoded secrets. External input validated at the boundary (DTO / Zod).
- [ ] Auth actually works end-to-end: the web api client sends credentials
      (`credentials: 'include'`) and the cookie name matches what the api sets.
- [ ] No secrets, full CVs, or tokens in logs.

### React specifics
- [ ] Server state in TanStack Query (not `useState`); client state in Zustand; local UI state local.
- [ ] No `useEffect` used to sync server data (or an empty/no-op `useEffect`).
- [ ] Every built feature is reachable — a page/hook that nothing routes to is dead code.

### Job-source adapters (if touched)
- [ ] New source implements `JobSource`, is registered, `fetch` returns `Result`,
      `normalize` maps to the canonical `Job`.
- [ ] No scraping of boards that prohibit it — Tier-1/2 API or Tier-3 deep-link only.
- [ ] The adapter has a recorded-fixture test (no live network).

### Tests & hygiene
- [ ] Services and adapters have tests that actually run; a bug fix includes a
      reproducing test.
- [ ] Tests are deterministic — no real network, no real time.
- [ ] No build artifacts committed into `src/` (`*.js` / `*.d.ts` / `*.map` belong in
      `dist/`, git-ignored).

## Step 3 — Verdict

Group findings by severity and quote the Step-1 numbers:

- **Blocker** — does not compile / does not run / auth broken / secret leak.
- **High** — convention violation that will cause drift or a real bug.
- **Medium** — correctness or clarity issue worth fixing before merge.
- **Nit** — style, naming, dead code.

End with one line:
- **Ready** — checks green, no Blocker/High; suggest `@code-reviewer` for an
  independent deeper pass, then the `/pr` skill (or `@git-expert`) to open the PR.
- **Changes needed** — list Blockers and Highs in priority order with the fix for each.
