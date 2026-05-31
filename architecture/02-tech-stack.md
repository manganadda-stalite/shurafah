# 02 — Technology Stack & Required Libraries

> Pin exact versions at bootstrap time. Versions below are the current stable line
> (verified May 2026). Always install with caret constraints (e.g. `^13.0`).

## Core

| Layer | Choice | Version | Notes |
|-------|--------|---------|-------|
| Framework | **Laravel** | `^13.0` | Latest stable (released 2026‑03‑17). **No starter kit** (Breeze/Jetstream ship Tailwind — we avoid it). Bare `laravel new`. |
| Language | **PHP** | `8.3`–`8.5` | Laravel 13 requires PHP ≥ 8.3. |
| Database | **MySQL** | `8.0+` | (MariaDB 10.6+ or PostgreSQL 14+ also supported.) |
| Cache / Queue / Session | **Redis** | `7+` | Cache, queues, rate‑limit buckets, sessions. |
| Object storage | **S3‑compatible** | — | Audio + images. AWS S3 / DigitalOcean Spaces / MinIO (local). |
| Web server | **Nginx + PHP‑FPM** | — | Or Laravel Octane (FrankenPHP) later for throughput. |
| Node (build only) | **Node 20+** | — | Only to run Vite for asset bundling/versioning. **No Tailwind.** |

## Why NO front‑end framework / NO Tailwind

The existing `frontviews/` and `adminviews/` HTML already contain complete, hand‑written
`<style>` blocks and vanilla JS. We keep them verbatim. Vite is used **only** to fingerprint
and serve the shared CSS/JS assets — not to compile a framework. See
[`06-frontend-asset-strategy.md`](06-frontend-asset-strategy.md).

## Composer packages (with reason and the module that needs them)

### Authentication & authorization
| Package | Reason | Used by |
|---------|--------|---------|
| `laravel/sanctum` | API token auth for the Flutter app; SPA/session for web. | API, Auth |
| `spatie/laravel-permission` | Roles & permissions (RBAC) for the **Admin Roles** module. | Admin, Roles |
| `laravel/fortify` *(optional)* | Headless auth backend (login, registration, password reset, 2FA) without any Tailwind UI. We keep our own Blade pages. | Auth |
| `pragmarx/google2fa-laravel` *(optional)* | TOTP 2FA for admin accounts. | Admin security |

### Payments / monetisation (Naira)
| Package | Reason | Used by |
|---------|--------|---------|
| `unicodeveloper/laravel-paystack` | Paystack integration (primary NG gateway). | Premium & Subscriptions |
| `laravel/cashier-paddle` *(alt)* or custom Flutterwave client | Alternative gateway / global cards. | Premium & Subscriptions |

> Subscriptions are modelled in our own tables (`subscription_plans`, `subscriptions`,
> `payments`) so we are gateway‑agnostic; the package is just the transport.

### Media (audio + images)
| Package | Reason | Used by |
|---------|--------|---------|
| `spatie/laravel-medialibrary` | Attach audio + cover art to models, conversions, S3. | Songs, Wa'azi, Artists, Preachers |
| `intervention/image` | Image resizing/optimisation for covers & avatars. | Media |
| `james-heinrich/getid3` *(or `php-ffmpeg/php-ffmpeg`)* | Read audio duration/metadata; optional transcoding/HLS. | Songs, Wa'azi |

### Admin / data
| Package | Reason | Used by |
|---------|--------|---------|
| `spatie/laravel-activitylog` | Audit trail for the **Activity Logs** module. | Activity Logs |
| `spatie/laravel-settings` | Typed, cached global **Settings**. | Settings |
| `laravel/scout` + Meilisearch/DB driver | Search across songs/artists/lectures/preachers. | Search, Explore |
| `maatwebsite/excel` *(optional)* | CSV/Excel export for analytics tables. | Download Analytics |
| `barryvdh/laravel-dompdf` *(optional)* | PDF invoices/receipts for subscriptions. | Premium |

### API & docs
| Package | Reason | Used by |
|---------|--------|---------|
| `dedoc/scramble` *(or `darkaonline/l5-swagger`)* | Auto‑generate OpenAPI docs from API controllers for the Flutter team. | API |
| `spatie/laravel-query-builder` | Safe filtering/sorting/includes on API list endpoints. | API |
| `laravel/sanctum` | (token auth — listed above). | API |

### Notifications / realtime
| Package | Reason | Used by |
|---------|--------|---------|
| `laravel/reverb` *(or Pusher)* | WebSockets for live admin/user notifications (optional). | Notifications |
| `laravel-notification-channels/fcm` | Push notifications to the Flutter app. | Notifications |
| SMS provider SDK (Termii/Twilio) | Phone OTP for registration/password reset. | Auth |

### Quality, security & ops (dev)
| Package | Reason |
|---------|--------|
| `larastan/larastan` (PHPStan) | Static analysis. |
| `laravel/pint` | Code style (PSR‑12). |
| `pestphp/pest` (or PHPUnit) | Testing. |
| `nunomaduro/collision` | Pretty CLI errors. |
| `barryvdh/laravel-debugbar` *(dev only)* | Local debugging. |
| `sentry/sentry-laravel` | Error tracking in staging/prod. |
| `spatie/laravel-backup` | Scheduled DB + storage backups. |
| `spatie/laravel-csp` *(optional)* | Content‑Security‑Policy headers (note AdSense allowlist). |
| `bepsvpt/secure-headers` | Security headers (HSTS, X‑Frame‑Options, etc.). |

## First‑party Laravel features we rely on (no extra package)

- **Eloquent ORM**, migrations, seeders, factories.
- **Queues** (Redis) for transcoding, emails, push, analytics roll‑ups.
- **Task scheduling** for trending recomputation, subscription expiry, backups.
- **Rate limiting** (`RateLimiter`) for login/OTP/API abuse protection.
- **Policies & Gates** for authorization.
- **Form Request** validation.
- **Eloquent API Resources** for consistent JSON shaping.
- **Signed/temporary URLs** for protected audio downloads.
- **Localization** (`lang/`) so additional languages can be added later.

## Environment matrix

| Environment | DB | Storage | Queue | Notes |
|-------------|----|---------|-------|-------|
| Local | MySQL (Docker) | MinIO or `local` disk | `sync`/Redis | `.env.example` provided. |
| CI | SQLite or MySQL service | fake/`local` | `sync` | Fast, isolated. |
| Staging | MySQL | S3 bucket (staging) | Redis | Mirrors prod, test gateways (Paystack test keys). |
| Production | MySQL (managed) | S3 + CDN | Redis | Live keys, backups, monitoring. |
