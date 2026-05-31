# Phase 20 — Notifications

**Goal:** In‑app notifications for users, push to the Flutter app (FCM), and admin broadcasts.

## Scope
**In:** Laravel notifications table; `devices` (FCM tokens); `shurafah_admin_notifications.html`
broadcast composer; user notification list/read API.
**Out:** Notification preferences (future), email/SMS digests (future).

## Prerequisites
- Phase 13 (admin), Phase 3 (users).

## Tasks
- [ ] `NotificationService`; `BroadcastService` (queued fan‑out by audience all/free/premium).
- [ ] `POST /devices` (register FCM), FCM channel via `laravel-notification-channels/fcm`.
- [ ] API: list, mark‑read, read‑all; front bell + admin topbar bell wired.
- [ ] Admin broadcast composer + schedule + delivery stats.

## Packages
- `laravel-notification-channels/fcm`, optional `laravel/reverb`.

## Security (DoD)
- Users see only own notifications; FCM token scoped to owner; broadcast requires
  `notifications.send`; registration throttled.

## Tests
- Notification delivered + mark‑read; broadcast fan‑out to audience; FCM token registration; auth scoping.

## Definition of Done
- [ ] In‑app + push notifications + admin broadcasts work; tests green.
