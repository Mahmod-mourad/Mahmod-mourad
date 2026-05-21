# STEP 06 — Local Testing with Harbor

## Why This Step Cannot Be Skipped

The platform runs these exact same checks after you submit. If you don't run them locally first, you're submitting blind. A single broken task wastes review time and delays payment. Run both checks on every single task before submitting.

---

## Setup

```bash
# Install harbor (one-time)
uv tool install harbor

# Verify it works
harbor --version
```

---

## The Two Required Checks

### Check 1: Null Run — Confirm the Bug Exists

```bash
harbor run -p ./task-01 -a nop
```

This runs your tests against the codebase at `base_commit` WITHOUT applying the fix.

**Expected result:** `reward.txt = 0`

This means your `fail_to_pass` tests are actually failing — the bug exists at that commit.

**If you get `reward.txt = 1` instead:**
The tests are passing even without the fix. This means either:
- The bug was already fixed in a later commit and your base_commit is too recent — go back to an earlier commit
- Your `fail_to_pass` tests don't actually test the broken behavior — rewrite the tests
- The base_commit hash in config.json is wrong — double-check it

### Check 2: Oracle Run — Confirm the Fix Works

```bash
harbor run -p ./task-01 -a oracle
```

This applies your `solve.sh` patch and then runs all tests.

**Expected result:** `reward.txt = 1`

This means all `fail_to_pass` tests now pass, and all `pass_to_pass` tests still pass.

**If you get `reward.txt = 0` instead:**
- **Patch doesn't apply:** context lines in solve.sh don't match the file at base_commit. Run `git checkout <base_commit>` locally and verify the lines are identical.
- **Tests still fail after patch:** your fix is incomplete. The patch fixes part of the bug but not all of it.
- **Wrong test names:** the names in config.json don't exactly match what the runner outputs. Run the runner manually and copy the names character-by-character.
- **Test file not found:** check `selected_test_files_to_run` in config.json — the path must be relative to `/app` inside the container.

---

## Viewing Logs After a Run

```bash
harbor view ./jobs
```

This opens the job logs so you can see exactly what the runner output, what the parser extracted, and why a test passed or failed. Always check this when something unexpected happens.

---

## Running All 20 Tasks in Sequence

Once you have all tasks written, test them one by one:

```bash
for task_dir in task-*/; do
    echo "Testing $task_dir..."
    harbor run -p "./$task_dir" -a nop
    harbor run -p "./$task_dir" -a oracle
done
```

Or run them manually if you want to investigate each result separately.

---

## Full Troubleshooting Table

| Symptom | Likely Cause | Fix |
|---|---|---|
| Null = 1 (tests pass without fix) | base_commit already has the fix | Use `git log` to find an earlier commit where bug exists |
| Oracle = 0, "patch failed" | Context lines in solve.sh don't match base_commit | `git checkout <base_commit>`, re-generate the diff |
| Oracle = 0, tests still fail | Fix is incomplete | Review what the failing test checks and expand the patch |
| Oracle = 0, test not found | Wrong test name in config.json | Run runner manually, copy exact name from output |
| Oracle = 0, file not found | Path in selected_test_files_to_run is wrong | Use path relative to /app inside container |
| Both = 0, docker build fails | Dockerfile issue | Check image name matches approved repo image exactly |
| pass_to_pass tests fail | Your patch broke something | Verify patch is minimal and doesn't affect other behavior |

---

## The Green Light Criteria

A task is ready to submit when:

- `harbor run -a nop` → `reward.txt = 0`
- `harbor run -a oracle` → `reward.txt = 1`

Both must be green. No exceptions.

---

Move to **STEP 07**.
