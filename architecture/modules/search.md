# Module: Search

**Purpose:** Global search and the **Explore** page across songs, artists, lectures, preachers,
categories.

## Static views owned
- `frontviews/shurafah_explore.html`
- (the search bar partial used across front pages).

## Data
- Reads from Songs, Artists, Waazi, Preachers, Categories. No own tables (optionally a
  `search_queries` log for trending searches).

## Web routes / API
- `GET /explore` (web), `GET /api/v1/search?q=&type=` (type ∈ all|songs|artists|waazi|preachers),
  `GET /api/v1/explore` (curated discovery feed: trending, featured, top, recently added).

## Services
- `SearchService` (delegates to `laravel/scout`; multi‑model search; relevance + popularity boost).

## Security
- Public; rate‑limited; results respect content visibility (no drafts, premium flags honoured).

## Packages
- `laravel/scout` + Meilisearch (recommended) or DB/FULLTEXT driver for MVP.

## Phase
- **Phase 11** (after core catalog exists). MVP can start with DB `LIKE`/FULLTEXT then upgrade.

## Future enhancements
- Typeahead suggestions, search history, voice search (mobile), synonyms/Arabic transliteration.
