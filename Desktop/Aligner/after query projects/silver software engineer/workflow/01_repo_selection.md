# STEP 01 — Picking the Right Repo

## Why This Step Matters

Choosing the wrong repo wastes hours. A good repo gives you 20 tasks naturally. A bad repo gets you stuck at 3.

---

## Hard Requirements (Non-Negotiable)

- **Private** on GitHub — no public mirrors anywhere
- Code **you personally wrote** — not tutorials, courses, homework, or templates
- Language must be one of: TypeScript, JavaScript, Java, Rust, Go, Python
- Must have a `.git/` directory (full git history required)
- Must have an existing test suite that actually runs

---

## What Makes a Repo "20-Task Worthy"

Think about this before spending time on a repo:

### Size & Complexity
- Medium-sized codebase — not a 3-file script, not a 50,000-line monolith
- Has real business logic (not just CRUD operations)
- Multiple modules/packages that interact with each other
- Some algorithmic code (parsing, data transformation, calculations)

### Test Suite Health
- Tests already exist and pass when you run them
- Tests are written at function/unit level (not just end-to-end)
- Test runner is simple: `pytest` / `npm test` / `cargo test` / `go test ./...`
- Tests finish in under 2 minutes (Docker build time adds up)

### Bug Potential
- Code has edge cases that could be mishandled
- There are conditions, loops, or data transformations — places where off-by-one errors live
- Multiple files call each other — room for interface bugs
- Some validation or parsing logic — rich source of boundary condition bugs

---

## Red Flags (Avoid These Repos)

| Warning Sign | Why It's a Problem |
|---|---|
| Tests require a running database | Docker container can't easily spin up Postgres/MySQL |
| Tests hit external APIs | Non-deterministic, can't run in isolation |
| `npm install` takes 5+ minutes | Docker build will be slow and fragile |
| Repo uses `.env` for everything | Hard to make environment self-contained |
| Only 1–2 test files | Not enough test coverage to write 20 verifiable tasks |
| All logic is in one giant file | Tasks will look too similar to each other |
| Lots of global state or singletons | Hard to test individual behaviors |

---

## Languages Ranked by Ease of Task-Writing

1. **Python** — easiest. pytest is flexible, error messages are clear, edge cases are obvious
2. **TypeScript/JavaScript** — easy. Jest is powerful, type coercion creates natural bugs
3. **Go** — easy. built-in test framework, strict types, clear behavior
4. **Rust** — medium. excellent test support but requires more expertise
5. **Java** — medium. verbose but JUnit is reliable

---

## How to Evaluate a Repo in 10 Minutes

Run these commands on the repo before committing to it:

```bash
# 1. See the overall structure
find . -type f -name "*.py" | head -30   # or *.ts, *.go, etc.

# 2. Count existing tests
find . -type f -name "test_*.py" -o -name "*.test.ts" | wc -l

# 3. Run the tests — do they pass?
python -m pytest -v          # Python
npm test                     # Node
cargo test                   # Rust
go test ./...                # Go

# 4. Check for external dependencies
grep -r "http" tests/        # network calls in tests = bad
grep -r "localhost" tests/   # local services = risky
```

**If tests pass cleanly and there are 10+ test files → good candidate.**

---

## After Choosing Your Repo

Create a zip that includes the `.git/` directory:

```bash
cd /path/to/your/repo

# Exclude node_modules and .env but KEEP .git
zip -r my-repo.zip . \
  --exclude "node_modules/*" \
  --exclude ".env" \
  --exclude "__pycache__/*" \
  --exclude "*.pyc" \
  --exclude "target/*"       # Rust build artifacts
```

Move to **STEP 02**.
