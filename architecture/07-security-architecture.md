# 07 — Security Architecture (industry standard)

Goal: meet the product owner's requirement for **industry‑standard security**. This maps to
the **OWASP Top 10**, **OWASP ASVS L2**, and the **OWASP API Security Top 10** for the mobile
API. Every roadmap phase has security acceptance criteria; this is the master reference.

## 1. Authentication

- **End users:** phone + password. Passwords hashed with **bcrypt/argon2id** (Laravel default).
  Phone verified via **OTP** (time‑limited, hashed, single‑use, rate‑limited).
- **Admins:** separate `admin` guard, email + password, **mandatory 2FA (TOTP)** for privileged
  roles, optional IP allow‑listing.
- **Mobile:** **Sanctum personal access tokens**; short‑lived access pattern with the ability to
  revoke tokens per device; logout revokes the current token.
- **Brute force:** Laravel `RateLimiter` on login/OTP (per phone + per IP), exponential lockout,
  generic error messages (no user enumeration).
- **Password policy:** min length, breached‑password check optional, reset via OTP/email with
  signed, expiring links.

## 2. Authorization

- **RBAC** for admins via `spatie/laravel-permission` (roles → permissions), enforced with
  **Policies** + route middleware (`can:`), never inline checks.
- **Resource ownership** for users (a user can only edit their own playlists/profile/comments) —
  enforced in Policies.
- **API object‑level authorization** (OWASP API #1 BOLA): every `/api/v1/{resource}/{id}` checks
  ownership/visibility before returning data.
- **Deny by default**: admin routes require an authenticated admin + explicit permission.

## 3. Input validation & output encoding

- All input validated via **FormRequest** classes (allow‑lists, types, sizes).
- **Mass‑assignment** protection: explicit `$fillable`, never `$guarded = []` on user input.
- **XSS:** Blade `{{ }}` auto‑escaping everywhere; `{!! !!}` forbidden for user content; user
  HTML (comments) sanitised/escaped.
- **SQL injection:** Eloquent/Query Builder bindings only; no raw string interpolation.
- **File uploads (audio/images):** validate MIME + extension + size, store outside webroot on S3,
  randomised names, never trust client filename, scan/transcode in a queue.

## 4. Session, CSRF & transport

- **HTTPS only** (HSTS), secure + `HttpOnly` + `SameSite=Lax/Strict` cookies.
- **CSRF** tokens on all web (session) forms (Laravel default). API uses bearer tokens (CSRF‑exempt).
- **CORS** locked to known origins for the API; Sanctum stateful domains configured.

## 5. HTTP security headers

Via `bepsvpt/secure-headers` (+ optional `spatie/laravel-csp`):
- `Content-Security-Policy` (allow‑list self, Google Fonts, **AdSense** domains, storage/CDN).
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY` (or `frame-ancestors`), `Referrer-Policy`, `Permissions-Policy`.

## 6. Rate limiting & abuse protection

- Per‑route throttles: auth/OTP (tight), general API (per‑user/IP), download endpoints,
  comment posting (anti‑spam), search.
- **Download gating:** signed, expiring URLs; per‑user/day caps for free users (mirrors
  `ads.js` `frequencyCaps.downloadModal`); premium uncapped.

## 7. Payments & PII

- **Never store card data** — delegate to Paystack/Flutterwave (PCI handled by gateway).
- **Verify webhooks** with gateway signatures; verify transactions server‑side before granting
  premium (never trust client "payment success").
- Store only references/amounts/status; encrypt sensitive columns at rest where needed
  (Laravel encrypted casts).
- **PII minimisation:** hash IPs in analytics; restrict who can view user PII (RBAC + activity log).

## 8. Secrets & configuration

- All secrets in `.env` / secret manager — **never committed**. `.env.example` documents keys.
- Separate keys per environment; rotate on exposure.
- `APP_DEBUG=false` in prod; no stack traces to users.

## 9. Auditing & monitoring

- **Activity Logs** (spatie/activitylog) for all admin mutations (who/what/when/before‑after).
- **Error tracking** (Sentry) + structured logs; alert on auth anomalies, webhook failures,
  5xx spikes.
- **Backups** (spatie/laravel-backup) of DB + storage, tested restores.

## 10. Dependency & supply‑chain security

- `composer audit` + `npm audit` in CI; Dependabot/renovate for updates.
- Pin versions; review new packages.

## 11. API‑specific (OWASP API Top 10) for Flutter

| Risk | Control |
|------|---------|
| BOLA / broken object auth | Per‑object policy checks on every endpoint. |
| Broken auth | Sanctum, token revocation, OTP, lockouts. |
| Excessive data exposure | API Resources expose only needed fields; no model dumps. |
| Resource/rate limiting | Throttle middleware per token/IP. |
| Mass assignment | FormRequests + `$fillable`. |
| Security misconfig | Hardened headers, `APP_DEBUG=false`, least‑privilege DB user. |
| Injection | Eloquent bindings, validation. |
| Improper inventory | Versioned API (`/v1`), OpenAPI docs, deprecation policy. |

## Security checklist per phase (Definition of Done)

- [ ] All new inputs validated by FormRequest.
- [ ] All new endpoints/routes have authN + authZ (policy/permission).
- [ ] No secrets/PII in code, logs, or responses.
- [ ] Rate limits applied where relevant.
- [ ] Mutations recorded in activity log (admin) where relevant.
- [ ] Tests cover an unauthorised‑access case.
