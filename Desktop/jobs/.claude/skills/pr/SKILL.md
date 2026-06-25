---
name: pr
description: Open a clean pull request for a finished, reviewed NexaHire change — branch, commit, push, and create the PR with a structured body. Use this skill when the user asks to commit, push, open/raise a PR, or "ship this," AFTER the work is done. It enforces the project's git rules: never commit on the default branch, run /code-review first, write a conventional-commit message and a PR body that states what changed and why, and add the required Claude Code attribution footers. Pairs with the @git-expert agent referenced in CLAUDE.md §8.
---

# Open a PR

Turn a reviewed change into a tidy branch + commit + pull request. The goal is a
PR a senior reviewer can read in two minutes: focused diff, clear message, tests
green.

## Preconditions (stop if any fails)

1. **`/code-review` has passed** — checks are green and no Blocker/High remains. If it
   hasn't run, run it first; do not open a PR over a red build.
2. **The user asked to commit/push/PR.** Don't do it proactively — committing and
   pushing are outward-facing actions.
3. **You are not committing straight onto the default branch.** If `git branch --show-current`
   is `main`, create a feature branch first.

## Step 1 — Branch

Use a descriptive, conventional branch name matching the work:

```bash
git checkout -b <type>/<short-slug>     # feat/application-tracker, fix/auth-cookie, chore/ci
```

`type` ∈ `feat | fix | chore | refactor | docs | test`.

## Step 2 — Stage and review the diff

```bash
git status
git diff --staged        # read what you're about to commit
```

Stage only files that belong to this change — never `git add -A` blindly. Do **not**
stage: `.env`, anything secret, build output (`dist/`, `*.js`/`*.d.ts` leaked into
`src/`), or unrelated edits. If you see a secret staged, stop and tell the user.

## Step 3 — Commit

One logical change per commit. Conventional-commit subject, body explaining the
*why*. **Every commit message ends with the attribution footer:**

```bash
git commit -m "$(cat <<'EOF'
feat(applications): add Kanban tracker with optimistic stage moves

Cursor-paginated CRUD behind the Result pattern, a five-stage board with
optimistic TanStack Query mutations, and a per-stage stats strip.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

## Step 4 — Push and open the PR

```bash
git push -u origin <branch>
gh pr create --base main --title "<type>(scope): summary" --body "$(cat <<'EOF'
## What
<one-paragraph summary of the change>

## Why
<the problem / sprint goal this serves>

## How
- <key implementation points / layer touched>

## Testing
- typecheck: <pass>
- lint: <pass>
- tests: <N passed>
- Golden Test: <the sprint's one-sentence success check, and that it holds>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Rules baked in

- Use the `gh` CLI for all GitHub actions (PR, checks, review threads).
- Commit footer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- PR body footer: the `🤖 Generated with Claude Code` line above.
- Keep the PR scoped to one sprint/feature — a 2,000-line PR across eight features is
  unreviewable; split it.
- Never force-push a shared branch or rewrite published history without being asked.
- Interactive git flags (`-i`) are unavailable in this environment.

## Finish

Report the PR URL. Then suggest the independent `@code-reviewer` pass on the PR if it
hasn't run, and note any follow-up the reviewer flagged.
