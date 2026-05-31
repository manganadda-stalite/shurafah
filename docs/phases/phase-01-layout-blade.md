# Phase 1 — Layout & Blade Shell (design‑faithful)

**Goal:** Serve the existing static HTML through Blade **with zero visual change**. Extract the
shared shell (layouts + partials) and make the static pages reachable via routes — still showing
their hard‑coded sample data (no DB yet).

**Why now:** Proves the "no redesign / no Tailwind" approach early and gives a clickable app.

## Scope
**In:** `layouts/front`, `layouts/admin`, shared partials (head, bottom‑nav, mini‑player,
search bar, ad‑slot, admin sidebar/topbar), move shared JS to Vite, route the key pages.
**Out:** DB binding, auth, dynamic data.

## Prerequisites
- Phase 0.

## Tasks
- [ ] Create `layouts/front.blade.php` and `layouts/admin.blade.php` from the static `<head>`/shell.
- [ ] Extract partials verbatim: front bottom‑nav, mini‑player, search bar; admin sidebar/topbar
  (keep `admin-sidebar.js`/`admin-topbar.js` as‑is — see architecture/05).
- [ ] Move `ads.js`, `theme-manager.js`, `admin-sidebar.js`, `admin-topbar.js` to `resources/js/`
  and load via `@vite` (contents unchanged).
- [ ] Convert `song_portal_web.html`, `shurafah_explore.html`, `shurafah_waazi.html`,
  `favourites_page.html`, `user_profile_page.html`, `login_page.html`, `register_page.html`,
  `shurafah_admin_dashboard.html` into Blade views that `@extends` the layouts (sample data intact).
- [ ] Wire routes for the above (returning the static‑content Blade views).
- [ ] Confirm dark/light theme + accent‑color switching still work.

## Artifacts
- `resources/views/layouts/*`, `resources/views/partials/*`, routed static pages.

## Security (DoD)
- No `{!! !!}` introduced; secure‑headers still pass; CSP (if enabled) allows Google Fonts + AdSense.

## Tests
- HTTP test: each routed page returns 200 and contains a known design marker (e.g. the app title,
  bottom‑nav labels).

## Definition of Done
- [ ] Routed pages are **pixel‑identical** to the static files (screenshot check).
- [ ] No Tailwind/framework added; existing CSS/JS untouched in content.
- [ ] Theme + accent color still function.
