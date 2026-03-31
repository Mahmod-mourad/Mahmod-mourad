<h1 align="center">Mahmoud Mourad</h1>
<h3 align="center">Rust Systems Engineer · Distributed Systems · WASM · Kafka · gRPC</h3>

<p align="center">
  <a href="https://linkedin.com/in/mahmoud-mourad-946a59263" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
  <a href="mailto:mahmoudmourad415@gmail.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
  </a>
  <img src="https://img.shields.io/badge/Open%20to-Remote%20Rust%20Roles-black?style=for-the-badge" />
</p>

---

## What I build

Backend and systems engineer with 3 years in production distributed systems, now focused on Rust for performance-critical infrastructure.

Currently contracting with **Alignerr** — building high-performance Rust systems for AI data pipelines at leading AI labs.

---

## Rust Projects

### ⚡ [ferroedge](https://github.com/Mahmod-mourad/ferroedge) — Distributed WASM Edge Runtime
> Rust · Tokio · Axum · Tonic (gRPC) · Wasmtime · OpenTelemetry · Prometheus · Docker

- Cold-start latency: **12ms → 0.4ms (30×)** via Wasmtime/Cranelift + LRU compiled-module cache
- **12× batch throughput** (2,200ms → 180ms) via concurrent gRPC dispatch + HTTP/2 connection pooling
- Circuit-breaker scheduler with round-robin/least-loaded strategies and graceful failover
- End-to-end distributed tracing with W3C traceparent propagation — Jaeger + Prometheus

---

### 📊 [rust-crypto-accounting-engine](https://github.com/Mahmod-mourad/rust-crypto-accounting-engine) — Event-Driven P&L System
> Rust · Tokio · Axum · Tonic (gRPC) · Apache Kafka · SQLx · PostgreSQL · OpenTelemetry

- FIFO lot accounting with **NUMERIC(28,10)** via rust_decimal — eliminates IEEE 754 rounding errors
- Exactly-once Kafka processing via idempotency guard + per-asset row-level locking
- 3-service microarchitecture: REST (Axum) → Kafka → FIFO consumer → gRPC query layer (Tonic)

---

### 🔐 [rust-nexus-api](https://github.com/Mahmod-mourad/rust-nexus-api) — Multi-Tenant REST + GraphQL API
> Rust · Tokio · Axum · async-graphql · SQLx · PostgreSQL · Redis · Prometheus

- Cursor-based pagination with composite B-tree seeks — no result drift at scale
- Auth: Argon2id (19 MiB hardness) + JWT rotation + per-IP token-bucket rate limiting via lock-free DashMap
- Prometheus metrics: request counters, DB histograms, cache hit/miss, background job throughput

---

## Stack

```
Languages   Rust · TypeScript · JavaScript · SQL
Backend     Tokio · Axum · Tonic (gRPC) · async-graphql · NestJS · Node.js
Protocols   REST · GraphQL · gRPC · WebSockets · Apache Kafka
Databases   PostgreSQL · Redis · MongoDB · SQLx
Observ.     OpenTelemetry · Prometheus · Jaeger · Sentry
DevOps      Docker · AWS (EC2, S3) · GitHub Actions CI/CD
```

---

## Experience

| | |
|---|---|
| 🦀 **Alignerr** | Rust Systems Engineer — AI data pipelines *(Dec 2025 – Present)* |
| 🌍 **Vibe Fusion UG** | Senior Backend Engineer — booking platform, 3 countries *(Oct 2025 – Present)* |
| 🏥 **NextLogix** | Full Stack Engineer — ERP + clinic management *(Feb–Sep 2025)* |
| 🏠 **Asass Elamal** | Frontend Developer — real estate platform *(Oct 2023–Jan 2025)* |

---

<p align="center">
  <b>mahmoudmourad415@gmail.com</b> · Cairo, Egypt · Open to remote
</p>
