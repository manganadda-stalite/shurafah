# Module: Waazi (Lectures)

**Purpose:** Islamic preaching/lecture catalog — the Wa'azi equivalent of Songs. Listing,
detail, playback, by‑preacher/category, series membership.

## Static views owned
- `frontviews/shurafah_waazi.html` (Wa'azi home), `frontviews/shurafah_waazi_detail.html`
- `frontviews/all_waazi_lectures.html`, `all_top_lectures.html`, `all_trending_lectures.html`,
  `all_featured_lectures.html`, `all_recent_lectures.html`
- Admin: `adminviews/shurafah_admin_waazi_management.html`

## Data / tables
- `waazi` (preacher_id, waazi_category_id, waazi_subcategory_id, series_id?, audio_path,
  audio_duration, counts, flags, status, published_at) — mirrors `songs`.

## Web routes / API
- `GET /waazi`, `GET /waazi/{waazi:slug}`, `GET /waazi/trending|top|featured|recent`,
  `GET /preachers/{p}/waazi`, `GET /waazi-categories/{c}/waazi`.
- `GET /api/v1/waazi`, `GET /api/v1/waazi/{id}`, `GET /api/v1/waazi/{id}/related`,
  `POST /api/v1/waazi/{id}/play`.

## Services
- `WaaziService` (mirrors `SongService`), shares `Playable`/upload logic with Songs via Core.

## Security
- Same as Songs: published‑only public, signed streaming URLs, premium gating, admin
  `waazi.manage` CRUD + activity log.

## Packages
- `spatie/laravel-medialibrary`, `getid3`/`php-ffmpeg`.

## Phase
- **Phase 12**; admin CRUD **Phase 15**.

## Future enhancements
- Video lectures, transcripts/subtitles, chapter markers, downloadable PDFs of lectures.
