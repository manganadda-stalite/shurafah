# Phase 3 — User Authentication

**Goal:** End users can register (phone + password + Zone/State/LGA), verify via OTP, log in,
log out, and reset their password — on **both** the web (Blade) and the API (Sanctum).

**Why now:** The first interactive capability; everything personalised depends on it.

## Scope
**In:** Registration, OTP verify/resend, login, logout, forgot/reset password; Sanctum tokens;
bind `login_page.html` + `register_page.html`; geography dropdown endpoints.
**Out:** Admin auth (Phase 13), profile editing (Phase 4), social login.

## Prerequisites
- Phase 2 (`users`, geography, OTP tables).

## Tasks
- [ ] Web: `Web\Auth\{Register,Login,Password}Controller` rendering the existing pages; wire forms.
- [ ] API: `/api/v1/auth/*` (register, verify‑otp, resend‑otp, login, logout, forgot/reset, me).
- [ ] `AuthService`, `OtpService` (hashed, single‑use, expiring), SMS/OTP provider integration.
- [ ] FormRequests with full validation (phone format/uniqueness, password policy, geography ids).
- [ ] Sanctum token issue/revoke; `auth:sanctum` middleware on protected API routes.
- [ ] Geography dropdown endpoints (`/zones`, `/states`, `/lgas`) feeding existing JS selects.
- [ ] Rate limiting on login/OTP/forgot (per phone + IP); generic error messages.

## Packages
- `laravel/sanctum`, optional `laravel/fortify`, SMS SDK (Termii/Twilio).

## Security (DoD — see architecture/07)
- Hashed passwords; OTP hashed/expiring/single‑use; throttling + lockout; no user enumeration;
  HTTPS‑only cookies; tokens revocable per device.

## Tests
- Register → OTP → login happy path (web + API); validation failures (422); wrong OTP/password;
  rate‑limit triggers; token required on a protected route (401).

## Definition of Done
- [ ] A user can register and log in on web and API; design unchanged.
- [ ] Negative/security tests pass; rate limits enforced.
