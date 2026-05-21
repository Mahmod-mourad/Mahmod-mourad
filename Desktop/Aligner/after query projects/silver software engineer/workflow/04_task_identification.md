# STEP 04 — Identifying 20 Task Candidates

## The Core Challenge

You need 20 tasks from one repo and ALL of them must pass the difficulty probe (1–4 out of 10 AI agents solve it). This means you need bugs that are:

- Real and reproducible
- Verifiable by a test without grepping source
- Non-obvious enough that most AI agents miss the root cause
- Not so obscure that no agent can solve them at all

---

## The Difficulty Sweet Spot

The platform runs a frontier AI agent against your task 10 times:

```
0/10 solved  →  REJECTED (broken harness or unsolvable)
1/10 solved  →  ACCEPTED
2/10 solved  →  ACCEPTED
3/10 solved  →  ACCEPTED
4/10 solved  →  ACCEPTED
5/10 solved  →  REJECTED (too easy)
6+/10 solved →  REJECTED (too easy)
```

**Your target: 2–3/10 solved.** This gives you a safety margin on both ends.

---

## 8 Bug Categories That Hit the Sweet Spot

Use this as your hunting guide when exploring the repo:

### 1. Off-by-One in Boundary Conditions
Loops, slice indices, range checks. The bug is subtle — the code works for the normal case but fails at the edge.

Example: `range(len(items))` should be `range(len(items) - 1)` in a specific context.

### 2. Wrong Comparison Operator
`>` vs `>=`, `<` vs `<=`, `==` vs `is` in Python. The logic passes 90% of inputs but fails at the boundary value.

Example: `if count > 0` should be `if count >= 0` — zero is a valid case that gets skipped.

### 3. Missing Null / Empty Check
A function handles the happy path but crashes or silently returns wrong data when given an empty list, None, or zero.

Example: `items[0]` called without checking `if items` first.

### 4. Type Coercion Bug (great for JS/Python)
A value gets implicitly converted to a different type, causing wrong behavior.

Example: In JS, `"5" + 3 = "53"` instead of `8`. A function that should add numbers concatenates strings instead.

### 5. Wrong Return Value in Edge Case
A function returns the correct type but the wrong value for a specific input.

Example: A sorting function that returns the original list when input has exactly 1 element, but the task requires it to return a sorted copy.

### 6. Multi-File Interaction Bug
Function A passes data to function B with a subtle contract violation — wrong format, wrong unit, off-by-one in index. The bug only shows when you trace the full call chain.

These are great for difficulty because agents often fix the symptom (function B) instead of the root cause (function A).

### 7. State Mutation Bug
A function mutates its input when it shouldn't (or vice versa). Subsequent calls with the same object produce wrong results.

Example: A function that modifies a list in-place when it should return a new list.

### 8. Error Handling Gap
A function catches a broad exception and silently swallows a real error, causing a misleading result downstream.

Example: `except Exception: return None` masks a KeyError that should propagate.

---

## How to Find 20 Bugs in One Repo

Work systematically through these areas:

**Data Processing Functions**
- Every function that transforms input → output is a candidate
- Look for: map/filter/reduce logic, string manipulation, numeric calculations

**Validation Functions**
- Look for: `validate_*`, `check_*`, `is_valid_*`
- These almost always have edge cases that are wrong

**Parsing / Serialization**
- `parse_*`, `serialize_*`, `from_dict`, `to_json`
- Edge cases: empty input, nested structures, special characters

**Business Logic**
- The core domain logic of the app — this is where subtle bugs live
- Requires the most understanding, so agents often fail here

**Utility / Helper Functions**
- Small functions called by many places — a bug here affects multiple callers
- Great source of tasks because the fix is small but the impact is traceable

---

## Documenting Your 20 Candidates

Before writing any task files, fill this out for each candidate:

```text
Task #: 01
File: src/utils/parser.py
Function: parse_date_range()
Bug: When start_date equals end_date, the function returns an empty list instead of a single-element list
Fix: Change `<` to `<=` on line 47
Test that will fail: test_parse_date_range_same_day
Estimated difficulty: medium (2–3 out of 10 agents will catch it)
Notes: The test needs to call parse_date_range("2024-01-01", "2024-01-01") and assert len(result) == 1
```

Having this written down before you start STEP 05 prevents confusion and keeps you organized across 20 tasks.

---

## Strategy: Spread Bugs Across the Codebase

Do NOT put all 20 bugs in the same file or module. The platform runs a similarity check — if your tasks all look like variations of the same bug in the same file, they'll be flagged.

Aim for:
- At least 5 different files affected
- At least 3 different bug categories
- A mix of easy-medium and medium-hard difficulty
- 2–3 multi-file bugs for variety

---

Move to **STEP 05**.
