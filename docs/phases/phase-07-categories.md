# Phase 7 — Categories (Songs)

**Goal:** Browse songs by category and sub‑category — web + API.

## Scope
**In:** `categories` (self‑join), `all_categories.html`, `all_subcategories.html`,
`category_songs.html`, `subcategory_songs.html`; category API.
**Out:** Admin category CRUD (Phase 14).

## Prerequisites
- Phase 5.

## Tasks
- [ ] `categories` migration/model/factory (parent_id, icon, color, sort_order, is_active).
- [ ] Bind the four category pages; songs filtered by category/sub‑category.
- [ ] `CategoryService`; `Api\CategoryController` + `CategoryResource`.

## Security (DoD)
- Public read (active categories only); throttled.

## Tests
- Category list + songs render; API returns categories and filtered songs; inactive hidden.

## Definition of Done
- [ ] Category browsing live, design intact, tests green.
