# 03 — Modular Structure (one folder per module)

The user requirement: **"the app to be in modules with each module having its own folder."**

We implement this with a `Modules/` directory at the project root, where **every business
capability is a self‑contained module** with its own routes, controllers, models, migrations,
services, policies, requests, resources, views and tests.

## How modules are wired

Two equally valid options — pick **one** at Phase 0 and keep it consistent:

- **Option A (recommended): `nwidart/laravel-modules`.** A mature package that autoloads each
  module's service provider, routes, migrations and views. `php artisan module:make Songs`.
- **Option B: hand‑rolled.** A `Modules/` PSR‑4 namespace in `composer.json` plus one
  `ModuleServiceProvider` per module that loads routes/migrations/views. No third‑party dep.

Either way the **on‑disk shape is identical** (below), so the rest of these docs are agnostic.

## Standard module layout

```
Modules/
  <ModuleName>/
    Routes/
      web.php          # admin + public web routes for this module
      api.php          # /api/v1 routes for this module (Flutter)
    Http/
      Controllers/
        Web/           # Blade-returning controllers (front + admin)
        Api/           # JSON controllers (versioned)
      Requests/        # FormRequest validation
      Resources/       # Eloquent API Resources (JSON shaping)
      Middleware/      # module-specific middleware (rare)
    Models/
    Services/          # business logic (use-cases)
    Policies/          # authorization
    Events/  Listeners/
    Jobs/              # queued work (transcode, rollups…)
    Database/
      Migrations/
      Seeders/
      Factories/
    Resources/
      views/           # Blade views (the static HTML, templated)
      lang/            # translations
    Tests/
      Feature/  Unit/
    Providers/
      <ModuleName>ServiceProvider.php
    config.php
    composer.json      # (Option A) module metadata
    README.md          # what the module does + links to its spec in /architecture/modules
```

## The module catalogue

Derived directly from the static views (admin sidebar groups + front nav). Each links to its
detailed spec.

### Platform / shared
| Module | Responsibility | Spec |
|--------|----------------|------|
| **Core** | Base layout, Blade partials, shared CSS/JS assets, helpers, base classes. | [modules/core.md](modules/core.md) |
| **Auth** | Phone+password (users), email+password (admins), OTP, password reset, Sanctum tokens. | [modules/auth.md](modules/auth.md) |
| **Users** | End‑user profiles, account type, Zone/State/LGA geography. | [modules/users.md](modules/users.md) |
| **Geography** | Zones, States, LGAs reference data + seeders. | [modules/geography.md](modules/geography.md) |
| **Search** | Cross‑content search + Explore page. | [modules/search.md](modules/search.md) |

### Music domain
| Module | Responsibility | Spec |
|--------|----------------|------|
| **Songs** | Song catalog, detail, playback, lyrics, plays. | [modules/songs.md](modules/songs.md) |
| **Artists** | Artist profiles, following, songs‑by‑artist. | [modules/artists.md](modules/artists.md) |
| **Categories** | Song categories & sub‑categories. | [modules/categories.md](modules/categories.md) |
| **Playlists** | User & curated playlists. | [modules/playlists.md](modules/playlists.md) |

### Wa'azi domain
| Module | Responsibility | Spec |
|--------|----------------|------|
| **Waazi** | Lecture catalog, detail, playback. | [modules/waazi.md](modules/waazi.md) |
| **Preachers** | Preacher profiles, following. | [modules/preachers.md](modules/preachers.md) |
| **WaaziCategories** | Wa'azi categories & sub‑categories. | [modules/waazi-categories.md](modules/waazi-categories.md) |
| **WaaziSeries** | Ordered lecture series. | [modules/waazi-series.md](modules/waazi-series.md) |

### Engagement (shared across both domains)
| Module | Responsibility | Spec |
|--------|----------------|------|
| **Favourites** | Hearted songs/lectures (polymorphic). | [modules/favourites.md](modules/favourites.md) |
| **Comments** | Comments + moderation/reports. | [modules/comments-reports.md](modules/comments-reports.md) |
| **Downloads** | Download gating + analytics events. | [modules/downloads-analytics.md](modules/downloads-analytics.md) |
| **Featured** | Featured & trending curation. | [modules/featured-trending.md](modules/featured-trending.md) |

### Monetisation
| Module | Responsibility | Spec |
|--------|----------------|------|
| **Ads** | AdSense unit/placement config + serving rules. | [modules/ads.md](modules/ads.md) |
| **Subscriptions** | Plans, subscriptions, payments (Paystack/Flutterwave). | [modules/premium-subscriptions.md](modules/premium-subscriptions.md) |

### System / admin
| Module | Responsibility | Spec |
|--------|----------------|------|
| **AdminRoles** | RBAC: roles & permissions for staff. | [modules/admin-roles.md](modules/admin-roles.md) |
| **Notifications** | User + admin notifications, push (FCM). | [modules/notifications.md](modules/notifications.md) |
| **ActivityLogs** | Audit trail. | [modules/activity-logs.md](modules/activity-logs.md) |
| **Settings** | Global configurable settings. | [modules/settings.md](modules/settings.md) |
| **AdminDashboard** | KPI dashboard aggregation. | [modules/admin-dashboard.md](modules/admin-dashboard.md) |

## Dependency direction

```
Core  ◀──────────────────────────────── (everything depends on Core)
Geography ◀── Users ◀── Auth
Categories ◀── Songs ◀── Artists
WaaziCategories ◀── Waazi ◀── Preachers ◀── WaaziSeries
Favourites/Comments/Downloads/Featured ── depend on ──▶ Songs & Waazi
Subscriptions/Ads ── depend on ──▶ Users
AdminRoles/ActivityLogs/Notifications/Settings/AdminDashboard ── cross‑cutting
```

Rules:
- A module may depend on a module **above/left** of it, never the reverse (no cycles).
- Cross‑module calls go through the target module's **Service**, never its raw models.
- Shared contracts (interfaces, DTOs) that two modules need live in **Core**.
