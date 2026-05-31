# Module: Notifications

**Purpose:** In‑app notifications for users and admins + push to the Flutter app, and
admin‑authored broadcasts.

## Static views owned
- Bell/notification UI in front header and admin topbar (`admin-topbar.js`).
- Admin: `adminviews/shurafah_admin_notifications.html` (compose/broadcast, history).

## Data / tables
- Laravel `notifications` table (polymorphic notifiable, data json, read_at).
- `admin_broadcasts` (title, body, audience all/free/premium, channels json, scheduled_at, sent_at).
- `devices` (user_id, fcm_token, platform) for push.

## Web/API endpoints
- `GET /api/v1/notifications`, `POST /api/v1/notifications/{id}/read`,
  `POST /api/v1/notifications/read-all`, `POST /api/v1/devices` (register FCM token).
- Admin: compose broadcast, schedule, view delivery stats.

## Services
- `NotificationService`, `BroadcastService` (queued fan‑out), FCM channel.

## Security
- Users see only their notifications. Broadcast requires `notifications.send`. FCM tokens scoped
  to the owning user; rate‑limited registration.

## Packages
- `laravel-notification-channels/fcm`, optional `laravel/reverb` (web sockets), queues.

## Phase
- **Phase 20**.

## Future enhancements
- Notification preferences/opt‑out, rich/deep‑linked push, segmentation by Zone/State,
  email/SMS digests.
