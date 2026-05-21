# STEP 03 — Building the Repo-Level Dockerfile

## What This Is

Every repo needs one base Dockerfile. This gets submitted to the platform, built in the cloud, and assigned an "approved image name" like `registry.example.com/your-repo:abc123`. Every task you create will reference this exact image in its own Dockerfile.

You only do this once per repo.

---

## The Rules (Violations = Automatic Rejection)

```text
Max size:        20 KB  |  200 lines  |  30 RUN instructions
FROM tag:        must be pinned — "FROM node:20" is OK, "FROM node" is rejected
pip packages:    must use ==X.Y.Z  (e.g. requests==2.31.0)
npm packages:    must use @X.Y.Z   (e.g. express@4.18.2) — OR use npm ci with lockfile
apt-get:         every install line must have --no-install-recommends
curl | sh:       the URL must contain a version string
Forbidden:       ADD http://  |  --privileged  |  eval  |  sh -c "$VAR"
COPY dest:       only allowed: /app /workspace /tmp /opt /usr/local /home (max 3 exceptions)
.dockerignore:   must NOT exclude .git/
```

---

## Templates by Language

### Python

```dockerfile
FROM python:3.11-slim-bookworm
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir \
    pytest==8.1.1 \
    requests==2.31.0
COPY . .
```

If the repo has a `requirements.txt`, use it — but make sure every line has a pinned version. Ask Claude to audit it for you.

### Node.js / TypeScript

```dockerfile
FROM node:20-alpine3.19
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
```

`npm ci` with a lockfile is allowed and preferred over listing every package manually.

### Rust

```dockerfile
FROM rust:1.77-slim-bookworm
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo fetch
COPY . .
```

### Go

```dockerfile
FROM golang:1.22-alpine3.19
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
```

### Java (Maven)

```dockerfile
FROM maven:3.9.6-eclipse-temurin-21
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -q
COPY . .
```

---

## .dockerignore File

Create this alongside the Dockerfile:

```text
node_modules/
__pycache__/
*.pyc
target/
.env
*.log
```

Do NOT add `.git/` to this file — the platform requires it.

---

## Testing the Dockerfile Locally

```bash
# Build it
docker build -t my-repo-test .

# Verify tests run inside it
docker run --rm my-repo-test python -m pytest -v   # Python
docker run --rm my-repo-test npm test              # Node
docker run --rm my-repo-test cargo test            # Rust
docker run --rm my-repo-test go test ./...         # Go
```

Tests must pass inside Docker before you submit the image.

---

## Common Build Problems

**"Package version not found"** — the exact version you pinned may not exist. Check PyPI / npm for the nearest available version.

**"Build takes too long"** — move dependency installation before `COPY . .` so Docker caches the layer. Only copy source code last.

**"Tests fail in Docker but pass locally"** — usually a missing environment variable or a path difference. Check that your test runner uses relative paths.

---

Move to **STEP 04**.
