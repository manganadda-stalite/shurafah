# Phase 22 — Settings

**Goal:** Global, configurable platform settings (general, ads, payments, security, media) managed
by admins, plus a public‑safe `app/config` for clients.

## Scope
**In:** `spatie/laravel-settings` groups; `shurafah_admin_settings.html`; `GET /api/v1/app/config`.
**Out:** Feature‑flag UI (future).

## Prerequisites
- Phase 13. (A minimal settings store may already exist from Phase 2 for `app/config`.)

## Tasks
- [ ] Define typed settings groups; admin edit screens bound to the settings page.
- [ ] `SettingsService` (typed, cached, cache‑busted on save).
- [ ] `GET /api/v1/app/config` exposes public‑safe subset (min app version, ads toggle,
  maintenance flag, feature flags).

## Packages
- `spatie/laravel-settings`.

## Security (DoD)
- `settings.manage` to edit; secrets stay in `.env` (not settings); changes logged.

## Tests
- Update setting persists + busts cache; `app/config` returns only public‑safe keys; permission gate.

## Definition of Done
- [ ] Settings manageable; clients can read `app/config`; tests green.
