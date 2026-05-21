# Silver Project — Full Workflow Overview

## Goal
For each repo: create 20 tasks that all get accepted.
Each task = a real bug + test harness + solution patch.

**Payout per repo (if all 20 tasks accepted):**
- $300 repo bonus (requires 5+ approved tasks)
- $75 × 20 tasks = $1,500
- **Total: $1,800 per repo**

---

## The 7 Steps

```
STEP 01 — Pick the right repo
         ↓
STEP 02 — Send Claude the Repo Onboarding Prompt (analyze the repo)
         ↓
STEP 03 — Build the repo-level Dockerfile (approved base image)
         ↓
STEP 04 — Identify 20+ task candidates
         ↓
STEP 05 — Write all 7 files for each task
         ↓
STEP 06 — Test locally with harbor (null + oracle)
         ↓
STEP 07 — Submit and track results
```

---

## The Acceptance Filter (what kills tasks)

Understanding WHY tasks get rejected helps you avoid it:

| Rejection Reason | How Common | Prevention |
|-----------------|------------|------------|
| Tests grep source instead of running code | Very common | Always test runtime behavior |
| Instruction tells HOW to fix, not WHAT is broken | Common | Describe symptoms only |
| 0/10 solved — test harness broken | Common | Always run null + oracle locally |
| 5+/10 solved — too easy | Common | Make root cause non-obvious |
| Unpinned package versions | Common | Pin everything with exact versions |
| Task too similar to another in same repo | Occasional | Vary the bug type and location |

---

## Key Mental Model

Think of each task as a **puzzle box**:
- The AI agent gets `instruction.md` and the codebase at `base_commit`
- It must figure out the root cause and fix it
- Your tests verify the fix without revealing HOW to fix it
- The puzzle must be hard enough that only 1–4 out of 10 AI agents solve it

**Your job:** design bugs that require genuine code understanding, not pattern matching.
