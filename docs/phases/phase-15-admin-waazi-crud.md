# Phase 15 — Admin Wa'azi CRUD

**Goal:** Admins manage the full Wa'azi domain: lectures, preachers, wa'azi categories, and series.

## Scope
**In:** CRUD + upload/publish for Waazi; Preacher CRUD/verify; Waazi category CRUD; Series CRUD +
reorder. Binds the corresponding `adminviews` Wa'azi pages.
**Out:** Featured/trending (Phase 16).

## Prerequisites
- Phase 13 (RBAC), Phase 12 (Wa'azi models).

## Tasks
- [ ] `Admin\WaaziController` → `shurafah_admin_waazi_management.html` (CRUD, audio upload, publish).
- [ ] `Admin\PreacherController` → `shurafah_admin_preacher_management.html`.
- [ ] `Admin\WaaziCategoryController` → `shurafah_admin_waazi_categories.html`.
- [ ] `Admin\SeriesController` → `shurafah_admin_waazi_series.html` (add/remove/reorder lectures).
- [ ] Permissions (`waazi.manage`, `preachers.manage`, `waazi-categories.manage`,
  `series.manage`) + activity log.

## Security (DoD)
- Same as Phase 14 (permission‑gated, validated uploads, logged, mass‑assignment safe).

## Tests
- CRUD happy paths; permission denied (403); series reorder persists; publish toggles visibility.

## Definition of Done
- [ ] All Wa'azi admin pages perform real CRUD; public Wa'azi reflects changes; tests green.
