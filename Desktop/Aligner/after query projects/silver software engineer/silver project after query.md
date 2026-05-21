# Silver Project — AI Task Authoring Guide

**Payout:** $300 per approved repo (requires 5+ approved tasks) · $75 per approved task · max 20 tasks per repo

---

## What You're Building

Each task = a real bug or feature in a private repo, with a test harness and a reference solution. Tasks are used to benchmark AI coding agents (SWE-bench style).

---

## Repo Requirements (one-time per repo)

- Must be **private** on GitHub (no public mirrors)
- Code you personally authored (personal projects, side projects)
- Not homework, tutorials, boilerplate, or starter templates
- Supported languages: TypeScript, JavaScript, Java, Rust, Go, Python
- Must include `.git/` directory in the zip

---

## Dockerfile Rules (repo-level + per-task)

```text
Size:          ≤ 20 KB  |  ≤ 200 lines  |  ≤ 30 RUN instructions
FROM:          must pin tag — FROM node:20 ✓  |  FROM node ✗
pip:           every package needs ==X.Y.Z
npm/yarn/pnpm: every package needs @X.Y.Z  (npm ci with lockfile is OK)
apt-get:       must include --no-install-recommends on every line
curl|sh:       URL must contain a version string
No:            ADD http://  |  --privileged  |  eval  |  sh -c "$VAR"
COPY dest:     only /app /workspace /tmp /opt /usr/local /home  (3 exceptions max)
.dockerignore: must NOT exclude .git/
```

Per-task Dockerfile must use the exact approved repo image in FROM.

---

## Task File Structure

```text
my-task/
├── instruction.md       ← what the AI agent reads
├── reference_plan.md    ← root-cause + test plan (for human reviewers)
├── task.toml            ← metadata (author, difficulty: easy/medium/hard, category)
├── environment/
│   └── Dockerfile       ← FROM <approved repo image>
├── solution/
│   └── solve.sh         ← git apply patch that fixes the bug
└── tests/
    ├── test.sh          ← harness entrypoint (rarely modified)
    ├── run_script.sh    ← test runner (pytest / jest / cargo test / etc.)
    ├── parser.py        ← maps runner output → JSON
    └── config.json      ← base_commit, fail_to_pass, pass_to_pass, test_patch
```

---

## config.json Required Fields

```json
{
  "base_commit": "<7-40 hex chars — the broken commit>",
  "fail_to_pass": ["TestName1", "TestName2"],
  "pass_to_pass": ["TestName3"],
  "test_patch": "<unified diff adding test files if not already in repo>",
  "selected_test_files_to_run": ["tests/test_something.py"]
}
```

Test names must **exactly** match what the runner outputs.

---

## Writing instruction.md

**DO:**

- Describe the bug symptom and expected behavior
- Include specific inputs and expected outputs
- Reference exact file(s) and function(s) involved
- Use short paragraphs and markdown headers

**DO NOT:**

- Say how to implement the fix (no pseudocode, no variable names, no function signatures)
- Include stack traces unless genuinely necessary
- Use vague language like "handle edge cases" — be specific

**Example (good):** "Calling `processOrder({ items: [] })` should throw an `EmptyCartError`"
**Example (bad):** "Add an if-check in `UserController.getUser` that returns 404"

---

## Writing solution/solve.sh

```bash
#!/usr/bin/env bash
set -euo pipefail
git apply << 'EOF'
--- a/src/file.py
+++ b/src/file.py
@@ -10,6 +10,8 @@
 context line
-old line
+new line
 context line
EOF
```

Patch must apply cleanly at `base_commit`.

---

## The 11 Rubric Criteria (LLM-graded — must pass ALL)

| # | Criterion | What it checks |
| --- | ----------- | -------------- |
| 01 | Verifiable | Tests are deterministic, clear pass/fail |
| 02 | Well-specified | Solvable from instruction alone, no insider knowledge needed |
| 03 | Solvable | Achievable within repo scope, not days of work |
| 04 | Genuinely difficult | Non-obvious root cause, not trivial pattern matching |
| 05 | Behavioral verification | Tests run code and check output — never grep source |
| 06 | Outcome-verified | Instruction describes WHAT, not HOW |
| 07 | Test–instruction alignment | fail_to_pass fails at base, passes after fix |
| 08 | Instruction quality | Concise prose, not walls of text |
| 09 | Fair | Self-contained, no tribal knowledge required |
| 10 | Anti-cheat | Can't be passed by hardcoding outputs |
| 11 | Deterministic | No network calls, no time-dependent assertions |

---

## Difficulty Target

The task runs against a frontier AI agent **10 times**.

- **0/10 solved** → rejected (test harness broken or unsolvable)
- **1–4/10 solved** ✓ accepted
- **5+/10 solved** → rejected (too easy)

Good difficulty sources: non-obvious root cause, multi-file changes, subtle edge cases, architecture understanding required.

---

## Validation Pipeline (in order)

1. **Similarity check** — cosine ≥ 0.75 or Levenshtein ≥ 0.70 fails (rewrite if too similar to existing tasks)
2. **Rubric review** — must get Accept or Strong Accept on all 11 criteria
3. **Image build** — Dockerfile static checks + cloud build
4. **Null & oracle** — null run: fail_to_pass must FAIL · oracle run: all tests must PASS
5. **Easiness probe** — single agent attempt; if it solves it → rejected
6. **Difficulty probe** — 10 runs; must land at 1–4/10

---

## Local Testing (before submitting)

```bash
# Install
uv tool install harbor

# Null check — fail_to_pass must FAIL
harbor run -p ./my-task -a nop

# Oracle check — all tests must PASS
harbor run -p ./my-task -a oracle

# View logs
harbor view ./jobs
```

---

## Common Failure Causes

| Stage | Problem | Fix |
| ----- | ------- | --- |
| Null | Tests pass with no solution | base_commit already has fix — use earlier commit |
| Oracle | Patch doesn't apply | Check context lines match base_commit exactly |
| Oracle | Tests fail after patch | Fix is incomplete |
| Oracle | Wrong test names | Copy names exactly from runner output |
| Rubric | Tests grep source | Rewrite to test runtime behavior |
| Rubric | Instructions prescribe implementation | Describe outcome only |
| Easiness | Agent solved it immediately | Bug needs to be subtler |
| Difficulty | 5+/10 solved | Increase complexity or tighten tests |
| Image build | Unpinned packages | Pin every dependency with exact version |

---

## Quick Checklist Before Submitting

- [ ] `harbor run -a nop` → reward.txt = 0
- [ ] `harbor run -a oracle` → reward.txt = 1
- [ ] instruction.md describes outcome, not implementation
- [ ] All test names in config.json match runner output exactly
- [ ] Every pip/npm package is pinned to exact version
- [ ] `apt-get install` has `--no-install-recommends`
- [ ] FROM in per-task Dockerfile matches approved repo image verbatim
- [ ] reference_plan.md explains root cause and what tests cover
