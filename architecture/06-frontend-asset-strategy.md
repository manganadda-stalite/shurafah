# 06 — Front‑end Asset Strategy (no Tailwind, no framework)

The static app already ships its own styling and behaviour. We preserve it and add only the
minimum tooling needed for cache‑busting and organisation.

## What stays exactly as it is

| Asset | Current location | Plan |
|-------|------------------|------|
| Inline `<style>` blocks | each HTML file | Stay inline inside the corresponding Blade view/layout. Identical output. |
| Google Fonts (Syne, DM Sans) | `<link>` in `<head>` | Keep the same `<link>` in `partials/front/head.blade.php`. |
| `frontviews/ads.js` | repo root of front | Move to `resources/js/ads.js`, content unchanged, loaded via Vite. |
| `adminviews/theme-manager.js` | admin | `resources/js/admin/theme-manager.js`, unchanged. |
| `adminviews/admin-sidebar.js` | admin | `resources/js/admin/admin-sidebar.js`, unchanged (or port to Blade — see doc 05). |
| `adminviews/admin-topbar.js` | admin | `resources/js/admin/admin-topbar.js`, unchanged. |
| SVG icons (inline) | everywhere | Unchanged. |
| CSS variables / theming (`--accent`, `body.light`, `light-mode`) | inline | Unchanged; `localStorage` keys preserved. |

## Vite (bundling only — NOT a framework)

`vite.config.js` declares the existing JS (and any shared CSS we choose to externalise) as
inputs. We use `@vite([...])` in Blade so files get fingerprinted URLs. We **do not** add
Tailwind, PostCSS frameworks, React/Vue, or rewrite the CSS.

```js
// vite.config.js (illustrative)
import laravel from 'laravel-vite-plugin';
export default {
  plugins: [laravel({
    input: [
      'resources/js/ads.js',
      'resources/js/admin/theme-manager.js',
      'resources/js/admin/admin-sidebar.js',
      'resources/js/admin/admin-topbar.js',
    ],
    refresh: true,
  })],
};
```

> If we prefer **zero build step** initially, the JS files can simply be placed in `public/js/`
> and referenced with `asset('js/ads.js')`. Vite is recommended only for cache‑busting.

## `ads.js` ↔ backend contract

`ads.js` currently hard‑codes `ADS_CONFIG`, `AD_UNITS`, `userType`, and frequency caps. To make
ads server‑controlled (Ads Management admin module) **without changing the look**:

- Expose a tiny endpoint `GET /api/v1/ads/config` returning the same JSON shape `ads.js` already
  expects (`enabled`, `publisherId`, `placements`, `userType`, `frequencyCaps`, `units`).
- On page load, the app sets `window.SHURAFAH_ADS = @json($adsConfig)` (from the Ads service),
  and `ads.js` reads from it with a fallback to its built‑in defaults. The rendering code in
  `ads.js` is untouched.
- `userType` is injected from the authenticated user's account type so premium users see no ads.

## Theming contract

- `theme-manager.js` reads/writes `localStorage.accentColor` and sets `--accent`/`--accent-rgb`.
  Backend only needs to (optionally) persist a user's chosen accent in their profile and echo it
  into the initial `localStorage`/inline style so it survives across devices. The JS is unchanged.
- Dark/light (`adminTheme`, `body.light`) is purely client‑side and stays that way.

## Audio playback

The mini‑player (`.mp`) and detail‑page player are styled in the static HTML. Wiring real audio:

- The Blade renders an `<audio>`/player bound to a **signed streaming URL** from storage.
- A small `player.js` (new, vanilla, ~no styling) drives play/pause/seek and posts a
  `POST /api/v1/songs/{id}/play` event for analytics. It manipulates the **existing** DOM
  elements/classes; it adds no styling.

## CSP / AdSense note

When we add a Content‑Security‑Policy (security doc), the AdSense domains
(`pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`, etc.) and Google Fonts must be
allow‑listed so ads and fonts keep working. See [`07-security-architecture.md`](07-security-architecture.md).
