# Module: Preachers

**Purpose:** Preacher profiles (Wa'azi equivalent of Artists), their lectures, following.

## Static views owned
- `frontviews/shurafah_preacher_profile.html`, `frontviews/all_top_preachers.html`
- Admin: `adminviews/shurafah_admin_preacher_management.html`

## Data / tables
- `preachers` (name, slug, bio, avatar, cover, is_verified, followers_count, waazi_count, status).
- `follows` (polymorphic) reused.

## Web routes / API
- `GET /preachers/{preacher:slug}`, `GET /preachers/top`, follow/unfollow.
- `GET /api/v1/preachers`, `GET /api/v1/preachers/{id}`, `GET /api/v1/preachers/{id}/waazi`,
  `POST /api/v1/preachers/{id}/follow`.

## Services
- `PreacherService` (mirrors `ArtistService`).

## Security
- Public read (active); follow requires auth; admin CRUD `preachers.manage`.

## Phase
- **Phase 12**; admin CRUD **Phase 15**.

## Future enhancements
- Verification, preacher bios with references, scheduled live lectures.
