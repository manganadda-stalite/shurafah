# Phase 5 — Songs Catalog (read‑only)

**Goal:** Replace hard‑coded song data with real DB‑backed content on the home feed, song detail,
and all the song "see‑all" lists — read‑only (admins can't manage yet; seed demo data).

**Why now:** The core value of the app; everything else (favourites, comments, playback) hangs
off songs.

## Scope
**In:** `songs` model + relations; home feed rails; song detail; top/trending/featured/recent/
related/by‑category/by‑artist lists; `/api/v1/songs*` read endpoints; demo seed.
**Out:** Audio streaming + downloads (Phase 9), admin CRUD (Phase 14), comments (Phase 10).

## Prerequisites
- Phase 2 (schema), Phase 4 (so `is_favourited` context exists — can be stubbed false).

## Tasks
- [ ] `songs` migration (if not in Phase 2) + `Song` model, relations, enums, factory.
- [ ] Seed demo songs/artists/categories using the exact names from the static HTML.
- [ ] `SongService` (queries for feed sections, related, pagination), counter‑cache fields.
- [ ] Bind `song_portal_web.html` (rails), `song_detail_page.html`, and all `all_*_songs.html`,
  `category_songs.html`, `subcategory_songs.html`, `all_related_songs.html`,
  `all_songs_by_artist.html` to real data via `@foreach` (markup unchanged).
- [ ] `Api\SongController` + `SongResource` (list/show/related/lyrics).
- [ ] Helpers: duration formatting (`4:55`), number abbreviation (`9.2K`).

## Packages
- `spatie/laravel-query-builder` (filters/sort/includes).

## Security (DoD)
- Only `published` songs public; `is_premium_only` honoured in resource (no stream URL yet);
  list endpoints throttled; allow‑listed filters/sorts only.

## Tests
- Home/detail/list pages render real data (web); API list pagination + filters; drafts hidden;
  premium flag surfaced.

## Definition of Done
- [ ] All song pages show DB data; design identical.
- [ ] API read endpoints return the documented envelope; tests green.
