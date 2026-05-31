# Phase 8 — Playlists & Favourites

**Goal:** Users can favourite (heart) songs and create/manage playlists — web + API.

## Scope
**In:** `favourites` (polymorphic), `playlists` + `playlist_song`; `favourites_page.html`,
`all_playlists.html`, `playlist_songs.html`; toggle heart everywhere; playlist CRUD + reorder.
**Out:** Curated/admin playlists management UI (Phase 14), collaborative playlists.

## Prerequisites
- Phase 5 (songs), Phase 4 (users).

## Tasks
- [ ] Migrations/models for favourites + playlists (ordered pivot).
- [ ] `FavouriteService::toggle()` (counter cache on `likes_count`), `PlaylistService` (CRUD,
  add/remove/reorder, visibility).
- [ ] Bind favourites + playlist pages; wire heart buttons (existing markup) to toggle.
- [ ] API: `/favourites/toggle`, `/favourites`; `/playlists` CRUD + `/songs` add/remove + reorder.
- [ ] Policies: user manages only own favourites/playlists.

## Security (DoD)
- Auth required; ownership enforced; unique favourite per user/item; public‑playlist read‑only to others.

## Tests
- Toggle favourite (idempotent); create/edit/delete playlist; add/remove/reorder; cannot modify
  another user's playlist (403).

## Definition of Done
- [ ] Favourites + playlists fully functional web + API; design intact; tests green.
