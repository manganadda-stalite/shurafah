# Phase 6 — Artists

**Goal:** Artist profiles, songs‑by‑artist, top‑artists list, and follow/unfollow — web + API.

## Scope
**In:** `artists` model; `artist_profile_page.html`, `all_top_artists.html`,
`all_songs_by_artist.html`; follow/unfollow; artist API.
**Out:** Admin artist CRUD (Phase 14), artist self‑service.

## Prerequisites
- Phase 5.

## Tasks
- [ ] `artists` migration/model/factory; `follows` polymorphic table + `Follow` behaviour.
- [ ] Bind artist profile + top‑artists + songs‑by‑artist views.
- [ ] `ArtistService` (profile, songs, follow/unfollow with counter cache).
- [ ] `Api\ArtistController` + `ArtistResource`; `POST/DELETE /artists/{id}/follow`.

## Security (DoD)
- Public read (active artists); follow requires auth; one follow per user/artist (unique).

## Tests
- Artist page + songs render; follow/unfollow toggles + counter; auth required to follow.

## Definition of Done
- [ ] Artist pages live with real data; follow works web + API; tests green.
