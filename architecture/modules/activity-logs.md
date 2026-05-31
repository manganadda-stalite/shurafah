# Module: Activity Logs

**Purpose:** Tamper‑evident audit trail of admin (and sensitive user) actions.

## Static views owned
- Admin: `adminviews/shurafah_admin_activity_logs.html`

## Data / tables
- `activity_log` (spatie): log_name, description, subject_type/id, causer_type/id,
  properties json (before/after), created_at.

## Web/API endpoints
- Admin: `GET /admin/activity-logs` (filter by causer, subject, date, action), read‑only.

## Services
- Logging is declarative on models (`LogsActivity` trait) + explicit logs in services for
  important events (publish, refund, role change, ban).

## Security
- Read requires `logs.view`; logs are **append‑only** (no edit/delete via UI); retention policy.

## Packages
- `spatie/laravel-activitylog`.

## Phase
- **Phase 21** (foundational trait can be enabled earlier per module).

## Future enhancements
- Export/SIEM forwarding, anomaly alerts, diff viewer, immutable storage.
