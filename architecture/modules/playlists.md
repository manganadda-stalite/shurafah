# Module: Playlists

**Purpose:** User‑created and admin‑curated ordered collections of songs.

## Static views owned
- `frontviews/all_playlists.html`, `frontviews/playlist_songs.html`
- Admin: `adminviews/shurafah_admin_playlist_management.html`

## Data / tables
- `playlists` (user_id nullable for curated, title, slug, cover, is_public, is_curated,
  songs_count), `playlist_song` (ordered pivot, position).

## Web routes / API
- `GET /playlists`, `GET /playlists/{playlist}`, user CRUD (`POST/PUT/DELETE /playlists`),
  add/remove/reorder songs.
- `GET /api/v1/playlists`, `GET /api/v1/playlists/{id}`, `POST /api/v1/playlists`,
  `POST /api/v1/playlists/{id}/songs`, `DELETE …/songs/{songId}`, `PUT …/reorder`.

## Services
- `PlaylistService` (CRUD, add/remove/reorder, visibility, counter cache).

## Security
- A user manages only **their own** playlists (Policy). Public playlists are read‑only to others.
  Curated playlists admin‑only (`playlists.manage`).

## Phase
- **Phase 8** (with Favourites).

## Future enhancements
- Collaborative playlists, playlist sharing links, smart/auto playlists, follow playlists.
