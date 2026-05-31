# Phase 17 — Premium & Subscriptions (Payments)

**Goal:** Users subscribe to Premium (Naira) via Paystack/Flutterwave; premium removes ads and
unlocks premium‑only content; admins manage plans and view subscribers.

**Why now:** Monetisation, after there is content worth paying for.

## Scope
**In:** `subscription_plans`, `subscriptions`, `payments`; subscribe flow (init→verify), webhooks,
premium gating, `shurafah_admin_premium_subscriptions.html` (plans + subscribers + refunds).
**Out:** In‑app purchase (Apple/Google) for Flutter (future), promo codes (future).

## Prerequisites
- Phase 4 (users), Phase 13 (admin), Phase 9 (premium gating hooks).

## Tasks
- [ ] Plan management (admin) + public `GET /plans`.
- [ ] `SubscriptionService` (initiate/activate/expire/cancel), `PaymentService` (Paystack primary,
  Flutterwave alt), `PremiumGate`.
- [ ] `POST /subscriptions` (init → gateway URL/ref), `POST /subscriptions/verify`,
  `GET /subscriptions/me`, `POST /subscriptions/cancel`.
- [ ] Webhooks (`/webhooks/paystack`, `/webhooks/flutterwave`): signature‑verified, idempotent.
- [ ] Scheduled job: expire subscriptions; flip `account_type`/`premium_expires_at`.
- [ ] Admin subscribers list + refund (finance role).

## Packages
- `unicodeveloper/laravel-paystack` (+ Flutterwave client), optional `barryvdh/laravel-dompdf`.

## Security (DoD — critical, see architecture/07 §7)
- **Never trust client success** — verify via webhook signature + verify call before activating;
  idempotent on `reference`; no card data stored; amounts in kobo; finance‑only management; logged.

## Tests
- Init→verify activates premium (mock gateway); webhook idempotency; tampered webhook rejected;
  expiry job downgrades; premium‑only content unlocks for premium; ads disabled for premium.

## Definition of Done
- [ ] End‑to‑end subscribe (test keys) activates premium; gating works; security tests green.
