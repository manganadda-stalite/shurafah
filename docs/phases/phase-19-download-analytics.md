# Phase 19 — Download Analytics

**Goal:** Admins see download/play analytics (totals, trends, top items, by period) backed by
fast daily roll‑ups.

## Scope
**In:** `download_daily_stats`/`play_daily_stats` roll‑up job; `shurafah_download_analytics.html`
charts; CSV export.
**Out:** Revenue analytics (future), per‑country drill‑downs (future).

## Prerequisites
- Phase 9 (download/play events), Phase 13 (admin).

## Tasks
- [ ] Scheduled job aggregates `downloads`/`plays` into daily stat tables.
- [ ] `AnalyticsService` (cached queries: totals, time series, top N).
- [ ] Bind analytics dashboard charts; date‑range filter; CSV export (`maatwebsite/excel`).

## Security (DoD)
- Requires `analytics.view`; IPs already hashed; export rate‑limited.

## Tests
- Roll‑up correctness; dashboard numbers match seeded events; export works; permission gate.

## Definition of Done
- [ ] Analytics dashboard live with real roll‑ups; tests green.
