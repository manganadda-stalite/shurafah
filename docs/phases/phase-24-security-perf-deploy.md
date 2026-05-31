# Phase 24 — Security, Performance & Deployment

**Goal:** Production readiness — security audit, performance/caching, media/CDN, deployment
pipeline, backups, and monitoring.

## Scope
**In:** Security review against the architecture/07 checklist; caching + query optimisation;
CDN + signed media; CI/CD deploy; backups; monitoring/alerting; load test.
**Out:** New features.

## Prerequisites
- Phase 23 (and all feature phases).

## Tasks
- [ ] Full security pass: headers/CSP (AdSense+fonts allow‑listed), rate limits, authz coverage,
  `composer audit`/`npm audit`, dependency updates, `APP_DEBUG=false`, least‑privilege DB user.
- [ ] Performance: cache hot endpoints (Redis), eager‑load to kill N+1, paginate everything,
  `config/route/view:cache` on deploy, consider Octane/FrankenPHP.
- [ ] Media: S3 + CDN, signed/temporary URLs, optional HLS transcode pipeline.
- [ ] Deploy: staging→prod pipeline, zero‑downtime releases, `migrate --force`, health checks.
- [ ] Ops: `spatie/laravel-backup` (DB+storage, offsite, restore drill), Sentry, uptime + queue
  monitoring, alerting.
- [ ] Load test critical paths (home feed, stream, search, subscribe).

## Security (DoD)
- All architecture/07 checklist items satisfied; pen‑test/issues triaged; backups restorable.

## Tests
- Smoke + critical‑path E2E on staging; backup restore verified; load test meets targets.

## Definition of Done
- [ ] App deployed to production with monitoring, backups, CDN, and a green security checklist.
