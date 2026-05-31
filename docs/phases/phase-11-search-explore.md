# Phase 11 — Search & Explore

**Goal:** Global search across songs/artists (and Wa'azi after Phase 12) plus the Explore
discovery feed.

## Scope
**In:** `shurafah_explore.html` bound to a discovery feed; search bar wired; `/search` + `/explore`
API. MVP uses DB FULLTEXT/`LIKE`, upgradeable to Meilisearch.
**Out:** Personalised recommendations, typeahead (enhancement).

## Prerequisites
- Phases 5–7 (content to search). Extend to Waazi/Preachers after Phase 12.

## Tasks
- [ ] `SearchService` (multi‑model); optionally `laravel/scout` + Meilisearch.
- [ ] Bind Explore feed (trending/featured/top/recent rails).
- [ ] API: `GET /search?q=&type=`, `GET /explore`.
- [ ] Wire the existing search bar across pages to the search route.

## Security (DoD)
- Public; throttled; results respect visibility (no drafts; premium honoured).

## Tests
- Search returns expected matches per type; explore feed populated; throttling.

## Definition of Done
- [ ] Search + Explore live; design intact; tests green.
