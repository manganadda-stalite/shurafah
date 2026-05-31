# Module: Premium & Subscriptions

**Purpose:** Paid plans (Naira) that remove ads and unlock premium content, via Nigerian
payment gateways.

## Static views owned
- Admin: `adminviews/shurafah_admin_premium_subscriptions.html` (plans + subscribers).
- Front upsell/paywall surfaces embedded in profile/detail pages.

## Data / tables
- `subscription_plans` (name, price_minor (kobo), currency NGN, interval monthly/yearly,
  features json, is_active).
- `subscriptions` (user_id, plan_id, status, starts_at, ends_at, auto_renew, gateway, ref).
- `payments` (user_id, subscription_id?, gateway, reference unique, amount_minor, status,
  paid_at, raw_payload).

## Web/API endpoints
- `GET /api/v1/plans`, `POST /api/v1/subscriptions` (init payment → returns gateway auth URL/ref),
  `POST /api/v1/subscriptions/verify` `{ reference }`, `GET /api/v1/subscriptions/me`,
  `POST /api/v1/subscriptions/cancel`.
- Webhooks: `POST /api/webhooks/paystack`, `/api/webhooks/flutterwave`.

## Services
- `SubscriptionService` (initiate, activate, expire, cancel), `PaymentService` (gateway adapter:
  Paystack primary, Flutterwave alt), `PremiumGate` (is user premium?).

## Security (critical — see doc 07 §7)
- **Never trust client** "payment success" — verify server‑side via webhook signature + verify
  call before activating premium. Idempotent on `reference`. No card data stored. Amounts in
  minor units. Finance role (`subscriptions.manage`) to view/refund; all actions logged.

## Packages
- `unicodeveloper/laravel-paystack` (primary), Flutterwave client (alt), optional
  `barryvdh/laravel-dompdf` (receipts).

## Phase
- **Phase 17** (after auth, users, and at least one premium‑gated content path exist).

## Future enhancements
- Promo codes/trials, family plans, in‑app purchase (Apple/Google) for the Flutter app,
  proration, dunning/auto‑renew retries.
