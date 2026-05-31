# Module: Categories (Songs)

**Purpose:** Two‑level song taxonomy (category → sub‑category) used for browsing.

## Static views owned
- `frontviews/all_categories.html`, `frontviews/all_subcategories.html`,
  `frontviews/category_songs.html`, `frontviews/subcategory_songs.html`
- Admin: `adminviews/shurafah_admin_categories.html`

## Data / tables
- `categories` (self‑referencing `parent_id`, icon, color, sort_order, is_active).

## Web routes / API
- `GET /categories`, `GET /categories/{category}` (+ subcategories), `GET /categories/{c}/songs`.
- `GET /api/v1/categories`, `GET /api/v1/categories/{id}`, `GET /api/v1/categories/{id}/songs`.
- Admin CRUD under `/admin/categories`.

## Services
- `CategoryService` (CRUD, reorder, toggle active).

## Security
- Public read (active). Admin CRUD requires `categories.manage` + activity log.

## Phase
- **Phase 7**; admin CRUD **Phase 14**.

## Future enhancements
- Drag‑drop reorder UI, category artwork, featured categories on home.
