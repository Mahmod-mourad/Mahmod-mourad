# Repo Onboarding Prompt
## Copy everything below this line and send it to Claude when you open a new repo

---

I am working on the Silver project from Aligner. The goal is to create 20 tasks from this repo that all get accepted by the platform. Each task is a real bug with a test harness and a solution patch, used to benchmark AI coding agents (SWE-bench style).

I have just opened this repo. Please analyze it fully and give me everything I need to get started. Here is what I need from you:

---

## 1. Repo Structural Report

Tell me:

- The primary language and version (e.g. Python 3.11, Node 20, Go 1.22)
- The test framework in use (pytest / jest / cargo test / go test / JUnit / etc.)
- The exact command to run all tests from the root directory
- A brief map of the main folders and what each one contains
- Any external dependencies the tests have (database, network calls, environment variables, external APIs)
- Whether the tests currently pass when run with no changes

---

## 2. Task Candidates — Find Me 20 Bugs

Search the entire codebase and identify 20 bugs suitable for the Silver project. For each one, give me:

- A short title
- The exact file path and function name where the bug lives
- A description of the broken behavior (what goes wrong and for what input)
- The correct expected behavior
- Why this is non-obvious — why would an AI agent miss the root cause?
- A suggested test name and what the test should assert
- Estimated difficulty: easy / medium / hard (target: medium — 2–3 out of 10 AI agents solve it)

Focus on these bug categories:

1. Off-by-one errors in boundary conditions (loops, slice indices, range checks)
2. Wrong comparison operator at a boundary value (> vs >= etc.)
3. Missing null or empty check that causes wrong output instead of an error
4. Type coercion or implicit conversion producing wrong behavior
5. Wrong return value for a specific edge case input
6. Multi-file interaction bug — the root cause is in a different file than the symptom
7. State mutation — function modifies input when it should not (or vice versa)
8. Swallowed exception that causes misleading downstream behavior

Spread the bugs across as many different files and modules as possible. Do not put more than 3 bugs in the same file. I need variety so the platform's similarity check does not flag them.

Do NOT suggest:
- Bugs that require network calls or external services to reproduce
- Bugs that are trivially obvious (a missing import, a typo in a variable name)
- Bugs that require days of refactoring to fix
- Bugs where the fix is stated directly in the error message

---

## 3. Draft Dockerfile for This Repo

Write a complete Dockerfile for this repo following these rules exactly:

- FROM must have a pinned tag — "FROM node:20" is fine, "FROM node" is not
- All pip packages must use ==X.Y.Z
- All npm packages must use @X.Y.Z — OR use "npm ci" with the lockfile
- Every apt-get install line must include --no-install-recommends
- No ADD http:// instructions
- No --privileged, no eval, no sh -c "$VAR"
- COPY destination must be one of: /app /workspace /tmp /opt /usr/local /home
- Maximum 200 lines, maximum 30 RUN instructions
- Also write a .dockerignore file — do NOT exclude .git/

Verify that the Dockerfile would allow the tests to run successfully inside the container.

---

## 4. Red Flags and Warnings

Tell me honestly:

- Anything that will make the Docker build difficult or fragile
- Any tests that depend on external services and cannot be used for tasks
- Any parts of the codebase that are too simple or too trivial for good task candidates
- Any risk that the repo might be rejected (public mirror, tutorial-style code, no real logic)

---

Start the analysis now. Be specific — include exact file paths, line numbers, and function names wherever possible.
