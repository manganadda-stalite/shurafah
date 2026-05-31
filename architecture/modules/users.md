# Module: Users

**Purpose:** End‑user accounts and profiles; account type (free/premium); geography linkage;
admin user management screen.

## Static views owned
- `frontviews/user_profile_page.html` (my profile).
- `adminviews/shurafah_admin_user_management.html` (admin: list/suspend/ban users).

## Data / tables
- `users` (full_name, phone, email?, password, zone/state/lga ids, avatar, account_type,
  premium_expires_at, status, last_login_at).

## Web routes
| Route | Page |
|-------|------|
| `GET /profile` | user profile |
| `PUT /profile` | update profile/avatar |
| `GET /admin/users` | admin list |
| `GET /admin/users/{user}` | admin detail |
| `PATCH /admin/users/{user}/status` | suspend/ban/activate |

## API endpoints
- `GET /api/v1/profile`, `PUT /api/v1/profile`, `POST /api/v1/profile/avatar`,
  `GET /api/v1/profile/stats` (favourites/downloads counts).

## Services
- `UserService` (updateProfile, changeAccountType, suspend/ban), uses Geography for validation.

## Security
- Users edit only their own profile (Policy). Admin actions require `users.manage` permission
  + activity log. PII access restricted by RBAC.

## Packages
- `intervention/image` (avatar), `spatie/laravel-medialibrary` (optional for avatar).

## Phase
- **Phase 4** (user profile), admin user management **Phase 14**.

## Future enhancements
- Account deletion (GDPR/data‑export), email verification, profile privacy settings.
