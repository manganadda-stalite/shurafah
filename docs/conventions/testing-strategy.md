# Testing Strategy

We use **Pest** (or PHPUnit) with Laravel's testing helpers. Every phase ships tests.

## Test types
- **Unit** — services, value objects, helpers (no DB where possible).
- **Feature/HTTP** — routes, controllers, validation, authz, JSON shape. Use
  `RefreshDatabase`, factories, and Sanctum `actingAs`.
- **Policy/authorization** — each protected action has an unauthorised‑access test (negative test).
- **API contract** — assert resource JSON structure + pagination envelope; keep OpenAPI in sync.

## What every feature phase must cover
1. Happy path (web + API where both exist).
2. Validation failures (422 with expected error keys).
3. AuthN required (401/redirect) and AuthZ enforced (403) — at least one negative case.
4. Data scoping (a user cannot read/modify another user's resource).
5. Edge cases noted in the phase doc (empty states, premium gating, rate limits).

## Security‑oriented tests
- Mass‑assignment cannot set protected fields.
- Premium‑only content blocked for free users.
- Download/stream URLs are signed and expire.
- Payment activation only after server‑side verification (mock gateway).

## Tooling
- Factories + seeders for realistic data (reuse demo seeders).
- HTTP fakes for gateways/SMS/FCM; never hit real third parties in tests.
- Coverage tracked (target meaningful coverage on services + controllers, not a vanity %).
- CI runs the full suite on every PR.

## Manual/visual checks (UI phases)
- Screenshot diff of the rendered Blade page vs the original static HTML to prove **no design
  change**. Verify dark/light + accent‑color still work.
