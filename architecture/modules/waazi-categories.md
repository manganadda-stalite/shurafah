# Module: Waazi Categories

**Purpose:** Two‑level taxonomy for Wa'azi lectures (separate from song categories).

## Static views owned
- `frontviews/all_waazi_categories.html`, `frontviews/all_waazi_subcategories.html`
- Admin: `adminviews/shurafah_admin_waazi_categories.html`

## Data / tables
- `waazi_categories` (self‑referencing `parent_id`, icon, color, sort_order, is_active) —
  mirrors `categories`.

## Web routes / API
- `GET /waazi-categories`, `GET /waazi-categories/{c}` (+subcategories),
  `GET /waazi-categories/{c}/waazi`; admin CRUD.
- `GET /api/v1/waazi-categories`, `…/{id}`, `…/{id}/waazi`.

## Services
- `WaaziCategoryService` (mirrors `CategoryService`).

## Security
- Public read (active); admin CRUD `waazi-categories.manage`.

## Phase
- **Phase 12**; admin CRUD **Phase 15**.

## Future enhancements
- Shared taxonomy engine with Songs categories if the two ever converge.
