# Module: Auth

**Purpose:** Authentication for end users (phone+password) and admins (email+password), OTP
phone verification, password reset, and Sanctum tokens for the Flutter app.

## Static views owned
- `frontviews/login_page.html`, `frontviews/register_page.html`
  (register has Zone/State/LGA selects + phone + password — see Geography & Users).
- `adminviews/shurafah_admin_auth.html` (admin login).

## Data / tables
- Uses `users`, `admin_users`, `personal_access_tokens`, `password_reset_tokens`, `otp_codes`.

## Web routes
| Route | Page |
|-------|------|
| `GET /login`, `POST /login` | user login (phone+password) |
| `GET /register`, `POST /register` | user registration |
| `POST /logout` | logout |
| `GET /forgot-password`, `POST …` | request reset (OTP/email) |
| `GET /reset-password`, `POST …` | reset |
| `GET /admin/login`, `POST /admin/login` | admin login (separate guard) |

## API endpoints (`/api/v1/auth`)
- `register`, `verify-otp`, `resend-otp`, `login`, `logout`, `forgot-password`,
  `reset-password`, `GET me`.

## Services
- `AuthService` (register, login, issueToken, logout), `OtpService` (generate/verify, rate‑limited),
  `PasswordResetService`.

## Security (see doc 07)
- Hashed passwords (argon2id/bcrypt), OTP hashed + single‑use + expiring, rate limiting per
  phone+IP, generic errors (no enumeration), admin 2FA (TOTP), separate `admin` guard, Sanctum
  token revocation per device.

## Packages
- `laravel/sanctum`, optional `laravel/fortify` (headless), `pragmarx/google2fa-laravel` (admin 2FA),
  SMS/OTP provider SDK (Termii/Twilio).

## Phase
- **Phase 3** (user web+api auth), admin auth in **Phase 13**.

## Future enhancements
- Social login, WhatsApp OTP, passkeys/WebAuthn, device/session management UI.
