# STEP 05 — Writing All 7 Task Files

## The Folder Structure

Every task is a self-contained folder with exactly this layout:

```text
task-01/
├── instruction.md
├── reference_plan.md
├── task.toml
├── environment/
│   └── Dockerfile
├── solution/
│   └── solve.sh
└── tests/
    ├── test.sh
    ├── run_script.sh
    ├── parser.py
    └── config.json
```

Work through the 7 files in the order below — each one depends on decisions made in the previous one.

---

## File 1: config.json (start here, not instruction.md)

Start with this file because it anchors everything else — the base_commit tells you exactly what broken code you're working with.

```json
{
  "base_commit": "a1b2c3d",
  "fail_to_pass": ["test_parse_empty_input", "test_parse_empty_input_returns_empty_list"],
  "pass_to_pass": ["test_parse_normal_input", "test_parse_with_whitespace"],
  "test_patch": "",
  "selected_test_files_to_run": ["tests/test_parser.py"]
}
```

### How to get the base_commit

The base_commit is the commit where the bug EXISTS — before your fix. Options:

**Option A — the bug is already in the current HEAD:**
```bash
git log --oneline -1
# copy the 7-character hash
```

**Option B — you are introducing the bug yourself (recommended for control):**
```bash
# make the change that introduces the bug
git add src/parser.py
git commit -m "introduce parser edge case bug"
git log --oneline -1   # this hash becomes your base_commit
```

Option B gives you full control over the bug and guarantees the test fails at exactly that commit.

### How to get exact test names

Run the test runner and copy the name character-for-character:

```bash
# Python
python -m pytest tests/test_parser.py -v
# look for lines like: PASSED tests/test_parser.py::test_parse_normal_input

# Node.js
npm test -- --verbose
# look for lines like: ✓ parses normal input (12ms)

# Rust
cargo test 2>&1
# look for lines like: test parser::tests::test_parse_normal ... ok

# Go
go test ./... -v
# look for lines like: --- PASS: TestParseNormal (0.00s)
```

Copy the name EXACTLY as it appears. A single character difference = the task fails the oracle check.

---

## File 2: tests/run_script.sh

This runs the tests inside the Docker container and outputs results to stdout.

```bash
#!/usr/bin/env bash
set -euo pipefail

# Python example
cd /app
python -m pytest tests/test_parser.py -v 2>&1

# Node.js example
cd /app
npm test -- --testPathPattern="parser" --verbose 2>&1

# Rust example
cd /app
cargo test parser 2>&1

# Go example
cd /app
go test ./... -run TestParser -v 2>&1
```

Keep it focused — only run the test file(s) relevant to this task. Don't run the entire test suite unless needed.

---

## File 3: tests/parser.py

This file maps the raw test runner output to a JSON format the platform understands. In most cases you can copy a standard template and just set the language:

```python
import re
import sys
import json


def parse_pytest_output(output: str) -> dict:
    results = {}
    for line in output.splitlines():
        m = re.match(r"(PASSED|FAILED|ERROR)\s+([\w/]+\.py::(\S+))", line)
        if m:
            status, _, test_name = m.groups()
            results[test_name] = status == "PASSED"
    return results


def parse_jest_output(output: str) -> dict:
    results = {}
    for line in output.splitlines():
        m = re.match(r"\s+(✓|✕|×|PASS|FAIL)\s+(.+?)(?:\s+\(\d+ms\))?$", line)
        if m:
            symbol, name = m.groups()
            results[name.strip()] = symbol in ("✓", "PASS")
    return results


if __name__ == "__main__":
    output = sys.stdin.read()
    # Change this line to match your runner:
    results = parse_pytest_output(output)
    print(json.dumps(results))
```

If you're unsure which parser to use, ask Claude: "Given this test runner output, write a parser.py that maps test names to pass/fail."

---

## File 4: solution/solve.sh

This applies a git patch that fixes the bug. It must apply cleanly at the base_commit.

```bash
#!/usr/bin/env bash
set -euo pipefail

git apply << 'EOF'
--- a/src/parser.py
+++ b/src/parser.py
@@ -44,7 +44,7 @@ def parse_date_range(start: str, end: str) -> list:
     results = []
     current = start_date
-    while current < end_date:
+    while current <= end_date:
         results.append(current.isoformat())
         current += timedelta(days=1)
     return results
EOF
```

### How to generate the patch

```bash
# Make the fix in the source file, then:
git diff HEAD src/parser.py

# Or create a patch file:
git diff HEAD src/parser.py > fix.patch
```

Paste the output of `git diff` directly into the heredoc.

### Common patch errors

- **"patch does not apply"** — the context lines in the patch don't match the file at base_commit. Check out the base_commit first: `git checkout <base_commit>`, verify the lines look identical.
- **"trailing whitespace"** — add `--whitespace=fix` flag: `git apply --whitespace=fix << 'EOF'`

---

## File 5: instruction.md

Write this AFTER you have the patch — because once you know exactly what changed, you know what symptom to describe.

### Template

```markdown
## Bug Description

Calling `parse_date_range("2024-01-15", "2024-01-15")` with identical start
and end dates returns an empty list instead of a list containing the single date.

## Expected Behavior

When start and end are the same date, the function should return a list with
exactly one element: that date as an ISO-format string.

**Input:** `parse_date_range("2024-01-15", "2024-01-15")`
**Expected:** `["2024-01-15"]`
**Actual:** `[]`

## Location

The bug is in `src/parser.py` in the `parse_date_range` function.
```

### The Golden Rule for instruction.md

Describe WHAT is broken and WHAT the correct behavior should be.
Never say HOW to fix it — no variable names, no operator names, no pseudocode.

Good: "returns an empty list instead of a single-element list"
Bad: "the while loop condition should use <= instead of <"

---

## File 6: reference_plan.md

This is for human reviewers only. Be direct and technical — this is where you explain everything.

```markdown
## Root Cause

In `src/parser.py` line 47, the while loop condition is `while current < end_date`.
When start and end are the same date, the loop body never executes because the
condition is false from the start. The fix is to change `<` to `<=`.

## What the Tests Cover

- `test_parse_date_range_same_day`: calls parse_date_range with identical start/end,
  asserts the result has exactly one element matching that date.
- This test fails at base_commit because the bug causes an empty list to be returned.
- After applying solve.sh, the condition becomes `<=` and the loop executes once.
```

---

## File 7: task.toml

```toml
author = "your-github-username"
difficulty = "medium"
category = "bug"
```

Difficulty guide:
- `easy` — single obvious condition, junior developer spots it in < 5 min
- `medium` — requires tracing logic, understanding boundary conditions
- `hard` — multi-file, subtle semantic bug, requires deep domain understanding

---

## File 8: environment/Dockerfile

```dockerfile
FROM registry.example.com/your-approved-repo-image:exact-tag
# Usually nothing else needed
# Only add lines if this specific task needs extra test dependencies
```

Use the exact approved image name from the platform after your repo Dockerfile was accepted.

---

Move to **STEP 06**.
