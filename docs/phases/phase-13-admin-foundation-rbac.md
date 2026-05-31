# Phase 13 — Admin Foundation & RBAC

**Goal:** Admin staff can log in (separate guard, email+password, 2FA), with roles/permissions
enforced, the admin shell (sidebar/topbar) live, and a dashboard skeleton.

**Why now:** Prereq for all admin CRUD phases (14–22).

## Scope
**In:** `admin` guard, `shurafah_admin_auth.html` login, `spatie/laravel-permission` roles/
permissions, `shurafah_admin_roles.html`, admin layout + sidebar/topbar wired to routes,
`shurafah_admin_dashboard.html` skeleton.
**Out:** Actual content management (14+), analytics data (19), settings (22).

## Prerequisites
- Phase 2 (admin_users + roles seeded), Phase 3 patterns.

## Tasks
- [ ] `admin` auth guard + `Admin\Auth\LoginController`; bind admin login page.
- [ ] Admin 2FA (TOTP) via `pragmarx/google2fa-laravel` for privileged roles.
- [ ] Wire `admin-sidebar.js`/`admin-topbar.js` active‑state to Laravel routes (or port to Blade).
- [ ] Roles/permissions CRUD (`Admin\RoleController`) bound to `shurafah_admin_roles.html`.
- [ ] `RequirePermission` middleware (`can:`); deny‑by‑default on all `/admin/*`.
- [ ] Dashboard skeleton (`Admin\DashboardController`) — KPI cards wired as data lands.

## Packages
- `spatie/laravel-permission`, `pragmarx/google2fa-laravel`.

## Security (DoD — critical)
- Separate guard; mandatory 2FA for privileged roles; deny‑by‑default; super‑admin lockout
  protection; all admin mutations will be logged (Phase 21 trait can be enabled now).

## Tests
- Admin login (+2FA); non‑admin cannot access `/admin`; permission‑gated route returns 403
  without permission; role CRUD works.

## Definition of Done
- [ ] Admins log in with 2FA; RBAC enforced; admin shell + dashboard skeleton live; design intact.
