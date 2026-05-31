# 08 — API Architecture (Flutter‑ready)

The Flutter mobile app consumes a **versioned JSON REST API** that reuses the same domain
services as the web app. This document defines the cross‑cutting API conventions; the full
endpoint catalogue is in [`../docs/api/`](../docs/api/).

## Base & versioning

- Base URL: `https://api.shurafah.app/api/v1` (and `/api/v1` on the main app in early phases).
- **URI versioning** (`/v1`). Breaking changes → `/v2`; old version deprecated with notice.
- Content type: `application/json`; UTF‑8; dates **ISO‑8601 UTC**.

## Authentication

- **Laravel Sanctum** personal access tokens.
- `POST /api/v1/auth/register` → creates user, sends OTP.
- `POST /api/v1/auth/verify-otp` → verifies phone.
- `POST /api/v1/auth/login` → `{ phone, password, device_name }` ⇒ `{ token, user }`.
- `POST /api/v1/auth/logout` → revokes current token.
- `POST /api/v1/auth/forgot-password` / `reset-password` via OTP.
- Authenticated requests send `Authorization: Bearer <token>`.
- Guests may call clearly‑marked public read endpoints (catalog browsing) without a token.

## Standard response envelope

Success (single):
```json
{ "data": { "id": 1, "title": "Open Heaven", "...": "..." } }
```
Success (collection, paginated):
```json
{
  "data": [ { "id": 1, "title": "…" } ],
  "links": { "first": "…", "next": "…", "prev": null, "last": "…" },
  "meta":  { "current_page": 1, "per_page": 20, "total": 134 }
}
```
Error:
```json
{
  "message": "The given data was invalid.",
  "errors": { "phone": ["The phone field is required."] }
}
```
- Built with **Eloquent API Resources** + Laravel's paginator (consistent `links`/`meta`).
- HTTP status codes used correctly: 200/201/204, 401, 403, 404, 409, 422, 429, 5xx.

## Filtering, sorting, pagination, includes

Use `spatie/laravel-query-builder` with **explicit allow‑lists**:
```
GET /api/v1/songs?filter[category]=naat&filter[artist]=5&sort=-plays_count&include=artist&page=2&per_page=20
```
- `filter[...]` — only whitelisted filters.
- `sort` — only whitelisted columns; `-` prefix = desc.
- `include` — only whitelisted relations (prevents over‑fetching/N+1).
- Default & max `per_page` enforced.

## Resource shapes (examples)

`SongResource`:
```json
{
  "id": 12, "title": "Open Heaven", "slug": "open-heaven",
  "artist": { "id": 5, "name": "Nathaniel Bassey", "avatar_url": "…" },
  "category": { "id": 3, "name": "Worship" },
  "duration": 295, "duration_label": "4:55",
  "cover_url": "https://cdn/…", "stream_url": "https://cdn/…?signature=…",
  "plays_count": 9200, "downloads_count": 2100, "likes_count": 540,
  "is_favourited": true, "is_premium_only": false,
  "published_at": "2026-01-10T09:00:00Z"
}
```
- `stream_url`/`download_url` are **signed, expiring** URLs; `download_url` only present when the
  user is allowed to download (premium / within free cap).
- `is_favourited` is contextual to the authenticated user (null for guests).

## Endpoint groups (catalogued in /docs/api)

| Group | Examples |
|-------|----------|
| Auth | register, verify‑otp, login, logout, forgot/reset password, me |
| Profile | get/update profile, avatar, geography lookups |
| Geography | zones, states?zone=, lgas?state= |
| Songs | list, show, play, related, lyrics, by‑artist, by‑category |
| Artists | list, show, songs, follow/unfollow |
| Categories | list, show, songs |
| Playlists | CRUD, add/remove song, reorder |
| Favourites | list, toggle |
| Wa'azi | list, show, play, by‑preacher, by‑category, series |
| Preachers | list, show, follow |
| Comments | list (per item), create, delete (own), report |
| Downloads | request download (gated), record |
| Home/Explore | home feed, trending, featured, recently‑added, search |
| Subscriptions | plans, subscribe (init payment), verify, my‑subscription, cancel |
| Ads | config (for `ads.js`) |
| Notifications | list, mark‑read, register FCM token |

## Errors, idempotency & webhooks

- Validation errors → 422 with `errors` map (Laravel default).
- Payment init returns a gateway authorization URL/ref; **server verifies** via webhook +
  explicit verify call before activating premium (idempotent on `reference`).
- Webhooks (`/api/webhooks/paystack`, `/flutterwave`) verify signatures, are idempotent, and are
  excluded from CSRF/auth (signature‑authenticated).

## Documentation & client generation

- **`dedoc/scramble`** auto‑generates an **OpenAPI 3** spec from typed controllers/resources at
  `/docs/api` (served) and as a downloadable `openapi.json`.
- The Flutter team can generate a typed client from `openapi.json` (e.g. `openapi-generator`,
  `chopper`, `retrofit`).
- Postman collection exported per release.

## Mobile‑specific concerns

- **Pagination everywhere** (infinite scroll friendly).
- **Offline/download** support: signed URLs + content keys; premium‑gated.
- **Push**: `POST /api/v1/devices` registers an FCM token; notifications delivered via
  `laravel-notification-channels/fcm`.
- **Feature flags / min‑version**: `GET /api/v1/app/config` returns min supported app version,
  ads config, feature toggles, maintenance flag.
