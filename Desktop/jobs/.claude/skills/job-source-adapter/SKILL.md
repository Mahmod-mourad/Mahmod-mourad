---
name: job-source-adapter
description: Add a new job source to NexaHire's aggregation engine by implementing the JobSource adapter interface (fetch + normalize + fixture test). Use this skill whenever the user wants to add, integrate, or pull jobs from a new source — Arbeitnow, the German Bundesagentur API, a remote board (RemoteOK/Remotive/Jobicy/Himalayas), or a per-company ATS (Greenhouse/Lever/Ashby/Workable) — even if they just say "add jobs from X." It enforces the legitimate-sourcing rules and keeps every adapter shaped the same.
---

# Job Source Adapter

Add a new source the right way: one adapter, one interface, one fixture test.
Adding sources is the most-repeated extension in this project, so consistency
matters. Read `docs/system-design.md` §4 for the three-tier model if it's not in context.

## Decide the tier first

- **Tier 1 — direct public API** (free, stable, no/trivial auth). Prefer these.
  - Arbeitnow: `https://www.arbeitnow.com/api/job-board-api?visa_sponsorship=true`
  - Bundesagentur (official DE): `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs`, header `X-API-Key: jobboerse-jobsuche` (1M+ jobs; `arbeitszeit=ho` for remote).
  - Remote aggregators: RemoteOK / Remotive / Jobicy / Himalayas (free JSON feeds).
- **Tier 2 — per-company ATS** (structured, direct from employer, zero anti-bot).
  - Greenhouse: `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`
  - Lever: `https://api.lever.co/v0/postings/{company}?mode=json`
  - Ashby / Workable: equivalent public board endpoints.
- **Tier 3 — deep-link, NOT an adapter.** LinkedIn / Bayt / Indeed / Wellfound: do
  not scrape. Add a search-URL builder to the deep-link module instead.

> **Hard rule:** never implement an adapter that scrapes a board which prohibits it.
> It breaks on markup changes, violates ToS, and risks account bans. If a source
> has no API and forbids scraping, it's Tier 3.

## Implement the interface

```ts
interface JobSource {
  readonly id: string;                                   // 'arbeitnow' | 'greenhouse:acme'
  fetch(params: JobQuery): Promise<Result<RawJob[], AppError>>;
  normalize(raw: RawJob): NormalizedJob;                 // map to the canonical Job shape
}
```

Create the adapter under `apps/api/src/modules/jobs/sources/{source}.adapter.ts`.

### `fetch`
- Call the source's API with a timeout and the source's required headers.
- Catch network/HTTP errors and return `err(AppError)` — never throw.
- Respect the source's rate limits (back off; don't hammer).
- Return the raw payloads; do not normalize here.

### `normalize`
Map each raw record to the canonical shape, keeping a stable external id:

```ts
{
  source: this.id,
  externalId: raw.<stableId>,
  dedupeHash: sha1(`${this.id}:${raw.<stableId>}`),
  title: raw.<title>,
  companyName: raw.<company>,
  location: raw.<location>,
  remote: raw.<remoteFlag> ?? inferRemote(raw),
  applyUrl: raw.<url>,
  postedAt: parseDate(raw.<date>),
  visaTags: tagVisaEligibility(raw),   // shared helper (2026 thresholds)
  raw,                                  // keep original for debugging
}
```

If a field is missing (e.g. salary is often absent), leave it null — never invent data.

## Register it

Add the adapter to the registry in `jobs.module.ts` so the `aggregate` job picks it
up automatically. The engine loops over registered adapters; it must not know any
adapter's internals.

## Test it (mandatory, with a fixture)

Record one real response into `__fixtures__/{source}.json` (commit it), then test
against the fixture — **never hit the live API in tests** (flaky, slow, rate-limited).

```ts
it('normalizes a {source} job into the canonical shape', () => {
  const raw = loadFixture('{source}.json');
  const out = adapter.normalize(raw[0]);
  expect(out.source).toBe('{source}');
  expect(out.dedupeHash).toMatch(/^[a-f0-9]{40}$/);
  expect(out.applyUrl).toBeTruthy();
});
```

Cover: the happy path, a record with missing optional fields, and (for `fetch`) the
error branch returning `err(AppError)`.

## Finish

Confirm the source's tier, that dedupe works against existing sources, and that the
fixture test passes. Then proceed to `/code-review`.
