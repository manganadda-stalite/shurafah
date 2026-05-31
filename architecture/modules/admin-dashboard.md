# Module: Admin Dashboard

**Purpose:** The admin landing page — KPI cards and charts aggregating the whole platform.

## Static views owned
- `adminviews/shurafah_admin_dashboard.html`

## Data
- Reads aggregates from Users, Songs, Waazi, Downloads, Subscriptions, Comments/Reports.
  No own tables (uses cached aggregations / daily stat roll‑ups).

## Web endpoints
- `GET /admin` / `GET /admin/dashboard` — totals (users, songs, lectures, premium subscribers),
  recent activity, downloads/plays trend, revenue (Naira), pending reports.

## Services
- `DashboardService` (cached KPI queries; reuses `AnalyticsService` roll‑ups).

## Security
- Requires authenticated admin; individual widgets respect the viewer's permissions (e.g. revenue
  only for `finance`/`super-admin`).

## Phase
- **Phase 13** (skeleton with auth) → enriched as each data module lands.

## Future enhancements
- Customisable widgets, date‑range filters, real‑time counters, export, regional breakdowns.
