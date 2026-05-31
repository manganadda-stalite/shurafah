# Module: Ads

**Purpose:** Server‑controlled configuration of Google AdSense units/placements consumed by the
existing `frontviews/ads.js` — **without changing the front‑end look**.

## Static views owned
- `frontviews/ads.js` (rendering engine — unchanged).
- Admin: `adminviews/shurafah_ads_management.html`

## Data / tables
- `ad_units` (key, name, type, size, adsense_slot, code, is_active).
- `ad_placements` (key e.g. `headerBanner`, `downloadModal`; ad_unit_id; enabled; target json;
  frequency json) — mirrors `ADS_CONFIG.placements`.
- `ad_events` (optional impression/click log; AdSense reporting is primary).

## Web/API endpoints
- `GET /api/v1/ads/config` → returns JSON in the **exact shape** `ads.js` already expects
  (`enabled`, `publisherId`, `placements`, `frequencyCaps`, `units`) + `userType` from the
  authenticated user. Admin CRUD under `/admin/ads`.

## Services
- `AdsService` (build config for current user; premium users → ads disabled).

## Security
- Premium users never receive ads (`showToPremium:false`). Admin CRUD requires `ads.manage`.
  AdSense domains allow‑listed in CSP (see security & asset docs).

## Phase
- **Phase 18**. (Until then `ads.js` uses its built‑in defaults — no visual change.)

## Future enhancements
- House ads / direct sponsorships, A/B testing placements, frequency capping per user server‑side,
  ad revenue analytics, non‑AdSense networks.
