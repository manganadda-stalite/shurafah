# 09 — Environments, Deployment & Operations

## Environments

| Env | Purpose | DB | Storage | Gateways |
|-----|---------|----|---------|----------|
| **local** | Dev on a laptop | MySQL (Docker) | MinIO / `local` disk | Paystack **test** keys |
| **CI** | Automated tests | SQLite/MySQL service | array/local | mocked |
| **staging** | Pre‑prod QA | managed MySQL | S3 (staging bucket) | Paystack **test** |
| **production** | Live | managed MySQL (HA) | S3 + CDN | Paystack **live** |

`.env.example` documents every key (DB, Redis, S3, Sanctum, Paystack/Flutterwave, FCM, SMS/OTP,
Sentry, mail). Secrets never committed.

## Local setup (Phase 0 delivers this)

Recommended **Laravel Sail** (Docker) so every dev gets MySQL + Redis + MinIO + Mailpit with one
command:
```
git clone … && cd shurafah
cp .env.example .env
composer install
./vendor/bin/sail up -d
sail artisan key:generate
sail artisan migrate --seed
sail npm install && sail npm run dev      # Vite (assets only, no Tailwind)
```
App: `http://localhost`. Admin: `http://localhost/admin`.

## Running services

- **App**: Nginx + PHP‑FPM (or FrankenPHP/Octane later).
- **Queue workers**: `php artisan queue:work` (Redis) under Supervisor/systemd — transcoding,
  emails, push, analytics roll‑ups.
- **Scheduler**: `php artisan schedule:run` every minute (cron) — trending recompute,
  subscription expiry, backups, daily stats.
- **Cache/Sessions**: Redis.

## CI/CD pipeline (GitHub Actions)

1. **CI** on every PR: `composer install`, `pint --test`, `larastan`, `pest`/`phpunit`,
   `composer audit`, `npm audit`. (A minimal CI workflow is added in Phase 0.)
2. **Build**: build assets (`npm run build`), build Docker image.
3. **Deploy**: to staging on merge to `main`; to production on tagged release (manual approval).
   Run `php artisan migrate --force` + `config:cache route:cache view:cache` on deploy.
4. **Zero‑downtime**: atomic symlinked releases (Deployer/Envoyer) or rolling container deploy.

## Observability & resilience

- **Health checks**: `/up` (Laravel) + DB/Redis/storage checks.
- **Logs**: structured JSON to stdout/centralised logging.
- **Errors**: Sentry.
- **Backups**: nightly DB + storage (spatie/laravel-backup), offsite, restore drills.
- **Metrics**: queue depth, response times, payment success rate, ad fill, DAU/MAU.

## Storage & media delivery

- Audio + images on S3‑compatible storage; served via **CDN** with **signed/temporary URLs**.
- Optional HLS transcoding pipeline (ffmpeg in a queue job) for adaptive streaming later.

## Scaling path

1. Single server (Sail/VPS) for MVP.
2. Separate DB (managed) + Redis + object storage.
3. Horizontal app instances behind a load balancer (stateless; sessions/cache in Redis).
4. Octane/FrankenPHP for throughput; read replicas; CDN for media; search via Meilisearch.
