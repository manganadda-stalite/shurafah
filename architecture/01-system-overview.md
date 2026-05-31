# 01 — System Overview

## 1. What we are building

A single Laravel 13 backend that powers **three clients**:

1. **Public web app** (the `frontviews/` design) — server‑rendered Blade, mobile‑first.
2. **Admin panel** (the `adminviews/` design) — server‑rendered Blade, RBAC‑protected.
3. **Flutter mobile app** (future) — consumes a versioned JSON **REST API** (`/api/v1`).

All three share the **same domain layer** (models + services), so business rules are written
once and reused. The web controllers and the API controllers are thin adapters over the same
services.

## 2. Context diagram

```
                         ┌─────────────────────────────────────────┐
                         │              Shurafah Backend            │
                         │                (Laravel 13)              │
   End user (browser) ──▶│  Web (Blade)  ─┐                         │
                         │                 ├─▶  Domain Services ──┐ │
   Admin (browser)    ──▶│  Admin (Blade) ─┤      (Modules)       │ │
                         │                 │                      ▼ │
   Flutter app (future)─▶│  REST API v1  ─┘                  ┌────────┐
                         │                                    │  MySQL │
                         │  Queue workers ◀── Redis ──┐       └────────┘
                         └────────────────────────────┼───────────────┘
                                                       ▼
                          External: Paystack/Flutterwave (payments),
                          Google AdSense (ads), S3‑compatible storage
                          (audio + images), SMS/OTP provider, FCM (push).
```

## 3. Layered architecture (inside the backend)

```
HTTP layer        Controllers (Web)   Controllers (Admin)   Controllers (Api\V1)
                        │                    │                      │
Request validation  FormRequests        FormRequests           FormRequests
                        └────────────────────┴──────────────────────┘
                                             │
Application layer                    Module Services            (use‑case classes)
                                             │
Domain layer                 Eloquent Models · Policies · Events · DTOs
                                             │
Infrastructure         Repositories (where useful) · Storage · Queues · Gateways
                                             │
                                          MySQL · Redis · S3
```

- **Controllers are thin.** They validate input (FormRequest), call a service, and return a
  response (Blade view, redirect, or `JsonResource`).
- **Services hold business logic.** e.g. `SongService::publish()`, `SubscriptionService::activate()`.
- **API and Web reuse the same services** — no duplicated logic.
- **Authorization** lives in **Policies** + middleware, never inline in controllers.

## 4. Content domains

| Domain | "Author" | "Item" | Taxonomy | Collection |
|--------|----------|--------|----------|------------|
| Music | Artist | Song | Category / Sub‑category | Playlist |
| Wa'azi | Preacher | Lecture (Wa'azi) | Wa'azi Category / Sub‑category | Series |

The two domains are intentionally **parallel**, so most modules (catalog browsing, detail
pages, favourites, comments, downloads, featured/trending) are implemented once with a
polymorphic/shared pattern and reused for both Songs and Wa'azi.

## 5. Key cross‑cutting capabilities

- **Auth** — phone + password for end users (Sanctum tokens for mobile); email + password for
  admins on a separate guard.
- **Monetisation** — Google AdSense for `guest`/`free`; Premium subscriptions (Naira, via
  Paystack/Flutterwave) remove ads and unlock perks.
- **Analytics** — plays & downloads tracked for reporting (Download Analytics admin module).
- **Governance** — Comments & Reports moderation, Activity Logs, Admin Roles (RBAC),
  Notifications, global Settings.

## 6. Non‑functional targets

| Concern | Target |
|---------|--------|
| Availability | 99.9% (stateless app servers behind a load balancer) |
| Audio delivery | Streamed via signed/temporary URLs from object storage + CDN |
| Scalability | Horizontal app scaling; Redis cache + queues; read‑heavy endpoints cached |
| Security | See [`07-security-architecture.md`](07-security-architecture.md) |
| Observability | Structured logs, error tracking (Sentry), health checks, audit trail |
| i18n‑ready | English first; copy externalised so additional languages can be added later |
