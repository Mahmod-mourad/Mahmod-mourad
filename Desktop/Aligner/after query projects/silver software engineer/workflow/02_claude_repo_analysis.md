# STEP 02 — Sending the Repo Onboarding Prompt to Claude

## What This Step Does

After you open the repo in VSCode with Claude Code, you send Claude the onboarding prompt (in `repo_onboarding_prompt.md`). Claude will read the entire codebase and come back with:

1. A structural report of the repo (language, test framework, how to run tests)
2. A list of 10–15 task candidates with specific file/function references
3. A draft Dockerfile for the repo
4. Warnings about anything that might cause problems during review

This step saves hours — you don't manually hunt for bugs. Claude finds them for you.

---

## How to Do It

1. Open the repo folder in VSCode
2. Open `repo_onboarding_prompt.md` from this workflow folder
3. Copy the entire contents
4. Paste it into Claude Code and send it
5. Wait for Claude's full analysis

---

## What to Do With Claude's Response

### Task Candidates

Claude will give you a list like:

```
Task A — src/parser.py:validate_input() — off-by-one on empty list
Task B — src/auth.py:check_permissions() — wrong operator allows unauthorized access
Task C — src/utils.py:format_date() — timezone not handled, wrong output on DST boundary
...
```

For each candidate, ask yourself:

- **Is the root cause non-obvious?** Would a junior developer miss it on first read?
- **Can a test verify it without grepping source?** Must run the code and check output.
- **Is the fix 1–10 lines?** Bigger fixes = harder to patch cleanly.
- **Is it self-contained?** No network, no external service, no random seed.

Pick the 20 best candidates. If Claude gives fewer than 20 good ones, ask a follow-up:

```
"The repo also has [module X] — can you look deeper into that for more task candidates?
Focus on edge cases in data processing, boundary conditions, and multi-file interactions."
```

### The Dockerfile Draft

Review it against the rules in STEP 03. If anything is unpinned or violates a rule, ask Claude to fix it before proceeding.

### Warnings

Take warnings seriously. If Claude flags "tests use requests library to hit external API", that means those tests cannot run in isolation and you cannot use them for tasks. Plan around it.

---

## Follow-Up Prompts You Can Use

After the initial analysis, you can ask Claude:

```
"For task candidate B, give me the exact base_commit to use,
the test name that will fail, and a draft of the solution patch."
```

```
"Which of these 15 candidates are most likely to pass the 1–4/10 difficulty probe?"
```

```
"Are there any multi-file bugs in this repo — bugs that require changing more than one file to fix?"
```

---

Move to **STEP 03**.
