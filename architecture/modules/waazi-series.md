# Module: Waazi Series

**Purpose:** Ordered collections of lectures (the Wa'azi equivalent of playlists, but
admin‑curated and authored by a preacher).

## Static views owned
- `frontviews/all_waazi_series.html`
- Admin: `adminviews/shurafah_admin_waazi_series.html`

## Data / tables
- `series` (title, slug, preacher_id?, cover, description, items_count, is_active),
  `series_waazi` (ordered pivot: series_id, waazi_id, position, unique).

## Web routes / API
- `GET /series`, `GET /series/{series:slug}` (lists lectures in order); admin CRUD + reorder.
- `GET /api/v1/series`, `GET /api/v1/series/{id}` (with ordered `waazi`).

## Services
- `SeriesService` (CRUD, add/remove/reorder items, counter cache).

## Security
- Public read (active); admin CRUD `series.manage`.

## Phase
- **Phase 12/15**.

## Future enhancements
- Auto‑play next in series, progress tracking ("continue series"), certificates of completion.
