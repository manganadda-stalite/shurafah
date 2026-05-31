# 05 — Blade Integration (keep the HTML design **exactly**)

> **Hard requirement from the product owner:** *"maintain exactly my HTML views design exactly
> as it is in the static views… No framework migration, no redesign, no Tailwind — just the
> design in the HTMLs."*

This document defines the **mechanical, non‑creative** process to move each static HTML file
into Laravel Blade with **zero visual change**.

## Principle: templating, not redesigning

We only do three kinds of edits to the markup:

1. **Extract** repeated chunks (sidebar, topbar, bottom nav, mini‑player, head) into Blade
   partials — using the *same* HTML that already exists.
2. **Replace hard‑coded sample data** (e.g. "Open Heaven · Nathaniel Bassey") with Blade echoes
   (`{{ $song->title }}`) inside `@foreach` loops — the surrounding tags/classes are untouched.
3. **Rewrite links/asset URLs** from `foo.html` to named routes (`route('songs.show', $song)`)
   and `src="ads.js"` to `@vite`/`asset()` — the elements themselves are unchanged.

Everything else — the `<style>` blocks, class names, SVG icons, layout, colors — is **copied
verbatim**. A pixel‑diff between the static page and the rendered Blade page must be empty.

## Target view structure

```
resources/views/
  layouts/
    front.blade.php      # <html><head>… + shared front CSS/fonts; @yield('content')
    admin.blade.php      # admin shell; includes sidebar+topbar partials
  partials/
    front/
      head.blade.php     # meta, fonts (Syne, DM Sans), <style> base, theme bootstrap
      bottom-nav.blade.php   # Home · Wa'azi · Explore · Favourites · Profile
      mini-player.blade.php
      search-bar.blade.php
      ad-slot.blade.php  # renders an ad placement (delegates to ads.js)
    admin/
      sidebar.blade.php  # (or keep admin-sidebar.js as-is; see "JS-built chrome" below)
      topbar.blade.php
  components/            # Blade components for reused cards
    song-row.blade.php
    song-card.blade.php
    artist-chip.blade.php
    waazi-card.blade.php
    comment.blade.php
```

Each **module** also has its own `Resources/views/` (e.g. `Modules/Songs/Resources/views/show.blade.php`)
that `@extends('layouts.front')`. The global `layouts/` + `partials/` live in the **Core** module.

## JS‑built chrome (`admin-sidebar.js`, `admin-topbar.js`)

The admin sidebar/topbar are currently injected by JS. **Two acceptable options:**

- **Keep as‑is (fastest, zero redesign):** continue loading `admin-sidebar.js` /
  `admin-topbar.js`; just make the "active page" detection work with Laravel routes and let the
  JS build the chrome. This guarantees identical look with the least churn.
- **Port to Blade partials (cleaner long‑term):** translate the JS‑generated HTML/CSS 1:1 into
  `partials/admin/sidebar.blade.php`, marking the active item with `request()->routeIs()`.
  The CSS string in the JS becomes the partial's `<style>` unchanged.

Pick per the roadmap (Phase 13). Default: **keep the JS** first, port later if desired.

## Mapping table (static file → route → view → controller)

The full file‑by‑file mapping lives in [`../docs/static-views-inventory.md`](../docs/static-views-inventory.md).
Pattern:

| Static file | Route name | Controller@method | Blade view |
|-------------|-----------|-------------------|------------|
| `song_portal_web.html` | `home` | `HomeController@index` | `home.index` |
| `song_detail_page.html` | `songs.show` | `Web\SongController@show` | `songs.show` |
| `shurafah_explore.html` | `explore` | `SearchController@explore` | `search.explore` |
| `shurafah_waazi.html` | `waazi.index` | `Web\WaaziController@index` | `waazi.index` |
| `shurafah_admin_dashboard.html` | `admin.dashboard` | `Admin\DashboardController@index` | `admin.dashboard` |
| … | … | … | … |

## Asset handling

- Shared CSS that currently lives **inline** in each HTML `<style>` stays inline in the Blade
  partial/layout (no extraction needed for identical output). Optionally lift the *common* base
  into `partials/front/head.blade.php`.
- Shared **JS files** (`ads.js`, `theme-manager.js`, `admin-sidebar.js`, `admin-topbar.js`) move
  to `resources/js/` and are served via **Vite** (`@vite(['resources/js/ads.js', …])`) for
  cache‑busting. Their contents are unchanged. See [`06-frontend-asset-strategy.md`](06-frontend-asset-strategy.md).
- `localStorage` keys (`accentColor`, `adminTheme`) keep working unchanged.

## Dynamic data binding rules

- Lists (song rows, cards, comments) → `@foreach($songs as $song) … @endforeach`, keeping the
  exact card markup; bind text/`src`/counts via `{{ }}`.
- Always escape with `{{ }}` (auto HTML‑escape) — never `{!! !!}` for user content (XSS).
- Numbers like "9.2K" → a `Number::abbreviate()`/helper applied to `$song->plays_count`.
- Durations "4:55" → a `formatDuration($seconds)` helper.
- Empty states already present in the HTML are reused when a collection is empty.

## Acceptance criteria for "design preserved"

1. Rendered HTML of each page is visually identical to the static file (manual + screenshot
   diff in testing).
2. No Tailwind classes/utilities added anywhere.
3. No CSS framework or JS framework added.
4. Light/dark theme and accent‑color switching behave exactly as before.
5. All existing SVG icons and class names retained.
