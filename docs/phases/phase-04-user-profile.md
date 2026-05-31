# Phase 4 — User Profile

**Goal:** Authenticated users can view and edit their profile (name, phone, geography, avatar)
via `user_profile_page.html`, on web and API.

**Why now:** Completes the basic user identity loop before content personalisation.

## Scope
**In:** Show/update profile, avatar upload, change password, account‑type display.
**Out:** Premium purchase (Phase 17), favourites/playlists (Phase 8), notifications (Phase 20).

## Prerequisites
- Phase 3.

## Tasks
- [ ] Bind `user_profile_page.html` to the authenticated user's data.
- [ ] `Web\ProfileController` (show/update) + `Api\ProfileController` (`GET/PUT /profile`,
  `POST /profile/avatar`).
- [ ] `UserService::updateProfile()`, avatar via `intervention/image` (resize) to S3.
- [ ] `UpdateProfileRequest`, `ChangePasswordRequest` validation.
- [ ] `UserPolicy` — a user edits only their own profile.

## Packages
- `intervention/image` (+ optional medialibrary).

## Security (DoD)
- Ownership enforced by policy; avatar upload validated (MIME/size); password change re‑auth;
  no PII leakage in API resource.

## Tests
- Update profile (web+API); cannot edit another user's profile (403); avatar validation;
  password change requires current password.

## Definition of Done
- [ ] Profile view/edit works on web + API with design intact.
- [ ] Authorization + upload validation tests pass.
