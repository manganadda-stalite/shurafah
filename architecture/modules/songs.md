# Module: Songs

**Purpose:** The music catalog — listing, detail, playback, lyrics, related songs, play
tracking. Core of the front home page.

## Static views owned
- `frontviews/song_portal_web.html` (home feed — song rows/cards, mini‑player)
- `frontviews/song_detail_page.html` (player, lyrics, comments, related, share, download)
- `frontviews/category_songs.html`, `subcategory_songs.html`
- `frontviews/all_top_songs.html`, `all_trending_songs.html`, `all_featured_songs.html`,
  `all_recently_added.html`, `all_related_songs.html`, `all_songs_by_artist.html`
- Admin: `adminviews/shurafah_song_management.html`, `frontviews/shurafah_song_management.html`

## Data / tables
- `songs` (see schema doc). Relations: `artist`, `category`, `subcategory`, `comments`,
  `favourites`, `downloads`, `plays`.

## Web routes
| Route | Page |
|-------|------|
| `GET /` | home feed |
| `GET /songs/{song:slug}` | detail |
| `GET /songs/trending` `/top` `/featured` `/recent` | "see all" lists |
| `GET /categories/{category}/songs` | by category |
| `GET /artists/{artist}/songs` | by artist |
| Admin `GET/POST/PUT/DELETE /admin/songs…` | CRUD + publish |

## API endpoints (`/api/v1`)
- `GET /songs`, `GET /songs/{id}`, `GET /songs/{id}/related`, `GET /songs/{id}/lyrics`,
  `POST /songs/{id}/play` (analytics), filters by category/artist/trending/featured.

## Services
- `SongService` (publish/unpublish, incrementPlays, related, trending eligibility),
  `SongUploadService` (audio + cover via medialibrary, read duration).

## Security
- Public read of **published** songs only; drafts admin‑only. Streaming via **signed URLs**.
  `is_premium_only` songs gated by subscription. Admin CRUD requires `songs.manage` + activity log.
  Upload validation (MIME/size), queued transcode.

## Packages
- `spatie/laravel-medialibrary`, `getid3`/`php-ffmpeg`, `spatie/laravel-query-builder`.

## Phase
- **Phase 5** (read‑only catalog + detail + home), admin CRUD **Phase 14**, playback/analytics
  alongside Downloads **Phase 9**.

## Future enhancements
- HLS adaptive streaming, waveform previews, lyrics time‑sync, audio quality tiers (premium).
