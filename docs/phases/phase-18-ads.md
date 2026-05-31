# Phase 18 — Ads Management

**Goal:** Make AdSense placements server‑configurable (admin) and feed `ads.js` via an API —
without changing the front‑end look. Premium users get no ads.

## Scope
**In:** `ad_units`, `ad_placements` (+ optional `ad_events`); `shurafah_ads_management.html`;
`GET /api/v1/ads/config`; inject config into pages so `ads.js` reads it.
**Out:** Non‑AdSense networks, A/B testing (future).

## Prerequisites
- Phase 13 (admin), Phase 17 (premium → `userType`).

## Tasks
- [ ] Migrations/models for ad units + placements (mirror `ADS_CONFIG`).
- [ ] `AdsService::configFor($user)` returns the exact JSON shape `ads.js` expects, with
  `userType` from the user (premium → ads off).
- [ ] `GET /api/v1/ads/config`; set `window.SHURAFAH_ADS = @json($config)` in the layout; `ads.js`
  reads it with built‑in fallback (rendering code unchanged).
- [ ] Admin CRUD for units/placements + enable/disable + frequency caps.

## Security (DoD)
- Premium users never receive ads; admin CRUD `ads.manage`; AdSense + Google domains allow‑listed
  in CSP (architecture/06–07).

## Tests
- Config endpoint shape matches `ads.js` expectations; premium user → ads disabled; toggling a
  placement reflects in config.

## Definition of Done
- [ ] Ads server‑controlled, premium ad‑free, `ads.js` visually unchanged; tests green.
