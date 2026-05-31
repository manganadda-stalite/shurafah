# Module: Core

**Purpose:** Shared foundation every other module depends on. No business domain of its own.

## Provides
- Base Blade layouts (`layouts/front`, `layouts/admin`) and shared partials (head, bottom‑nav,
  mini‑player, search bar, ad‑slot, admin sidebar/topbar).
- Shared front/admin **assets** (`ads.js`, `theme-manager.js`, `admin-sidebar.js`,
  `admin-topbar.js`) and Vite config. (See architecture docs 05 & 06.)
- Base classes: `BaseController`, `BaseService`, base `JsonResource`, base `FormRequest`.
- Cross‑cutting helpers: `formatDuration()`, number abbreviation ("9.2K"), slug helpers.
- Global middleware registration, exception handler, response envelope, API versioning prefix.
- Shared contracts/DTOs used by multiple modules (e.g. `Playable`, `Favouritable` interfaces).

## Static views owned
- `layouts/*`, `partials/*`, all four shared `.js` files.

## Security
- Registers `secure-headers`/CSP, CORS, rate‑limiter definitions, Sanctum config.

## Packages
- (sets up) `laravel/sanctum`, `bepsvpt/secure-headers`, `spatie/laravel-query-builder` base.

## Phase
- **Phase 0–1.**

## Future enhancements
- i18n scaffolding (`lang/`), theme persistence per‑user, design‑token extraction if ever desired.
