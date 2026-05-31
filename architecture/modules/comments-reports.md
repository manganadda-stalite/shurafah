# Module: Comments & Reports

**Purpose:** User comments on songs/lectures (polymorphic) and the moderation/reporting
workflow.

## Static views owned
- `frontviews/all_comments.html`, comment widgets inside `song_detail_page.html` /
  `shurafah_waazi_detail.html`.
- Admin: `adminviews/shurafah_admin_comments_reports.html`

## Data / tables
- `comments` (polymorphic commentable, parent_id for replies, status, likes_count).
- `reports` (reporter_id, polymorphic reportable, reason, status, handled_by).

## Web routes / API
- `GET /{song|waazi}/{id}/comments`, `POST …/comments`, `DELETE comments/{id}` (own),
  `POST comments/{id}/report`.
- Admin: `GET /admin/comments`, `GET /admin/reports`, hide/restore/delete, resolve/dismiss report.

## Services
- `CommentService` (create with rate limit + profanity filter hook, soft delete, counter cache),
  `ReportService` (file, resolve, dismiss).

## Security
- Auth to comment; users delete only own comments; **rate‑limited** (anti‑spam); content escaped
  (XSS). Admin moderation requires `comments.moderate` + activity log.

## Packages
- Optional profanity filter; `spatie/laravel-activitylog` for moderation actions.

## Phase
- **Phase 10**.

## Future enhancements
- Threaded replies UI, comment likes, automated moderation/AI toxicity scoring, shadow‑bans.
