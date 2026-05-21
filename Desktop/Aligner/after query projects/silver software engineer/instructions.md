Project
silver
$300
per approved repository*
$75
per approved task
20
task max per repo
*Repository payout is conditional on at least 5 approved tasks authored against that repo. Repos with fewer than 5 approved tasks are not eligible for the $300 bonus.
Overview
Silver produces SWE-bench-style coding tasks. Each task is a real bug or feature request grounded in a private repository, with a machine-verifiable test harness and a reference solution. These tasks are used to evaluate how well AI agents can write code in realistic settings.
Start by completing the Boot Camp Training assigned to your account. Once training is complete, Repositories and Create tasks unlock, and the production workflow has three phases:
Repository submission — you upload a private codebase and a Dockerfile that builds it.
Task authoring — you write task instructions, tests, and a reference solution against a specific commit of that repo.
Validation pipeline — the platform runs your task through automated checks, including live agent runs, and tells you whether it passes.
You iterate on phases 2 and 3 until the pipeline approves your task. Most tasks take 2–4 submission attempts; the feedback is specific enough to know exactly what to fix each round.
Have a question while authoring? Keep the Silver FAQ open alongside these instructions for common clarifications and edge cases.
Step 1: Submit a repository
Go to Repositories → Upload repository and upload a .zip of your private codebase. The zip must include the .git/ directory — the platform needs full commit history to reset to specific commits during task execution.
Repositories must be private on GitHub
Submit only repositories that are private on GitHub (or not on GitHub at all). The platform automatically probes public GitHub for your repo and rejects any match — including forks, mirrors, and renamed copies. The same applies to other public hosts (GitLab, Bitbucket, public Gitea instances, etc.): if your code is reachable publicly anywhere on the internet, don’t submit it.
Submitting a public or open-source repository will be flagged, will result in rejection, and may result in removal from the project.
You must own the IP
By submitting, you confirm you own the code outright. That means it’s code you personally authored — typically a personal project, a fork you’ve contributed substantially to, or solo work you have full rights to. Do not submit code from your employer (current or former), even with written permission. Do not submit proprietary code, code under restrictive licenses you can’t grant rights to, or code that contains third-party IP. Submissions are conditionally assigned to AfterQuery on approval (per the Repository Submission Agreement), so the IP must be yours to assign.
Quality matters
We’re looking for real, meaningful codebases that reflect substantive work. Personal projects are fine — including solo work — as long as they’re significant. Good submissions include long-running personal projects you’ve invested time in, side projects with genuine scope and history, or multi-author collaborations.
What we don’t accept: homework, course assignments, hackathon submissions, tutorial follow-alongs, boilerplate starters or scaffolds, throwaway experiments, and fresh-init repos. Repositories that are too small, too recent, too single-purpose, or that obviously read as a school project, a weekend hack, or scaffolding lifted from a starter template will be rejected — both by automated gates and by the human reviewer who looks at every submission.
The platform also checks for duplicates and near-duplicates. If your repository is too similar to one that’s already in the system (including forks and renamed copies), it will be rejected.
Supported languages
TypeScript, JavaScript, Java, Rust, Go, and Python are fully supported with pre-built templates. You can also select “Other” and specify the language manually — you’ll just need to write the test runner and parser scripts yourself.
What happens after upload
An admin reviews your repository for suitability. Once approved, it appears on the Create tasks page, and you can start authoring tasks against it. If it’s rejected, you’ll see the reason on the Repositories page.
Repository payout requires 5+ approved tasks
The $300 per approved repository bonus is only paid out when the repo has at least 5 approved tasks authored against it. A repo on its own — without enough tasks landing on it — doesn’t qualify for the repository payout. Per-task payouts ($75 each) are still paid independently for every approved task, regardless of whether the parent repo has hit the 5-task threshold.
Plan your repos around getting at least 5 tasks through the validation pipeline. Repos with 0–4 approved tasks earn only the per-task payouts, not the $300 repository bonus.
Step 2: Write a Dockerfile
Every repository needs a Dockerfile that builds the project and installs its dependencies. Upload it alongside your repo, or replace it later from the Repositories page.
The build system strips the top-level folder from your zip and places your Dockerfile at the root, so always use COPY . . — not COPY my-repo-name/ ..
The platform runs static checks before the build is even attempted. A single rule violation fails the image-build stage with the rule name in the error message. The full ruleset:
Size budget
≤ 20 KB total
Dockerfile file size is hard-capped.
≤ 200 lines
Including blank lines and comments.
≤ 30 RUN instructions
Combine setup steps with && and line continuations.
FROM directive
Pin the base image
FROM node:20 ✓. FROM node or FROM node:latest ✗. Tags or digests only.
Match the approved repo image (per-task)
Per-task Dockerfiles must use the exact approved repo image reference. The repo page shows the reference you should copy verbatim.
FROM scratch is allowed without a tag
The only exception.
Pinned packages
pip — every package needs ==X.Y.Z
~=, >=, and unpinned names all fail. Exemptions: -r requirements.txt, -c constraints.txt, wheels, tarballs, git+ URLs, local paths.
npm / yarn / pnpm — every explicit package needs @X.Y.Z
Lockfile-driven installs (npm ci, bare npm install with a lockfile present) are allowed.
apt-get install — must include --no-install-recommends
Every line. No exceptions.
Network installs
curl | sh / wget | sh need a versioned URL
Allowed if the URL contains /v1.2/, /1.2.3/, or ?version=.... Otherwise pin and verify explicitly.
No ADD http(s)://
Use RUN curl with a checksum step instead.
Forbidden in RUN
--privileged
Never. No exceptions.
eval
Static analysis can't reason about it.
Dynamic command construction
sh -c "$VAR", bash -c $VAR, etc.
Base64-like literals ≥ 200 chars
Treated as obfuscation.
COPY / ADD destinations
Allowed prefixes
/app, /workspace, /tmp, /opt, /usr/local, /home.
Up to 3 destinations outside the allowlist
More than 3 fails the check.
.dockerignore
Don't exclude .git/
Tasks need full git history at runtime — git reset --hard {base_commit} is part of the fixture setup.
After static checks, the Dockerfile goes through a security review, then the image is built in the cloud. If the build fails, click Replace on the Repositories page to upload a corrected version.
Step 3: Author a task
Once your repo is approved, you have two ways to work:
Option A
Author on the platform
Click New task next to your repo. Pick the base commit; you land in an in-browser editor with pre-filled template files for your language. Browse the repo source in a separate tab while you write. Hit Submit directly from the editor when ready.
Option B
Author locally, import when done
Click Template next to your repo to download a pre-filled zip for a specific commit. Edit in your own editor, run tests locally (see Test locally), then click Import to upload. The platform creates a draft from your files and you submit from there.
Starting from the downloaded template is strongly recommended over building the file structure from scratch — it ensures the right directory layout, gives you a working test harness and parser for your language, and pre-fills boilerplate like the Dockerfile and config.json so you can focus on the actual task content.
Picking a base commit
The base commit is the “broken” state the agent starts from. Choose the commit before the fix you have in mind. The agent will try to fix whatever your task describes, starting from this exact commit.
The editor (platform authoring)
The in-browser editor has three tabs:
Task workspace — where you edit the task files. This is where you spend most of your time.
Repo files — a read-only browser of the repository source. Use this to reference code while writing instructions.
Validation — shows pipeline progress and per-stage results after you submit.
Workspace size limits
The platform enforces caps as you edit: ≤ 64 files, ≤ 256 KB per file, ≤ 768 KB total. Zip imports add their own: ≤ 2 MB zip, ≤ 512 KB per file, and the zip may contain only the files listed below.
The files you edit
my-task/
├── instruction.md       What the agent reads
├── reference_plan.md    Your root-cause + test-plan notes
├── task.toml            Metadata, timeouts, resource caps
├── environment/
│   └── Dockerfile       FROM <approved repo image>
├── solution/
│   └── solve.sh         Unified diff wrapped in git apply
└── tests/
    ├── test.sh          Harness entrypoint
    ├── run_script.sh    Language test runner
    ├── parser.py        Parses runner stdout → JSON
    └── config.json      base_commit, fail_to_pass, pass_to_pass, test_patch
