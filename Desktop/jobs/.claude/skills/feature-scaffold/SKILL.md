---
name: feature-scaffold
description: Scaffold a new feature in NexaHire — a NestJS module (controller, service, repository, DTOs, module, tests) and/or a React feature folder (components, hooks, types) following the project's layer boundaries and Result pattern. Use this skill BEFORE writing any new feature code, whenever the user asks to add, build, or scaffold a feature, module, endpoint, page, or screen — even if they don't say the word "scaffold." Invoking this first prevents layer violations and keeps every feature shaped identically.
---

# Feature Scaffold

Generate a new feature that matches NexaHire's architecture exactly. The point is
that every feature looks the same, so the codebase stays predictable and reads as
senior-built. Read `CLAUDE.md` and `docs/architecture.md` first if not already in context.

## When the user asks for a feature, clarify in one line

Confirm: (1) feature name, (2) does it need an **api module**, a **web feature**,
or both, (3) does it have **async work** (AI call, aggregation, notification) that
needs a BullMQ processor. Then scaffold — don't over-ask.

## api module structure (NestJS)

Create under `apps/api/src/modules/{feature}/`:

```
{feature}/
├── {feature}.controller.ts     # thin: validate DTO → call service → unwrap Result → respond
├── {feature}.service.ts        # use cases; returns Result<T, AppError>; no HTTP, no Prisma
├── {feature}.repository.ts     # the ONLY Prisma access; maps exceptions → AppError
├── {feature}.module.ts
├── dto/
│   ├── create-{feature}.dto.ts        # class-validator decorators
│   └── {feature}-response.dto.ts      # explicit response shape, never a raw Prisma entity
├── processors/                        # only if async work exists
│   └── {feature}.processor.ts         # idempotent BullMQ processor
└── {feature}.service.spec.ts          # tests for the service
```

**Rules baked into the scaffold:**
- Controller methods return the response DTO and contain no business logic.
- Service methods return `Result<T, AppError>` and never throw for expected failures.
- Repository is the only file importing `PrismaService`.
- List endpoints are cursor-paginated by default — never an unbounded `findMany`.
- Shared shapes go in `packages/types`, imported by both DTO and web — don't redefine.

### Controller template
```ts
@Controller('{feature}')
@UseGuards(JwtAuthGuard)
export class {Feature}Controller {
  constructor(private readonly service: {Feature}Service) {}

  @Get()
  async list(@CurrentUser() user: AuthUser, @Query() q: List{Feature}Dto) {
    const result = await this.service.list(user.id, q);
    return unwrapOrThrow(result); // shared mapper: AppError -> HttpException
  }
}
```

### Service template
```ts
@Injectable()
export class {Feature}Service {
  constructor(private readonly repo: {Feature}Repository) {}

  async list(userId: string, q: List{Feature}Dto): Promise<Result<{Feature}Page, AppError>> {
    return this.repo.findPage(userId, q.cursor);
  }
}
```

## web feature structure (React)

Create under `apps/web/src/features/{feature}/`:

```
{feature}/
├── components/                 # presentational, small, composed
├── hooks/
│   └── use{Feature}.ts         # wraps TanStack Query/mutations; the UI's only data interface
├── types.ts                    # re-export shared types from @nexahire/types
└── {Feature}Page.tsx           # composition + layout only
```

**Rules baked into the scaffold:**
- Network access only through `src/lib/api/` — never `fetch`/`axios` in a component.
- Server data lives in TanStack Query, never `useState`.
- Every query/mutation handles `isPending`, `isError`, and empty states in the UI.
- Forms use React Hook Form + a Zod schema imported from `@nexahire/types`.

### Hook template
```ts
export function use{Feature}() {
  const query = useQuery({
    queryKey: ['{feature}'],
    queryFn: () => api.{feature}.list(),
  });
  const create = useMutation({
    mutationFn: api.{feature}.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['{feature}'] }),
  });
  return { ...query, create };
}
```

## If the feature has async work

Add a BullMQ processor in `processors/`, register the queue in the module, and make
the controller **enqueue** rather than do the work inline. Processors must be
idempotent (safe to retry) and dedupe on a stable key. AI calls go through
`core/ai`, never the raw SDK.

## Finish

After scaffolding, state the Golden Test for this feature ("Would removing X break
it?") and list what still needs implementing. Do **not** run `/code-review` yet —
that's for when the feature is done.
