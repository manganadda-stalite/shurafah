# Phase 14 — Admin Content CRUD (Music + Users + Comments)

**Goal:** Admins manage songs, artists, categories, playlists, users, and moderate
comments/reports — writing into the tables the public app already reads.

## Scope
**In:** CRUD + publish/upload for Songs, Artists, Categories, (curated) Playlists; User management
(suspend/ban); Comments & Reports moderation. Binds the corresponding `adminviews` pages.
**Out:** Wa'azi admin (Phase 15), featured/trending curation (Phase 16), monetisation (17–19).

## Prerequisites
- Phase 13 (RBAC), Phases 5–8 + 10 (the models being managed).

## Tasks
- [ ] `Admin\SongController` (CRUD, audio+cover upload via medialibrary, publish/unpublish) →
  `shurafah_song_management.html` (+ remove the stray front duplicate).
- [ ] `Admin\ArtistController` (CRUD, verify) → `shurafah_admin_artist_management.html`
  (+ delete the ` - Copy.html` backup) and `shurafah_dashboard_artists.html`.
- [ ] `Admin\CategoryController` (CRUD, reorder, toggle) → `shurafah_admin_categories.html`.
- [ ] `Admin\PlaylistController` (curated playlists) → `shurafah_admin_playlist_management.html`.
- [ ] `Admin\UserController` (list/detail/status) → `shurafah_admin_user_management.html`.
- [ ] `Admin\CommentController` (hide/restore/delete, resolve/dismiss reports) →
  `shurafah_admin_comments_reports.html`.
- [ ] Each guarded by its permission (`songs.manage`, `artists.manage`, …) + activity log.

## Packages
- `spatie/laravel-medialibrary`, `getid3`/`php-ffmpeg` (duration/transcode jobs).

## Security (DoD)
- Permission‑gated; upload validation (MIME/size) + queued processing; mass‑assignment safe;
  destructive actions confirmed + logged; admins can't escalate own roles.

## Tests
- CRUD happy paths; permission denied without role (403); upload validation; publish toggles
  public visibility; user suspend blocks login.

## Definition of Done
- [ ] All listed admin pages perform real CRUD; public app reflects changes; tests green.
