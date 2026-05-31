# Shurafah — Phased Roadmap

**Philosophy (per the product owner):** *small phases, basics first.* Every phase is a
self‑contained, shippable slice with its own PR, tests, and security checklist. We never do a
big‑bang build. If a phase feels large, split it further.

Legend: 🟢 must‑have for launch · 🟡 important · 🔵 enhancement.

| Phase | Name | Goal (one sentence) | Depends on | Detailed doc |
|------:|------|---------------------|-----------|--------------|
| 0 | Project Bootstrap 🟢 | Bare Laravel 13 app, tooling, CI, Docker, module system — no features yet. | — | [phase-00](phases/phase-00-bootstrap.md) |
| 1 | Layout & Blade Shell 🟢 | Serve the existing HTML through Blade layouts/partials with **zero visual change**; static pages reachable. | 0 | [phase-01](phases/phase-01-layout-blade.md) |
| 2 | Database Foundation 🟢 | Core migrations + geography seed (Zones/States/LGAs) + RBAC scaffold + factories. | 1 | [phase-02](phases/phase-02-database-foundation.md) |
| 3 | User Authentication 🟢 | Phone+password register/login/OTP/reset on web **and** API (Sanctum). | 2 | [phase-03](phases/phase-03-auth.md) |
| 4 | User Profile 🟢 | View/edit profile, avatar, geography; account type plumbing. | 3 | [phase-04](phases/phase-04-user-profile.md) |
| 5 | Songs Catalog (read) 🟢 | Home feed, song detail, category/artist/“see‑all” lists from the DB. | 2,4 | [phase-05](phases/phase-05-songs-catalog.md) |
| 6 | Artists 🟢 | Artist profiles, songs‑by‑artist, top artists, follow. | 5 | [phase-06](phases/phase-06-artists.md) |
| 7 | Categories 🟢 | Song categories/sub‑categories browsing. | 5 | [phase-07](phases/phase-07-categories.md) |
| 8 | Playlists & Favourites 🟢 | User playlists + heart/favourites (web+API). | 5 | [phase-08](phases/phase-08-playlists-favourites.md) |
| 9 | Playback & Downloads 🟢 | Real audio streaming (signed URLs), play tracking, gated downloads. | 5 | [phase-09](phases/phase-09-playback-downloads.md) |
| 10 | Comments & Reports 🟡 | Comment on songs/lectures + report flow. | 5,(12) | [phase-10](phases/phase-10-comments-reports.md) |
| 11 | Search & Explore 🟡 | Global search + Explore discovery feed. | 5,6,7 | [phase-11](phases/phase-11-search-explore.md) |
| 12 | Wa'azi Domain 🟢 | Lectures, preachers, wa'azi categories, series (parallels music). | 5,6,7 | [phase-12](phases/phase-12-waazi.md) |
| 13 | Admin Foundation & RBAC 🟢 | Admin guard login (+2FA), roles/permissions, dashboard skeleton, sidebar/topbar. | 3 | [phase-13](phases/phase-13-admin-foundation-rbac.md) |
| 14 | Admin Content CRUD 🟢 | Manage songs, artists, categories, playlists. | 13,5,6,7,8 | [phase-14](phases/phase-14-admin-content-crud.md) |
| 15 | Admin Wa'azi CRUD 🟢 | Manage lectures, preachers, wa'azi categories, series. | 13,12 | [phase-15](phases/phase-15-admin-waazi-crud.md) |
| 16 | Featured & Trending 🟡 | Curate featured + compute trending. | 14,15 | [phase-16](phases/phase-16-featured-trending.md) |
| 17 | Premium & Subscriptions 🟢 | Plans, Paystack/Flutterwave payments, premium gating. | 4,13 | [phase-17](phases/phase-17-premium-subscriptions.md) |
| 18 | Ads Management 🟡 | Server‑controlled AdSense config feeding `ads.js`. | 13,17 | [phase-18](phases/phase-18-ads.md) |
| 19 | Download Analytics 🟡 | Dashboards over download/play roll‑ups. | 9,13 | [phase-19](phases/phase-19-download-analytics.md) |
| 20 | Notifications 🟡 | In‑app + push (FCM) + admin broadcasts. | 13 | [phase-20](phases/phase-20-notifications.md) |
| 21 | Activity Logs 🟡 | Audit trail across admin actions. | 13 | [phase-21](phases/phase-21-activity-logs.md) |
| 22 | Settings 🟡 | Global configurable settings + public `app/config`. | 13 | [phase-22](phases/phase-22-settings.md) |
| 23 | API Hardening for Flutter 🟢 | Complete `/api/v1`, OpenAPI docs, versioning, throttles. | all feature phases | [phase-23](phases/phase-23-api-hardening.md) |
| 24 | Security, Performance & Deploy 🟢 | Audit, load test, caching, CDN, prod deploy + backups. | 23 | [phase-24](phases/phase-24-security-perf-deploy.md) |
| 25 | Flutter Handoff 🔵 | Hand the OpenAPI + auth + push to the mobile team; reference app config. | 23 | [phase-25](phases/phase-25-flutter-handoff.md) |

## Why this order

- **Basics first:** you can run, see a page, log in, and browse content before anything advanced.
- **Read before write:** content is shown (Phases 5–12) before admins manage it (13–16) — so the
  public app is demoable early and admin CRUD writes into already‑modelled tables.
- **Money after value:** subscriptions/ads come after there is content worth paying for.
- **API last‑but‑reused:** API routes are added *within each feature phase*; Phase 23 only
  hardens/documents them so the Flutter app can start immediately after.

## Suggested milestones

- **M1 — “It runs & looks right”**: Phases 0–2.
- **M2 — “Users can browse music”**: Phases 3–9 (a usable music web app).
- **M3 — “Full content + Wa'azi”**: Phases 10–12.
- **M4 — “Admin can run it”**: Phases 13–16.
- **M5 — “It makes money”**: Phases 17–19.
- **M6 — “Production + Mobile‑ready”**: Phases 20–25.
