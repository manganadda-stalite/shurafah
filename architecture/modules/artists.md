# Module: Artists

**Purpose:** Artist profiles, their songs, following, top‑artists listings.

## Static views owned
- `frontviews/artist_profile_page.html`, `frontviews/all_top_artists.html`
- Admin: `adminviews/shurafah_admin_artist_management.html`
  (note duplicate `… - Copy.html` — ignore the copy; see inventory) and
  `adminviews/shurafah_dashboard_artists.html`.

## Data / tables
- `artists` (name, slug, bio, avatar, cover, is_verified, followers_count, songs_count, status).
- `follows` (polymorphic) for user→artist following.

## Web routes
- `GET /artists/{artist:slug}`, `GET /artists/top`, admin `…/admin/artists` CRUD.

## API endpoints
- `GET /api/v1/artists`, `GET /api/v1/artists/{id}`, `GET /api/v1/artists/{id}/songs`,
  `POST /api/v1/artists/{id}/follow`, `DELETE …/follow`.

## Services
- `ArtistService` (CRUD, verify, follow/unfollow with counter cache).

## Security
- Public read (active artists). Follow requires auth. Admin CRUD requires `artists.manage`.

## Packages
- `intervention/image`, `spatie/laravel-medialibrary`.

## Phase
- **Phase 6**; admin CRUD **Phase 14**.

## Future enhancements
- Artist verification workflow, artist self‑service portal, analytics for artists.
