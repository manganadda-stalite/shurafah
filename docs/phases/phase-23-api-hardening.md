# Phase 23 — API Hardening for Flutter

**Goal:** Finalise the `/api/v1` surface so the Flutter app can be built against a stable,
documented, secure contract. No new business logic — harden + document what feature phases built.

## Scope
**In:** Consistent envelope/pagination across all endpoints; throttles per token/IP; OpenAPI docs
+ `openapi.json`; `app/config` (min version/maintenance/flags); device/push endpoints verified;
CORS + Sanctum config reviewed.
**Out:** New features.

## Prerequisites
- All feature phases that expose API endpoints (3–12, 17, 18, 20, 22).

## Tasks
- [ ] Audit every endpoint for: auth, object‑level authz (BOLA), resource shape, pagination,
  allow‑listed filters/sorts/includes, throttling.
- [ ] Install/configure `dedoc/scramble`; serve docs at `/docs/api`; export `openapi.json`.
- [ ] Provide a Postman collection; document auth + error formats for the mobile team.
- [ ] Versioning/deprecation policy documented; add `/api/v1/app/config`.

## Security (DoD — OWASP API Top 10, architecture/07 §11)
- Every endpoint authN/authZ verified; no excessive data exposure; rate limits in place; no
  secrets in responses; tokens revocable.

## Tests
- Contract tests for resource shapes + pagination; BOLA negative tests; throttle tests;
  OpenAPI builds without errors.

## Definition of Done
- [ ] `/api/v1` is consistent, throttled, documented (OpenAPI + Postman); security tests green.
