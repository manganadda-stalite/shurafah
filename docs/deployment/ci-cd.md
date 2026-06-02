# Deployment & CI/CD Pipeline

## Overview

This document specifies the **Continuous Integration** and **Continuous Deployment** strategy for Shurafah. Every push to a branch triggers tests; merges to `main` auto-deploy to staging; tagged releases deploy to production with manual approval.

---

## 1. CI/CD Architecture

```
┌─────────────────┐
│ Developer Push  │
│  (any branch)   │
└────────┬────────┘
         ↓
    ┌────────────────────┐
    │ GitHub Actions CI  │  (pint, larastan, tests, audits)
    │   (always runs)    │
    └────────┬───────────┘
             ↓
      ┌──────────────┐
      │ CI Passed?   │
      └───┬────────┬─┘
          │ NO     │ YES
          ↓       ↓
       BLOCK     OK to merge
              (require review)
                 ↓
        ┌────────────────┐
        │ Merge to main  │
        └────────┬───────┘
                 ↓
        ┌─────────────────────┐
        │ Build Docker Image  │
        │ Deploy to Staging   │
        │ Run migrations      │
        └────────┬────────────┘
                 ↓
        ┌─────────────────────┐
        │ Create Git Tag      │
        │ (manual / trigger)  │
        └────────┬────────────┘
                 ↓
        ┌─────────────────────┐
        │ Deploy to Prod      │
        │ (manual approval)   │
        └─────────────────────┘
```

---

## 2. GitHub Actions Workflows

### 2.1 CI Workflow (`.github/workflows/tests.yml`)

Runs on every push and pull request. Tests code quality, style, static analysis, and unit/feature tests.

```yaml
name: CI

on:
  push:
    branches: [ main, 'feat/**', 'fix/**' ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: shurafah_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: bcmath,ctype,fileinfo,json,mbstring,openssl,pdo,pdo_mysql,tokenizer,xml
          tools: composer:v2
        env:
          COMPOSER_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Get composer cache directory
        id: composer-cache
        run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT

      - uses: actions/cache@v3
        with:
          path: ${{ steps.composer-cache.outputs.dir }}
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress --no-suggest

      - name: Setup Environment
        run: |
          cp .env.example .env
          php artisan key:generate

      - name: Create Database
        run: php artisan migrate --env=testing
        env:
          DB_HOST: 127.0.0.1
          DB_DATABASE: shurafah_test
          DB_USERNAME: root
          DB_PASSWORD: root

      - name: Run Pint (Code Style)
        run: vendor/bin/pint --test

      - name: Run Larastan (Static Analysis)
        run: vendor/bin/larastan analyse --level=5 app Modules

      - name: Run Tests
        run: vendor/bin/pest --ci
        env:
          DB_HOST: 127.0.0.1
          DB_DATABASE: shurafah_test
          DB_USERNAME: root
          DB_PASSWORD: root

      - name: Run Composer Audit
        run: composer audit

      - name: Report Test Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
          fail_ci_if_error: false
```

### 2.2 Build & Deploy Staging (`.github/workflows/deploy-staging.yml`)

Builds Docker image and deploys to staging when `main` branch is updated.

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_REGISTRY }}/shurafah:latest
            ${{ secrets.DOCKER_REGISTRY }}/shurafah:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Staging
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          port: ${{ secrets.STAGING_PORT }}
          script: |
            cd /var/www/shurafah-staging
            docker pull ${{ secrets.DOCKER_REGISTRY }}/shurafah:latest
            docker-compose down
            docker-compose up -d
            docker-compose exec -T app php artisan migrate --force
            docker-compose exec -T app php artisan cache:clear
            docker-compose exec -T app php artisan config:cache
            docker-compose exec -T app php artisan route:cache
            docker-compose exec -T app php artisan view:cache

      - name: Notify Slack (Staging Deployed)
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Shurafah deployed to staging",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment Successful*\nCommit: <${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

### 2.3 Production Deployment (`.github/workflows/deploy-production.yml`)

