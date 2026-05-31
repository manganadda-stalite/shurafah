# Module: Geography

**Purpose:** Nigerian Zone → State → LGA reference data used by registration and profile
(the dependent dropdowns already present in `register_page.html`).

## Static views owned
- (Powers the Zone/State/LGA selects inside `frontviews/register_page.html`.)

## Data / tables
- `zones` (6 geopolitical zones), `states` (36 + FCT), `lgas` (774). Seeded once.

## Web/API endpoints
- `GET /api/v1/zones`
- `GET /api/v1/states?zone_id=` (dependent)
- `GET /api/v1/lgas?state_id=` (dependent)
- Web equivalents return JSON for the existing JS dropdown logic (no design change).

## Services
- `GeographyService` (cached lookups; the lists rarely change so cache aggressively).

## Security
- Public read‑only; cached; rate‑limited.

## Packages
- None beyond core. Seed data shipped in `Database/Seeders`.

## Phase
- **Phase 2** (seed data) so registration in Phase 3 works.

## Future enhancements
- Support additional countries/regions; postal codes; geolocation auto‑detect.
