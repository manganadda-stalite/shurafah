# Phase 16 — Featured & Trending

**Goal:** Admins curate Featured items and the system computes Trending; both rails reflect this
across songs and lectures.

## Scope
**In:** `shurafah_admin_featured_trending.html`; manual featured flags/ordering (optional scheduled
`featured_items`); scheduled trending scoring job; public rails read curated/computed data.
**Out:** Personalised recommendations (future).

## Prerequisites
- Phases 14 & 15 (content exists and is managed), Phase 9 (plays/downloads feed trending).

## Tasks
- [ ] `FeaturedService` (set/unset featured, ordering, optional scheduling window).
- [ ] `TrendingService` + scheduled job (rolling‑window score from plays/downloads).
- [ ] Bind admin featured/trending page; expose via existing Songs/Waazi list filters
  (`filter[featured]`, `filter[trending]`).

## Security (DoD)
- Curation requires `featured.manage` + activity log.

## Tests
- Featuring an item surfaces it on the public rail; trending job ranks by score; permission gate.

## Definition of Done
- [ ] Featured curation + trending computation live; rails reflect them; tests green.
