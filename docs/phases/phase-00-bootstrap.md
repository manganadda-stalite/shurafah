# Phase 0 — Project Bootstrap

**Goal:** Stand up a bare Laravel 13 application with tooling, Docker, CI, and the module
system — **no product features yet**. After this phase the app boots and CI is green.

**Why now:** Everything else needs a running, linted, tested skeleton.

## Scope
**In:** Laravel install, env config, Docker (Sail), module system, code‑quality tooling, CI,
base security config.
**Out:** Any UI, DB tables for features, auth.

## Prerequisites
- None (first phase).

## Tasks
- [ ] `laravel new` (Laravel `^13`, PHP 8.3+). **Do not** install Breeze/Jetstream (Tailwind).
- [ ] Add `.env.example` documenting DB, Redis, S3/MinIO, Sanctum, mail, Sentry keys.
- [ ] Laravel **Sail** (Docker): MySQL 8, Redis, MinIO, Mailpit.
- [ ] Choose module system (recommend `nwidart/laravel-modules`) and create empty **Core** module.
- [ ] Install dev tooling: `laravel/pint`, `larastan/larastan`, `pestphp/pest`,
  `nunomaduro/collision`, `barryvdh/laravel-debugbar` (dev).
- [ ] Install base runtime: `laravel/sanctum`, `bepsvpt/secure-headers`,
  `spatie/laravel-query-builder`.
- [ ] Configure Vite inputs placeholder (no Tailwind).
- [ ] Add **GitHub Actions CI**: install, `pint --test`, `larastan`, `pest`, `composer audit`.
- [ ] Health check route `/up` works; `php artisan test` green.

## Artifacts
- Running app (`sail up`), `Modules/Core`, `.github/workflows/ci.yml`, `README` dev setup.

## Packages
- See [`../../architecture/02-tech-stack.md`](../../architecture/02-tech-stack.md).

## Security (DoD)
- `APP_DEBUG=false` in non‑local; secrets only in `.env`; secure‑headers middleware registered.

## Tests
- A trivial smoke test (`/up` returns 200) passes in CI.

## Definition of Done
- [ ] `sail up` boots the app; `/up` is 200.
- [ ] `pint --test`, `larastan`, `pest` all green locally and in CI.
- [ ] Module system loads the empty Core module.
