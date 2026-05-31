# Module: Settings

**Purpose:** Global, configurable platform settings managed by admins (general, ads, payments,
security, media).

## Static views owned
- Admin: `adminviews/shurafah_admin_settings.html`

## Data / tables
- `spatie/laravel-settings` groups: `general` (app name, logo, contact), `ads` (toggle, caps),
  `payments` (active gateway, plan defaults), `security` (lockout thresholds), `media`
  (max upload size, allowed types).

## Web/API endpoints
- Admin: `GET/PUT /admin/settings/{group}`.
- `GET /api/v1/app/config` exposes the **public‑safe** subset to clients (min app version, ads
  toggle, maintenance flag, feature flags).

## Services
- `SettingsService` (typed, cached; cache busted on save).

## Security
- Edit requires `settings.manage`; secrets remain in `.env`, not settings; changes logged.

## Packages
- `spatie/laravel-settings`.

## Phase
- **Phase 22** (a minimal settings store can exist earlier for `app/config`).

## Future enhancements
- Feature‑flag UI, per‑environment overrides, scheduled settings, maintenance mode toggle.
