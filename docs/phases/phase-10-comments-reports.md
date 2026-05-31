# Phase 10 — Comments & Reports

**Goal:** Users can comment on songs (and lectures once Phase 12 lands) and report
comments/content; basic moderation surface exists.

## Scope
**In:** `comments` (polymorphic, replies), `reports`; `all_comments.html` + detail‑page comment
widgets; create/delete‑own/report via API + web.
**Out:** Full admin moderation dashboard (Phase 14 admin), AI moderation.

## Prerequisites
- Phase 5 (songs). Works for Waazi automatically after Phase 12 (polymorphic).

## Tasks
- [ ] Migrations/models for comments + reports.
- [ ] `CommentService` (create w/ rate limit + escaping/sanitisation, soft delete, counter cache),
  `ReportService`.
- [ ] Bind comment list/input on detail pages + `all_comments.html`.
- [ ] API: list/create/delete‑own/report.
- [ ] Policies: delete only own comment; report requires auth.

## Security (DoD)
- Auth to comment; **rate‑limited** (anti‑spam); output escaped (XSS); users delete only own;
  reporting throttled.

## Tests
- Post/list/delete‑own comment; cannot delete others' (403); report flow; rate limit; XSS payload
  is escaped.

## Definition of Done
- [ ] Comments + reports work web + API; design intact; security tests green.