instruction.mdWhat the agent sees
Describe the bug or feature clearly. Include the specific file(s) and function(s) involved, expected vs. actual behavior with concrete inputs and outputs, and any constraints. Describe what needs to happen, not how to implement it — no pseudocode, no prescribed variable names.
reference_plan.mdYour root-cause + test plan
Internal-facing companion to instruction.md. Write a short root-cause analysis, a sketch of the intended fix, and what the tests are meant to cover. Reviewers read this when a task lands in human review — treat it as the “why this is a fair, hard task” document.
tests/config.jsonTest contract
Required keys: base_commit (7–40 hex chars, must exist in the repo), fail_to_pass (non-empty array of test names that fail at base_commit and pass after the fix), pass_to_pass (tests that pass before and after), test_patch (unified diff that adds the test files at base_commit if they aren’t in the repo already), and selected_test_files_to_run. Test names must exactly match what your runner outputs.
solution/solve.shReference solution
A bash script that applies a unified-diff patch via git apply. The seed template gives you the wrapper; paste your real diff between the heredoc markers. The patch must apply cleanly at base_commit and must make every fail_to_pass test pass.
environment/DockerfilePer-task Docker environment
Must use the approved repo image as its FROM base. The template is usually close to ready — tweak it if your task needs additional system packages or a different working directory. All Dockerfile rules from step 2 apply here too.
tests/run_script.shRuns your test suite
Pre-filled for your language (e.g. yarn test, cargo test, pytest, mvn test, go test). Adjust to match your project’s actual test invocation.
tests/parser.pyParses test output
Maps runner stdout/stderr to a list of {name, status} records. Handles Jest, pytest, cargo, Maven, and Go formats. Only modify if your runner emits something unusual.
task.tomlTask metadata
Set author_name, author_email, difficulty (one of easy, medium, hard), and category. Default timeouts and resource caps are fine for most tasks.
tests/test.shTest harness orchestration
Main entrypoint the platform calls. The seed version applies test_patch, runs run_script.sh, pipes through parser.py, checks every test in fail_to_pass ∪ pass_to_pass passed, and writes 1/0 to /logs/verifier/reward.txt. You almost never modify it.
Step 4: Test locally with Harbor
Silver runs on the open-source Harbor framework. The same test.sh contract Harbor uses is what the server null/oracle stage runs — so two local commands reproduce that stage exactly. Run these locally before submitting.
1
Install Harbor and Docker
Install the CLI and make sure Docker is running locally:
uv tool install harbor    # recommended
# or
pip install harbor
2
Lay out your task
On the Create tasks page, click Template for the repo and base commit you plan to use. Unzip it; that folder is the Harbor task project. The template Dockerfile already uses the approved repo image and resets to your selected base commit, so Harbor does not require a separate source-repo archive. Use your own local copy of the repo, or the platform’s Repo files tab, as reference while filling in instruction.md, solution/solve.sh, tests/config.json, and the files under tests/.
3
Run the null check
harbor run -p ./my-task -a nop
The nop agent does nothing — it just runs tests/test.sh with no solution applied. Every test in fail_to_pass must FAIL. /logs/verifier/reward.txt should contain 0. If it’s 1, the bug is already fixed at your base_commit or your tests aren’t actually exercising the bug.
4
Run the oracle check
harbor run -p ./my-task -a oracle
The oracle agent applies solution/solve.sh first, then runs the tests. Every test in fail_to_pass ∪ pass_to_pass must PASS. reward.txt should contain 1.
If oracle fails: either git apply errored on the patch (check the patch’s context lines match base_commit), the patch applied but tests still fail (the fix is incomplete), or the test names in config.json don’t match what parser.py emits.
5
Inspect logs
harbor view ./jobs
Opens an interactive viewer with stdout, stderr, parser output, and reward file for each run. Use this when oracle fails to see the exact runner output the parser saw.
Harbor only covers the null/oracle stage. The server pipeline also runs Dockerfile static checks (run them mentally against step 2’s rules), the similarity check (server-only, requires the corpus), the rubric LLM (server-only), and the easiness probe (server-only). Passing both Harbor commands locally is necessary but not sufficient — it just rules out the failure mode that would have wasted an attempt.
What makes a good task
A good task is a real problem — something that actually happened in your codebase (or plausibly could). The best tasks come from real bugs, real feature requests, or real refactoring challenges. They should be hard for an AI agent to solve, but fair.
What to look for in your codebase
Bugs with non-obvious root causes
The symptom appears in one place but the fix is in another. The agent needs to trace through multiple files or understand a subtle interaction to find the real issue.
Cross-cutting changes
Tasks that touch multiple files or modules are harder than single-function fixes. Think: a type change that ripples through several call sites, or a config change that affects multiple subsystems.
Edge cases and subtle invariants
Off-by-one errors, race conditions, encoding issues, boundary conditions in business logic. These require careful reasoning, not just pattern matching.
Non-trivial feature additions
Small features that require understanding the existing architecture to integrate correctly. The agent needs to figure out the right place to add code, not just write new code in isolation.
Tasks need to land in the difficulty sweet spot
The difficulty probe runs your task against a state-of-the-art AI agent 10 times. To be accepted, the agent must solve it in 1–4 of those 10 runs:
0/10 — rejected as unverifiable. Either the task is unsolvable as specified, or the test harness has a bug preventing any agent from passing.
1–4/10 — accepted. The task is hard but solvable with careful reasoning.
5+/10 — rejected as too easy. The agent can solve it on most attempts, which means it isn’t exercising the kind of reasoning we’re trying to evaluate.
This is a high bar — tasks that feel moderately difficult to a human are often trivially solvable by an agent that can search and read the entire codebase instantly.
Difficulty should come from the problem itself
A hard task has a non-obvious root cause, requires understanding a complex interaction, or involves a subtle edge case. A task that's hard because the instructions are vague or the tests are broken is not a good task — the rubric will catch this and reject it.
Think about what the agent can do easily
Agents are extremely good at: searching code, reading documentation, following clear instructions, making straightforward fixes. Your task needs to require something more — reasoning about runtime behavior, understanding implicit constraints, or connecting information across distant parts of the codebase.
Writing good instructions
Describe outcomes, not implementations
Say “the /api/users endpoint should return 404 when the user is deleted” instead of “add an if-check in UserController.getUser that returns 404. ” The agent needs to figure out the how.
Be concrete about what correct looks like
Include specific inputs and expected outputs where possible. “The function should handle edge cases” is vague. “Calling processOrder({ items: [] }) should throw an EmptyCartError” is testable.
Keep formatting clean
Avoid walls of text. Use short paragraphs with line breaks. Markdown headers are fine for longer tasks. Don't dump config files or stack traces into the instructions unless they're genuinely necessary context.
Don't leak the solution
Don't name the exact variable, function signature, or algorithm the solution should use. Don't include pseudocode. The task should be solvable from the description of the bug and the expected behavior alone.
Writing good tests
Test behavior, not implementation
Good tests run the code and check outputs. Bad tests grep the source for variable names, scan for specific import statements, or regex-match function signatures. If a correct but differently-structured solution would fail your test, the test is brittle and the pipeline will flag it.
Tests must actually execute the code
Every test in fail_to_pass must genuinely call the code path the task is about and assert on the result. A test that just checks if a file exists or if a string appears in the source isn't verifying behavior.
Get the test names right
The names in fail_to_pass and pass_to_pass must exactly match what your test runner outputs. Run your tests locally and copy the names from the output. Mismatched names are a common cause of validation failures.
Test isolation matters
Tests should not depend on execution order, network access, or mutable shared state. The container is fresh for every run, but tests within a run share a process.
The rubric
The rubric stage is the most common source of verdict failures. An LLM grades your task against the 11 criteria below. The verdict must be Accept or Strong Accept — anything else (Uncertain, Reject, Strong Reject) fails this stage. The list is kept in sync with the LLM prompt at app/projects/silver/lib/pipeline/rubric-review.ts.
01
Verifiable
Tests are deterministic and produce a clear pass/fail signal. No subjective judgment in the pass condition.
02
Well-specified
A competent engineer could reproduce the intended outcome from the instruction alone, without insider knowledge of your repo or your fix.
03
Solvable
Achievable within the repo's scope and a reasonable time budget. Not days of work; not requiring multiple unrelated fixes.
04
Genuinely difficult
The challenge is intellectual, not formatting busywork. The agent has to reason about runtime behavior, find a non-obvious cause, or connect distant parts of the codebase.
05
Behavioral verification
Tests execute the code and assert on its actual behavior. They never grep source for variable names, scan imports, or regex-match function signatures as a stand-in for correctness.
06
Outcome-verified
The instruction describes what should be true after the fix, not how to implement it. No pseudocode, no dictated function names, no step-by-step implementation guidance.
07
Test–instruction alignment
fail_to_pass tests fail at base_commit and pass after solve.sh. pass_to_pass tests pass throughout. Tests cover everything the instruction asks for, and nothing more.
08
Instruction quality
Concise, human-written prose. Short paragraphs. Headers if it helps. Not a wall of stack traces; not a copy-pasted config dump as the body of the description.
09
Fair
Self-contained. The agent shouldn't need information not present in the repo or the instruction itself. No insider tribal knowledge.
10
Anti-cheat robustness
Tests can't be passed by hardcoding outputs, monkey-patching the system under test, or wrapping it in a fake. A solution that doesn't actually fix the bug should fail.
11
Deterministic & reproducible
Repeated runs produce the same result. No external services that change between runs. No time-dependent assertions. No nondeterministic ordering.
The validation pipeline
When you click Submit on a draft, it enters the pipeline. Each stage is pass/fail — if any stage fails, the pipeline stops, the draft unlocks, and you can revise and resubmit. The thresholds below are the actual numbers the server enforces.
1
Similarity check
cosine ≥ 0.75 OR Levenshtein ≥ 0.70
Your instruction is compared against existing tasks. Patch-hash dedup also runs against the exact bytes of solve.sh.
2
Rubric review
Accept or Strong Accept only
An LLM grades your task against the 11 rubric criteria above. Per-criterion notes appear in the validation tab when this stage fails.
3
Image build
static checks + build success
Static rules from step 2 run first. If they pass, your per-task Dockerfile is built in the cloud.
4
Null & oracle
null FAILs, oracle PASSes
Two parallel runs. Null: no solution applied — fail_to_pass tests must FAIL. Oracle: solve.sh applied — fail_to_pass ∪ pass_to_pass tests must PASS.
5
Easiness probe
agent must NOT solve trivially
A model attempts your task once inside the built container with no hints. If it solves the task on this single attempt, the task is rejected as too easy.
Two final stages run after the easiness probe: a difficulty probe (10 Opus runs — your task must land in the 1–4 / 10 sweet spot) and an LLM trajectory review of the failed runs.
Common pitfalls
Each pitfall below is tagged with the stage that catches it, so you know where in the pipeline it’ll surface and what to read next.
Stage 4 · Null
Tests pass without any solution
Your base commit already has the fix, or the test doesn't actually exercise the bug. Choose an earlier commit where the bug is present, or write a more targeted test.
Stage 4 · Oracle
Tests fail even with the solution
Three usual causes: (1) the patch doesn’t apply cleanly at base_commit — check the context lines; (2) the patch applies but is incomplete; (3) test names in config.json don’t match parser.py output. Run harbor run -a oracle locally and inspect parser output.
Stage 5 · Easiness
The agent solved your task on its single attempt
The problem itself isn't hard enough — and making the instructions vaguer won't help, the model will still see the bug clearly. You need a problem with a non-obvious root cause, a subtle interaction between components, or a tricky edge case.
Stage 6 · Difficulty
More than 4 of 10 difficulty-probe runs solved it
Same root cause as the easiness probe — the bug is too easy for a frontier model. The difficulty probe is stricter: 5+ of 10 runs solving means the task isn't exercising the kind of reasoning we're trying to evaluate. Make the bug subtler or constrain the test more aggressively.
Stage 6 · Difficulty
0 of 10 difficulty-probe runs solved it
The task is unverifiable — either the test harness is broken (no agent can pass even with the correct fix) or the task as specified has no solution. Run the oracle locally to confirm your patch passes, then verify the harness actually gates on the right tests.
Stage 2 · Rubric
Tests check implementation details (brittle)
Your tests are checking implementation details (variable names, specific strings in source, import statements) rather than running code and checking outputs. Rewrite to test behavior. Fails criterion 5.
Stage 2 · Rubric
Instructions are over-prescriptive
Your instructions include pseudocode, specific variable names, or step-by-step implementation guidance. Remove these and describe only the expected behavior and constraints. Fails criterion 6.
Stage 1 · Similarity
Cosine ≥ 0.75 or Levenshtein ≥ 0.70 against an existing task
Your instruction is too close to one already in the system. Rewrite from scratch — paraphrasing rarely moves the embedding far enough. Pick a different bug or feature.
Stage 3 · Image build
Image build fails
Check the build log in the validation tab. Common causes: your per-task Dockerfile's FROM image doesn't match the approved repo image, a dependency install step fails, or a system package is missing.
Stage 3 · Image build
Dockerfile rejected for unpinned packages
Pin every package: pip install pytest==8.2.2, npm install jest@29.7.0. Unversioned installs are rejected because they make builds non-reproducible.
Stage 3 · Image build
apt-get without --no-install-recommends
Add the flag to every apt-get install line, even short ones. The static checker rejects any line missing it.
Stage 3 · Image build
COPY destination outside allowlist
COPY only to /app, /workspace, /tmp, /opt, /usr/local, or /home. You get up to 3 exceptions outside that set; more than 3 fails the check.
Pre-pipeline
Dockerfile FROM doesn't match approved repo image
Use the exact approved image reference shown on the repo page. Copy it verbatim into your FROM line.
Pre-pipeline
No changes since last submission
The platform hashes content to prevent identical resubmissions. Edit something material — a fix that changes the patch bytes, an instruction rewrite, an updated test name.
Practical workflow
Here’s the process most experienced task authors follow. Step 4 in particular saves submission cycles — running Harbor locally catches the most common stage-4 failures before they reach the server pipeline.
1
Pick a real bug or feature from your repo's history
Look at your commit log for changes that were non-trivial to implement, touched multiple files, or fixed a subtle issue. The commit before the fix is your base commit.
2
Download the template
On the Create tasks page, click Template and pick your commit. This gives you a zip with the right directory structure and language-specific boilerplate already filled in. Open it in your editor of choice.
3
Write the instruction first
Before touching any other file, write what the agent should see. If you can't describe the task without leaking the solution, it might not be a good candidate.
4
Run Harbor locally until null fails and oracle passes
harbor run -p ./my-task -a nop must report fail_to_pass FAILing. harbor run -p ./my-task -a oracle must report all required tests PASSing. This rules out stage-4 failures, which otherwise eat an attempt for a problem you could have caught in 90 seconds locally.
5
Re-read your instruction against the 11 rubric criteria
Specifically: would a fresh engineer reproduce the outcome without insider context? Is anything an implementation hint? Is anything that looks like a stack trace actually load-bearing?
6
Import or edit on the platform
Click Import to upload your local zip, or click New task and edit directly in the browser. Either way, you end up with a draft you can submit.
7
Submit and read the validation tab in full
The pipeline feedback is specific and actionable — it's faster to iterate on real feedback than to guess what the pipeline wants. When the rubric stage fails, per-criterion notes are included.
8
Iterate offline before resubmitting
Each draft tracks all previous submissions in the past-runs expander. Don't resubmit with the same issue; spend the iteration fixing the cited problem first.
9
If you hit the 20-task cap, delete a non-approved draft
Each repo allows up to 20 of your tasks — the goal is 20 approved. Only Approved drafts are protected from deletion (they're paid and can't be reclaimed). Anything else — Needs Review, Rejected, Validation Failed, or never submitted — is deletable from the Create tasks page and frees a slot immediately.

