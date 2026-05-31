# Module: Admin Roles (RBAC)

**Purpose:** Role‑based access control for staff — roles, permissions, and admin user
assignment.

## Static views owned
- `adminviews/shurafah_admin_roles.html`
- (admin auth in `shurafah_admin_auth.html` — see Auth module).

## Data / tables
- `admin_users` + spatie tables: `roles`, `permissions`, `role_has_permissions`,
  `model_has_roles`, `model_has_permissions` (guard `admin`).

## Default roles & permissions
- Roles: `super-admin`, `content-manager`, `moderator`, `finance`, `analyst`, `support`.
- Permission naming: `<area>.<action>` e.g. `songs.manage`, `comments.moderate`,
  `subscriptions.manage`, `analytics.view`, `users.manage`, `settings.manage`, `roles.manage`.

## Web/API endpoints
- `/admin/roles` CRUD, assign permissions, assign roles to admin users.

## Services
- `RoleService` (CRUD roles/permissions, sync), guarded by `roles.manage` (super‑admin only).

## Security
- Deny‑by‑default; every admin route maps to a permission via `can:`/middleware. Changes logged.
  Super‑admin protected from accidental self‑lockout. Admin 2FA enforced.

## Packages
- `spatie/laravel-permission`.

## Phase
- **Phase 13** (admin foundation), before admin CRUD modules.

## Future enhancements
- Granular per‑record permissions, time‑boxed access, audit dashboards, SSO for staff.
