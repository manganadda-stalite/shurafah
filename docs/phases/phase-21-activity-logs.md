# Phase 21 — Activity Logs

**Goal:** A complete, read‑only audit trail of admin (and sensitive user) actions.

## Scope
**In:** `spatie/laravel-activitylog` wired across admin mutations; `shurafah_admin_activity_logs.html`
viewer with filters.
**Out:** SIEM forwarding (future).

## Prerequisites
- Phase 13. (The `LogsActivity` trait can be enabled per module earlier; this phase ensures
  coverage + the viewer.)

## Tasks
- [ ] Add `LogsActivity` to managed models; explicit logs for key events (publish, refund, ban,
  role change, settings change).
- [ ] Bind activity‑logs viewer (filter by causer/subject/date/action), read‑only.
- [ ] Retention policy + pruning job.

## Packages
- `spatie/laravel-activitylog`.

## Security (DoD)
- Append‑only (no edit/delete via UI); `logs.view` permission; no secrets/PII in properties.

## Tests
- Mutations create log entries with before/after; viewer filters; permission gate.

## Definition of Done
- [ ] Audit trail captures admin actions; viewer live; tests green.