Deploys to production **on tagged release** with manual approval requirement.

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  approve:
    runs-on: ubuntu-latest
    environment:
      name: Production
      url: https://shurafah.app
    steps:
      - name: Approval Gate
        run: echo "Deployment approved by ${{ github.actor }}"

  deploy:
    runs-on: ubuntu-latest
    needs: approve

    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.ref }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_REGISTRY }}/shurafah:${{ github.ref_name }}
            ${{ secrets.DOCKER_REGISTRY }}/shurafah:latest-prod
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Production (Zero-Downtime)
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          port: ${{ secrets.PROD_PORT }}
          script: |
            cd /var/www/shurafah-prod
            
            # Pull new image
            docker pull ${{ secrets.DOCKER_REGISTRY }}/shurafah:${{ github.ref_name }}
            
            # Create backup
            docker-compose exec -T app php artisan backup:run --only-db
            
            # Run migrations (inside container, zero-downtime)
            docker-compose exec -T app php artisan migrate --force
            
            # Update image in docker-compose.yml
            sed -i 's|image: .*shurafah.*|image: ${{ secrets.DOCKER_REGISTRY }}/shurafah:${{ github.ref_name }}|' docker-compose.yml
            
            # Rolling restart (one container at a time)
            docker-compose up -d --no-deps --build app
            
            # Clear caches
            docker-compose exec -T app php artisan cache:clear
            docker-compose exec -T app php artisan config:cache
            docker-compose exec -T app php artisan route:cache
            docker-compose exec -T app php artisan view:cache
            
            # Health check
            sleep 5
            curl -f http://localhost/up || exit 1

      - name: Notify Slack (Production Deployed)
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Shurafah deployed to production",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment Successful*\nVersion: ${{ github.ref_name }}\nCommit: <${{ github.server_url }}/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK

      - name: Notify Slack (Deployment Failed)
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Shurafah production deployment failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Failed*\nVersion: ${{ github.ref_name }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Details>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          SLACK_WEBHOOK_TYPE: INCOMING_WEBHOOK
```

### 2.4 Security Scan (`.github/workflows/security.yml`)

Optional: Runs security checks on dependencies and container images.

```yaml
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  composer-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          tools: composer:v2

      - name: Install dependencies
        run: composer install --no-progress

      - name: Composer Audit
        run: composer audit --format=json > composer-audit.json || true

      - name: Upload audit report
        uses: actions/upload-artifact@v3
        with:
          name: composer-audit
          path: composer-audit.json

  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: NPM Audit
        run: npm audit --audit-level=high || true

  container-scan:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t shurafah:scan .

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: shurafah:scan
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## 3. Environment Setup & Secrets

### GitHub Actions Secrets Required

In repository Settings → Secrets and variables → Actions, add:

```
DOCKER_USERNAME              # Docker Hub username
DOCKER_PASSWORD              # Docker Hub PAT
DOCKER_REGISTRY              # e.g., docker.io/myusername

STAGING_HOST                 # Staging server IP/domain
STAGING_USER                 # SSH username
STAGING_PORT                 # SSH port (default 22)
STAGING_SSH_KEY              # Private SSH key

PROD_HOST                    # Production server IP/domain
PROD_USER                    # SSH username
PROD_PORT                    # SSH port (default 22)
PROD_SSH_KEY                 # Private SSH key

SLACK_WEBHOOK_URL            # For deployment notifications

CODECOV_TOKEN                # For coverage reporting (optional)
```

### .env.example (Documented for all environments)

Update `.env.example` to document all required keys:

```bash
# Application
APP_NAME=Shurafah
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost
APP_TIMEZONE=UTC

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shurafah
DB_USERNAME=root
DB_PASSWORD=

# Cache & Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Storage (S3)
FILESYSTEM_DISK=local
S3_KEY=
S3_SECRET=
S3_REGION=us-east-1
S3_BUCKET=
S3_URL=
S3_ENDPOINT=

# Sanctum (API Authentication)
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SANCTUM_ENCRYPT_COOKIES=true

# SMS/OTP Provider
SMS_PROVIDER=termii  # or twilio
SMS_TERMII_API_KEY=
SMS_TERMII_SENDER_ID=
SMS_TWILIO_ACCOUNT_SID=
SMS_TWILIO_AUTH_TOKEN=
SMS_TWILIO_PHONE=

# Payments
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=

# Firebase/FCM (Push Notifications)
FIREBASE_PROJECT_ID=
FIREBASE_SECRET=
FCM_SERVER_KEY=

# Monitoring
SENTRY_LARAVEL_DSN=
SENTRY_ENVIRONMENT=local

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

---

## 4. Deployment Checklist

### Pre-Staging Deployment

- [ ] All tests passing on CI
- [ ] Code review approved (at least 1 approval)
- [ ] No new security vulnerabilities (composer/npm audit)
- [ ] PR description updated with migration notes

### Pre-Production Deployment

- [ ] Staging deployment successful and tested
- [ ] Database migrations reviewed (reversible)
- [ ] Environment variables documented
- [ ] Secrets rotated (if applicable)
- [ ] Backup verified (database + storage)
- [ ] Rollback plan documented
- [ ] At least 2 approvals from senior team members

### Post-Deployment

- [ ] Health check passes (`/up` endpoint)
- [ ] Key functionality tested (login, payment, playback)
- [ ] Error tracking (Sentry) monitored for new errors
- [ ] Performance metrics monitored (response times, queue depth)
- [ ] Notification sent to stakeholders

---

## 5. Rollback Procedure

If production deployment fails:

```bash
# SSH into production server
ssh user@prod-host

cd /var/www/shurafah-prod

# Revert docker-compose.yml to previous image
sed -i 's|image: .*shurafah.*|image: docker.io/myusername/shurafah:previous-tag|' docker-compose.yml

# Restart containers
docker-compose up -d --no-deps app

# Verify health
curl -f http://localhost/up

# Clear caches
docker-compose exec -T app php artisan cache:clear
```

Or, restore from database backup:

```bash
# List available backups
docker-compose exec -T app php artisan backup:list

# Restore from specific backup
docker-compose exec -T app php artisan backup:restore --backup-date=2026-06-02

# Restart app
docker-compose restart app
```

---

## 6. Monitoring & Alerts

### Key Metrics to Monitor

1. **Application Health**
   - HTTP 5xx errors (Sentry)
   - Response time p95 (APM)
   - Database query slow log

2. **Queue Health**
   - Job failure rate
   - Queue depth (critical if > 10k)

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk space
   - Network throughput

4. **Business Metrics**
   - Payment success rate (target: > 95%)
   - Ad fill rate
   - Daily active users (DAU)

### Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| HTTP 5xx rate | > 1% | Page on-call |
| Queue depth | > 10,000 | Investigate |
| Database CPU | > 80% | Scale up |
| Disk usage | > 85% | Clean up / expand |
| Payment failures | > 5% | Notify finance |

---

## 7. Release Process

### Creating a Release

1. **Code Freeze**: No new features in `main` after release branch created
2. **Version Bump**: Update `composer.json` and `.env.example`
3. **Changelog**: Document changes in `CHANGELOG.md`
4. **Tag Creation**: `git tag -a v0.1.0 -m "Release 0.1.0"`
5. **Push Tag**: `git push origin v0.1.0`
6. **Approve Deployment**: GitHub Actions will pause for manual approval
7. **Verify**: Check logs and staging environment

### Hotfix Process

For urgent production fixes:

```bash
# Create hotfix branch from latest tag
git checkout -b hotfix/critical-bug v0.1.0

# Fix the issue
# ... code changes ...

# Create PR to main
# ... merge after tests pass ...

# Tag hotfix version
git tag -a v0.1.1 -m "Hotfix: Critical bug"
git push origin v0.1.1

# Approve production deployment
```

---

## 8. Docker Setup

### Dockerfile

```dockerfile
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    libfreetype-dev \
    zip \
    unzip \
    git \
    curl

# Install PHP extensions
RUN docker-php-ext-install -j$(nproc) \
    bcmath \
    ctype \
    fileinfo \
    json \
    mbstring \
    pdo_mysql \
    tokenizer \
    xml

# Set working directory
WORKDIR /var/www/app

# Copy composer files
COPY composer.json composer.lock ./

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-dev --no-interaction --prefer-dist

# Copy application code
COPY . .

# Build assets
RUN npm install && npm run build

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9000/ping || exit 1

EXPOSE 9000

CMD ["php-fpm"]
```

### docker-compose.yml (Staging / Production Template)

```yaml
version: '3.8'

services:
  app:
    image: docker.io/myusername/shurafah:latest
    restart: always
    environment:
      - APP_ENV=staging
      - DB_HOST=mysql
      - REDIS_HOST=redis
    volumes:
      - app-storage:/var/www/app/storage
      - app-bootstrap:/var/www/app/bootstrap/cache
    depends_on:
      - mysql
      - redis
    networks:
      - shurafah-network

  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - shurafah-network

  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - shurafah-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - app-storage:/var/www/app/storage:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - shurafah-network

  queue-worker:
    image: docker.io/myusername/shurafah:latest
    restart: always
    command: php artisan queue:work redis --sleep=3 --tries=3
    environment:
      - APP_ENV=staging
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - shurafah-network

  scheduler:
    image: docker.io/myusername/shurafah:latest
    restart: always
    command: php artisan schedule:work
    environment:
      - APP_ENV=staging
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis
    networks:
      - shurafah-network

volumes:
  mysql-data:
  app-storage:
  app-bootstrap:

networks:
  shurafah-network:
    driver: bridge
```

---

## 9. Troubleshooting

### CI Pipeline Fails

**Pint style errors**
```bash
vendor/bin/pint --fix
git add .
git commit -m "style: fix code style"
```

**Larastan static analysis errors**
```bash
vendor/bin/larastan analyse --level=5 app Modules
# Fix issues or update baseline
```

**Test failures**
```bash
vendor/bin/pest --verbose
# Debug and fix failing tests
```

### Staging Deployment Fails

```bash
# Check logs
docker-compose logs app

# Check database migrations
docker-compose exec app php artisan migrate:status

# Rollback if needed
docker-compose exec app php artisan migrate:rollback
```

### Production Health Check Fails

```bash
# SSH into production
ssh user@prod-host

# Check HTTP response
curl -v http://localhost/up

# Check PHP-FPM
docker-compose exec app php artisan tinker
# In tinker: echo 'OK';
```

---

## 10. Security Checklist

- [ ] GitHub Actions secrets never printed in logs
- [ ] SSH keys restricted to deploy user (no root)
- [ ] Docker images scanned for vulnerabilities (Trivy)
- [ ] Environment-specific secrets (test keys vs. prod keys)
- [ ] Migrations reversible and tested
- [ ] Database backups encrypted and tested
- [ ] Rollback procedures documented and tested
- [ ] Deployment logs aggregated (no sensitive data)

