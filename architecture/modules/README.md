# Module Specifications

Each module in the system has a detailed specification that defines:
- Entity relationships and data models
- Service methods and use-cases
- Edge cases and business logic
- API endpoints (mapped to `/api/v1`)
- Security and authorization rules
- Testing strategy per module

Start reading from the platform/shared modules (Core, Auth, Users, Geography) before moving to domain modules (Songs, Artists, Wa'azi, etc.).

## Platform / Shared Modules

| Module | Purpose | Status |
|--------|---------|--------|
| [Core](core.md) | Base layout, partials, helpers, shared contracts | ✅ Ready |
| [Auth](auth.md) | Phone+password (users), email+password (admins), OTP, Sanctum | ✅ Ready |
| [Users](users.md) | User profiles, account types, geography | ✅ Ready |
| [Geography](geography.md) | Zones, States, LGAs reference data | ✅ Ready |
| [Search](search.md) | Global search + Explore page | ⏳ Phase 11 |

## Music Domain

| Module | Purpose | Status |
|--------|---------|--------|
| [Songs](songs.md) | Song catalog, playback, analytics | ⏳ Phase 5 |
| [Artists](artists.md) | Artist profiles, following | ⏳ Phase 6 |
| [Categories](categories.md) | Song categories & sub-categories | ⏳ Phase 7 |
| [Playlists](playlists.md) | User & curated playlists | ⏳ Phase 8 |

## Wa'azi Domain

| Module | Purpose | Status |
|--------|---------|--------|
| [Waazi](waazi.md) | Lecture catalog, playback | ⏳ Phase 12 |
| [Preachers](preachers.md) | Preacher profiles, following | ⏳ Phase 12 |
| [WaaziCategories](waazi-categories.md) | Wa'azi categories & sub-categories | ⏳ Phase 12 |
| [WaaziSeries](waazi-series.md) | Ordered lecture series | ⏳ Phase 12 |

## Engagement (Shared across domains)

| Module | Purpose | Status |
|--------|---------|--------|
| [Favourites](favourites.md) | Hearted songs/lectures (polymorphic) | ⏳ Phase 8 |
| [Comments](comments-reports.md) | Comments + moderation/reports | ⏳ Phase 10 |
| [Downloads](downloads-analytics.md) | Download gating + analytics | ⏳ Phase 9 |
| [Featured](featured-trending.md) | Featured & trending curation | ⏳ Phase 16 |

## Monetization

| Module | Purpose | Status |
|--------|---------|--------|
| [Ads](ads.md) | AdSense config + serving rules | ⏳ Phase 18 |
| [Premium](premium-subscriptions.md) | Subscriptions, plans, payments | ⏳ Phase 17 |

## System / Admin

| Module | Purpose | Status |
|--------|---------|--------|
| [AdminRoles](admin-roles.md) | RBAC: roles & permissions for staff | ⏳ Phase 13 |
| [Notifications](notifications.md) | User + admin notifications, push (FCM) | ⏳ Phase 20 |
| [ActivityLogs](activity-logs.md) | Audit trail of admin actions | ⏳ Phase 21 |
| [Settings](settings.md) | Global configurable settings | ⏳ Phase 22 |
| [AdminDashboard](admin-dashboard.md) | KPI dashboard aggregation | ⏳ Phase 13 |

## How to read a module spec

Each module spec includes:

1. **Overview** — One sentence of what the module does
2. **Models** — Eloquent models, relationships, enums
3. **Services** — Public methods, business logic, use-cases
4. **Routes** — Web + Admin + API endpoints
5. **Policies** — Authorization rules (who can do what)
6. **Events/Listeners** — Domain events fired
7. **Jobs** — Queued work (if any)
8. **Migrations** — Table creation (referenced from `architecture/04-database-schema.md`)
9. **Tests** — What must be covered
10. **Security** — Module-specific security checklist

## Example: Auth Module Spec Structure

See [`auth.md`](auth.md) for the complete template.
