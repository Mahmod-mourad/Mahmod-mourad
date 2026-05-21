# STEP 07 — Submission Checklist

## Before You Submit Anything

Read this entire checklist once, then go through it task by task. One missed item can reject an otherwise good task.

---

## Per-Task Checklist (repeat for all 20 tasks)

### Harbor Tests

- [ ] `harbor run -p ./task-XX -a nop` returns `reward.txt = 0`
- [ ] `harbor run -p ./task-XX -a oracle` returns `reward.txt = 1`

### instruction.md

- [ ] Describes the broken behavior with a concrete example (specific input and expected output)
- [ ] References the exact file and function where the bug is
- [ ] Does NOT say how to fix it — no operator names, no variable names, no pseudocode
- [ ] Written in clear prose — not a wall of bullet points

### config.json

- [ ] `base_commit` is a valid 7–40 character hex hash
- [ ] Every name in `fail_to_pass` matches runner output character-for-character
- [ ] Every name in `pass_to_pass` matches runner output character-for-character
- [ ] `selected_test_files_to_run` contains the correct relative path

### solution/solve.sh

- [ ] Patch applies cleanly at `base_commit` — tested with `git apply`
- [ ] Patch is minimal — only changes what is necessary to fix the bug
- [ ] No trailing whitespace issues in the diff

### environment/Dockerfile

- [ ] `FROM` line uses the exact approved repo image name from the platform
- [ ] No unpinned packages added
- [ ] `--no-install-recommends` on any `apt-get install` line

### reference_plan.md

- [ ] Explains the root cause at the code level (file, line, what is wrong)
- [ ] Explains what each test in `fail_to_pass` actually verifies
- [ ] Written for a human reviewer, not the AI agent

### task.toml

- [ ] `author` field matches your GitHub username
- [ ] `difficulty` is one of: `easy`, `medium`, `hard`
- [ ] `category` is one of: `bug`, `feature`

---

## Repo-Level Checklist (once per repo)

- [ ] Repo is private on GitHub
- [ ] The zip file includes the `.git/` directory
- [ ] `.dockerignore` does NOT exclude `.git/`
- [ ] Repo Dockerfile builds successfully and tests pass inside the container
- [ ] You have at least 5 passing tasks (required for the $300 repo bonus)
- [ ] Tasks are spread across at least 5 different files (similarity check protection)
- [ ] Tasks use at least 3 different bug categories (similarity check protection)

---

## What Happens After Submission

The platform runs these checks in order. Knowing this helps you predict what went wrong if something gets rejected:

**Stage 1 — Similarity Check**
Cosine similarity >= 0.75 or Levenshtein >= 0.70 compared to existing tasks. If flagged, rewrite the instruction.md to describe the symptom differently. The underlying bug can stay the same.

**Stage 2 — Rubric Review (11 criteria, LLM-graded)**
The most common failures:
- Criterion 05: Tests grep source — rewrite to test runtime behavior
- Criterion 06: Instruction describes implementation — rewrite to describe outcome only
- Criterion 10: Anti-cheat — if an agent can pass the test by hardcoding the output, redesign the test

**Stage 3 — Image Build**
Dockerfile static analysis + cloud build. Fails on: unpinned versions, forbidden instructions, size over limit.

**Stage 4 — Null and Oracle Runs**
Same as your local harbor checks. If it passed locally, it should pass here. If not, the image environment differs — check that you're using the approved repo image correctly.

**Stage 5 — Easiness Probe**
One AI agent attempt. If it solves it → rejected. If this happens, the bug is too obvious. Make the root cause less visible or add a red herring.

**Stage 6 — Difficulty Probe**
10 AI agent runs. Must land at 1–4 solved. If all 10 fail → test harness is broken or the bug is truly unsolvable (go back to STEP 05). If 5+ solve it → increase complexity.

---

## Payout Summary

- $75 per accepted task
- $300 bonus when 5+ tasks from one repo are accepted
- 20 tasks all accepted = $75 x 20 + $300 = **$1,800 per repo**
