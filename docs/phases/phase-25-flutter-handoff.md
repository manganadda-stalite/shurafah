# Phase 25 — Flutter Handoff

**Goal:** Enable the mobile team to start the Flutter app immediately against a stable backend.

## Scope
**In:** Deliver OpenAPI/Postman, auth guide (Sanctum), push setup (FCM), `app/config` contract,
media/streaming guide, and a thin reference integration.
**Out:** Building the Flutter app itself (separate project/track).

## Prerequisites
- Phase 23 (documented API), Phase 24 (prod/staging available).

## Tasks
- [ ] Publish `openapi.json` + Postman collection + a short "Mobile Integration Guide"
  (auth flow, token storage, pagination, error handling, signed media, push registration).
- [ ] Document `GET /api/v1/app/config` (min supported version, maintenance, feature flags) and
  how the app should react.
- [ ] Provide test accounts (free + premium) and staging base URL + test payment keys.
- [ ] Optional: generate a typed Dart client from `openapi.json` as a starting point.

## Security (DoD)
- Mobile uses HTTPS + bearer tokens; tokens revocable; no secrets shipped in the app; least data.

## Definition of Done
- [ ] Mobile team has everything to begin: docs, client, accounts, URLs, push, and config contract.
```
```
After Phase 25, future enhancements (recommendations, video lectures, in‑app purchases, i18n,
house ads, etc.) are tracked per‑module under "Future enhancements" in
[`../../architecture/modules/`](../../architecture/modules/).
