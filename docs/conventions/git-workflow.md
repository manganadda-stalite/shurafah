# Git Workflow

## Branches
- `main` — always deployable.
- One **branch per phase**: `feat/phase-03-auth`, `feat/phase-05-songs-catalog`, …
- Sub‑tasks within a large phase may use `feat/phase-05-songs-catalog--detail-page`.

## Pull requests
- One phase = one PR (or a small number of stacked PRs). Keep them reviewable.
- PR description states: phase, scope, what's in/out, security notes, screenshots (UI), and the
  Definition‑of‑Done checklist.
- Require green CI + at least one review before merge.

## Commits
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`.
- Imperative mood, concise subject; body explains *why* when non‑obvious.

## CI gates (see architecture/09)
- `pint --test`, `larastan`, `pest`/`phpunit`, `composer audit`, `npm audit`, asset build.

## Releases
- Tag releases (`v0.1.0` …). Staging auto‑deploys from `main`; production deploys from tags with
  manual approval. Migrations run with `--force` on deploy.

## Never
- Commit secrets/`.env`. Force‑push `main`. Merge red CI. Bypass hooks without reason.
