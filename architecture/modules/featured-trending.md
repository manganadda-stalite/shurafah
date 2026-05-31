# Module: Featured & Trending

**Purpose:** Curate what appears in the "Featured" and "Trending" rails on home/Wa'azi pages —
both manual curation and automatic computation.

## Static views owned
- Rails inside `song_portal_web.html` / `shurafah_waazi.html`; "see all" lists
  (`all_featured_songs.html`, `all_trending_songs.html`, `all_featured_lectures.html`, etc.).
- Admin: `adminviews/shurafah_admin_featured_trending.html`

## Data / tables
- Flags on `songs`/`waazi` (`is_featured`, `is_trending`) for manual override.
- Optional `featured_items` (polymorphic, position, starts_at/ends_at) for scheduled curation.
- Trending score computed from `plays`/`downloads` over a rolling window (scheduled job).

## Web routes / API
- Public lists exposed via Songs/Waazi endpoints (`filter[featured]`, `filter[trending]`).
- Admin: `GET/POST /admin/featured` (set featured, order, schedule).

## Services
- `FeaturedService` (manual curation + ordering), `TrendingService` (scheduled scoring job).

## Security
- Admin curation requires `featured.manage` + activity log.

## Phase
- **Phase 16** (after content modules exist). Manual flags can land earlier with the content CRUD.

## Future enhancements
- Personalised recommendations, editorial "collections", regional trending (by State/Zone).
