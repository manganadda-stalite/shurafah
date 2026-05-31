# Phase 9 — Playback & Downloads

**Goal:** Real audio playback via signed streaming URLs, play tracking, and **gated** downloads
(free‑user daily cap, premium unlimited, premium‑only items blocked for free users).

**Why now:** Turns the catalog into a working audio app.

## Scope
**In:** Streaming endpoint (signed URLs), `player.js` wiring of the existing mini‑player/detail
player, `POST /songs/{id}/play`, `POST /songs/{id}/download` with gating, `downloads` events.
**Out:** Analytics dashboard (Phase 19), HLS/adaptive (future), offline (future).

## Prerequisites
- Phase 5 (songs); Phase 17 not required (premium gating can read `account_type`/`premium_expires_at`).

## Tasks
- [ ] Store audio on S3; generate **signed, temporary** stream/download URLs.
- [ ] `player.js` (vanilla, no styling) drives existing player DOM; posts play events.
- [ ] `DownloadService` (authorise → record `downloads` row → issue signed URL; enforce free cap
  mirroring `ads.js frequencyCaps.downloadModal`; block premium‑only for free users).
- [ ] `PlayService` increments `plays_count` (throttled/deduped per session).
- [ ] Download interstitial continues to use existing `ads.js` (no UI change).

## Security (DoD — critical)
- Signed expiring URLs; no direct object access; per‑user/day caps; premium gating server‑side;
  IPs hashed in `downloads`; endpoints throttled.

## Tests
- Stream URL signed + expires; play increments count; free‑user cap enforced; premium‑only blocked
  for free user; premium downloads unlimited.

## Definition of Done
- [ ] Audio plays from storage; downloads gated correctly; tests (incl. gating) green.
