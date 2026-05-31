# Phase 2 — Database Foundation

**Goal:** Establish the core schema, geography seed data, RBAC scaffolding, and factories so
later phases can bind real data.

**Why now:** Auth (Phase 3) needs `users` + geography; content phases need their tables.

## Scope
**In:** Migrations for identity + reference data + RBAC scaffold; seeders (Zones/States/LGAs,
default roles/permissions, one super‑admin, subscription plans); model factories.
**Out:** Feature behaviour (just schema + seed).

## Prerequisites
- Phase 0 (and Phase 1 for app shell).

## Tasks
- [ ] Migrations: `users`, `admin_users`, Sanctum `personal_access_tokens`, `otp_codes`,
  `password_reset_tokens`, `sessions`.
- [ ] Geography: `zones`, `states`, `lgas` + **full Nigeria seed** (6 zones, 36 states + FCT, 774 LGAs).
- [ ] Install `spatie/laravel-permission`; publish/migrate; seed default roles + permissions
  (see `architecture/modules/admin-roles.md`); create one `super-admin` admin user.
- [ ] Install `spatie/laravel-settings`; create `general`/`security` settings.
- [ ] `subscription_plans` migration + seed Free + Premium (Monthly/Yearly, Naira prices).
- [ ] Eloquent models + factories for the above; enums (`AccountType`, `UserStatus`).

## Artifacts
- Migrations/seeders/factories in the relevant module `Database/` folders.

## Security (DoD)
- `users.password` hashed; `$fillable` declared; no PII in seeds beyond demo; super‑admin
  password from env, not hard‑coded.

## Tests
- `migrate:fresh --seed` succeeds; geography counts correct; default roles/permissions exist.

## Definition of Done
- [ ] `php artisan migrate:fresh --seed` runs clean in CI.
- [ ] Geography + roles + plans seeded and asserted by tests.
