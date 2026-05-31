# Shurafah — Development Documentation

This folder is the **delivery plan**. It tells us *what to build, in what order, and how to
know each step is done*. The **how it is designed** lives in [`../architecture/`](../architecture/).

## Contents

| Path | What it is |
|------|------------|
| [`ROADMAP.md`](ROADMAP.md) | The full phased plan — many **small** phases, basics first. |
| [`phases/`](phases/) | One detailed work‑order per phase (scope, tasks, files, packages, security, Definition of Done). |
| [`static-views-inventory.md`](static-views-inventory.md) | Every HTML/JS file analysed → mapped to a module, route, controller, Blade view and phase. |
| [`api/`](api/) | The REST API endpoint catalogue for the Flutter app. |
| [`conventions/`](conventions/) | Coding standards, git workflow, testing strategy. |

## How we work (read this first)

1. **One phase at a time.** Each phase is a small, shippable PR. Do not start the next phase
   until the current one meets its Definition of Done.
2. **Each phase = its own branch + PR**, e.g. `feat/phase-03-auth`.
3. **Never touch the design.** Blade serves the existing HTML verbatim
   (see [`../architecture/05-blade-integration.md`](../architecture/05-blade-integration.md)).
4. **Security gate every phase** — the security checklist in
   [`../architecture/07-security-architecture.md`](../architecture/07-security-architecture.md)
   must pass.
5. **Tests with every phase** — see [`conventions/testing-strategy.md`](conventions/testing-strategy.md).
6. **Update the inventory** when a static page is wired up.

## The big picture (phase groups)

```
Foundation      Phase 0  → 2    (bootstrap, layout/Blade, database)
User basics     Phase 3  → 4    (auth, profile)
Music catalog   Phase 5  → 9    (songs, artists, categories, playlists, favourites, playback)
Engagement      Phase 10 → 11   (comments/reports, search/explore)
Wa'azi          Phase 12        (lectures, preachers, categories, series)
Admin           Phase 13 → 16   (admin auth/RBAC, content CRUD, wa'azi CRUD, featured/trending)
Monetisation    Phase 17 → 19   (subscriptions+payments, ads, download analytics)
System          Phase 20 → 22   (notifications, activity logs, settings)
Mobile/API      Phase 23        (API hardening + OpenAPI for Flutter)
Launch          Phase 24 → 25   (security audit/perf/deploy, Flutter handoff)
```

Start at [`phases/phase-00-bootstrap.md`](phases/phase-00-bootstrap.md).
