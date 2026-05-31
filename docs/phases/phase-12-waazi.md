# Phase 12 — Wa'azi Domain (Lectures, Preachers, Categories, Series)

**Goal:** Bring the entire Wa'azi (Islamic preaching) domain to life, parallel to music: lecture
catalog + detail + playback/downloads, preacher profiles + follow, wa'azi categories, and series.

**Why now:** It is a first‑class half of the product and reuses the music patterns.

## Scope
**In:** `waazi`, `preachers`, `waazi_categories`, `series`(+pivot); all `frontviews` Wa'azi pages;
playback/downloads/comments/favourites reuse (polymorphic); `/api/v1/waazi*`, `/preachers*`,
`/waazi-categories*`, `/series*`.
**Out:** Admin Wa'azi CRUD (Phase 15), video lectures (future).

## Prerequisites
- Phases 5–10 (reuses Songs/Artists/Categories/Playback/Comments/Favourites patterns).

## Tasks
- [ ] Migrations/models: `preachers`, `waazi_categories`, `waazi`, `series`, `series_waazi`.
- [ ] Services mirroring music (`WaaziService`, `PreacherService`, `WaaziCategoryService`,
  `SeriesService`) — share `Playable`/upload/streaming/download logic from Core.
- [ ] Bind: `shurafah_waazi.html`, `shurafah_waazi_detail.html`, all `all_waazi_*` and
  `all_*_lectures.html`, `shurafah_preacher_profile.html`, `all_top_preachers.html`,
  `all_waazi_categories/subcategories.html`, `all_waazi_series.html`.
- [ ] Extend Favourites/Comments/Downloads/Search to include Waazi (polymorphic — minimal work).
- [ ] API for all the above.

## Security (DoD)
- Same controls as Songs (published‑only, signed URLs, premium gating, throttling).

## Tests
- Wa'azi catalog/detail/series render; preacher follow; favourite/comment/download a lecture;
  search includes Waazi.

## Definition of Done
- [ ] Full Wa'azi domain live on web + API; design intact; tests green.
