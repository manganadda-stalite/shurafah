# Module: Downloads & Analytics

**Purpose:** Gated downloads of audio + the download analytics dashboard.

## Static views owned
- Download buttons/modals in `song_detail_page.html`, `shurafah_waazi_detail.html`
  (the interstitial ad before download is driven by `ads.js`).
- Admin: `adminviews/shurafah_download_analytics.html`

## Data / tables
- `downloads` (polymorphic downloadable, user_id?, ip_hash, country, device, source).
- Roll‑ups: `download_daily_stats` (date, type, item_id, count) via scheduled job.

## Web routes / API
- `POST /api/v1/{song|waazi}/{id}/download` → returns a **signed, expiring** URL if allowed.
- Admin: `GET /admin/analytics/downloads` (charts, top items, by period, export CSV).

## Services
- `DownloadService` (authorise → record event → issue signed URL; enforce free‑user daily cap;
  premium unlimited), `AnalyticsService` (aggregations, cached).

## Security
- Download gating: signed URLs, free‑user daily caps (mirror `ads.js frequencyCaps`), premium‑only
  items blocked for free users. IPs hashed (PII). Analytics view requires `analytics.view`.

## Packages
- `maatwebsite/excel` (export, optional).

## Phase
- Downloads gating **Phase 9**; analytics dashboard **Phase 19**.

## Future enhancements
- Offline downloads for mobile (encrypted), per‑country/device breakdowns, revenue analytics.
