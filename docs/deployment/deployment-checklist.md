# Deployment Checklist & Runbook

## Pre-Deployment Checklist

### Code Quality (CI Pipeline)
- [ ] All tests passing (Pest/PHPUnit)
- [ ] Pint code style clean (PSR-12)
- [ ] Larastan static analysis level 5+
- [ ] Composer audit passes (no critical vulnerabilities)
- [ ] NPM audit passes (no critical vulnerabilities)
- [ ] Code review approved (≥1 reviewer)

### Database Migrations
- [ ] All migration files created in `Modules/*/Database/Migrations/`
- [ ] Migration names follow convention: `2026_06_02_100000_create_<table>_table.php`
- [ ] Migrations tested locally (`php artisan migrate`)
- [ ] Rollback tested (`php artisan migrate:rollback`)
- [ ] No data loss on rollback
- [ ] Foreign keys properly indexed

### Environment Configuration
- [ ] `.env.example` updated with all new keys
- [ ] Staging `.env` file configured
- [ ] Production `.env` file configured
- [ ] All secrets in GitHub Actions secrets (not in code)
- [ ] Database connection tested
- [ ] Redis connection tested
- [ ] S3/Storage connection tested

### Assets & Frontend
- [ ] `npm run build` succeeds
- [ ] Asset fingerprinting works (`@vite`)
- [ ] CSS/JS loads correctly in browser
- [ ] No console errors in DevTools
- [ ] Responsive design tested on mobile/tablet/desktop
- [ ] Dark mode toggle works (if applicable)

### Documentation
- [ ] `CHANGELOG.md` updated with changes
- [ ] API endpoints documented (if new endpoints added)
- [ ] Database schema changes documented
- [ ] Breaking changes documented
- [ ] Migration instructions documented

---

## Staging Deployment Runbook

### Trigger

1. Push to `main` branch (typically via PR merge)
2. GitHub Actions automatically starts: `.github/workflows/deploy-staging.yml`
3. Steps auto-execute (no manual intervention needed)

### What Happens Automatically

```bash
1. Docker image built and pushed to registry
2. SSH to staging server
3. Docker image pulled and run
4. Database migrations executed (php artisan migrate --force)
5. Caches cleared and rebuilt
6. Health check verified
7. Slack notification sent
```

### Verify Staging Deployment

```bash
# SSH to staging server
ssh deploy@staging-server

# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f app

# Run health check
curl http://staging.shurafah.app/up

# Test key functionality
curl -X POST http://staging.shurafah.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "08012345678", "password": "test", "device_name": "curl"}'

# Check database
docker-compose exec mysql mysql -u root -p$DB_PASSWORD $DB_DATABASE -e "SHOW TABLES;"
```

### Rollback Staging

If staging deployment breaks:

```bash
# SSH to staging
ssh deploy@staging-server
cd /var/www/shurafah-staging

# View previous images
docker images | grep shurafah

# Update docker-compose.yml to use previous image
vim docker-compose.yml
# Change: image: docker.io/myusername/shurafah:abc123def456

# Restart
docker-compose up -d

# Verify
curl http://staging.shurafah.app/up
```

---

## Production Deployment Runbook

### Trigger

1. Create a Git tag: `git tag -a v0.1.0 -m "Release 0.1.0"`
2. Push tag: `git push origin v0.1.0`
3. GitHub Actions starts: `.github/workflows/deploy-production.yml`
4. **Manual Approval Required**: Workflow pauses; team lead reviews and approves
5. Deployment proceeds automatically

### Manual Approval Process

```
In GitHub:
1. Go to Actions tab
2. Find "Deploy to Production" workflow run
3. Click "Review deployments"
4. Click "Approve and deploy"
5. Add comment (optional): e.g., "Deploying v0.1.0"
6. Confirm
```

### What Happens Automatically (During Production Deployment)

```bash
1. Docker image built with production tag (v0.1.0)
2. SSH to production server
3. Database backup created (php artisan backup:run)
4. Database migrations executed
5. Docker image pulled and run (rolling restart, no downtime)
6. Application caches cleared and rebuilt
7. Health check verified
8. Slack notification sent
```

### Verify Production Deployment

```bash
# SSH to production
ssh deploy@prod-server

# Check running containers
docker-compose ps

# Check logs (last 50 lines)
docker-compose logs --tail=50 app

# Run health check
curl https://shurafah.app/up

# Test key functionality
curl -X POST https://shurafah.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "08012345678", "password": "test", "device_name": "curl"}'

# Check Sentry for new errors
# Go to: https://sentry.io/organizations/shurafah/issues/

# Monitor queue depth
docker-compose exec app redis-cli INFO stats
```

### Zero-Downtime Deployment Strategy

Production uses **rolling restart**:

1. **Blue-Green (simulated)**:
   - Old container (blue) serving traffic
   - New image pulled
   - New container (green) started
   - Health check verifies green
   - Traffic switched to green
   - Old container stopped

2. **With Load Balancer** (future scaling):
   - Remove instance from load balancer
   - Update and restart
   - Add back to load balancer
   - Repeat for each instance

3. **Expected Downtime**: ~30 seconds (container restart time)

---

## Rollback Procedures

### Rollback from Staging

```bash
ssh deploy@staging-server
cd /var/www/shurafah-staging

# View git history
git log --oneline -10

# Revert to previous commit
git revert HEAD
git push origin main

# Or, manually update image tag
sed -i 's|image: docker.io/myusername/shurafah:new|image: docker.io/myusername/shurafah:old|' docker-compose.yml
docker-compose up -d

# Verify
curl http://staging.shurafah.app/up
```

### Rollback from Production

**Critical Bug** (within 10 minutes):

```bash
ssh deploy@prod-server
cd /var/www/shurafah-prod

# Get previous tag
git tag --sort=-creatordate | head -5

# Checkout previous version
git checkout v0.0.9

# Update image
sed -i 's|image: docker.io/myusername/shurafah:v0.1.0|image: docker.io/myusername/shurafah:v0.0.9|' docker-compose.yml

# Restart
docker-compose up -d

# Verify
curl https://shurafah.app/up

# Notify team on Slack
```

**Data Corruption** (restore from backup):

```bash
ssh deploy@prod-server
cd /var/www/shurafah-prod

# List available backups
docker-compose exec app php artisan backup:list

# Restore from specific backup (e.g., 1 hour ago)
docker-compose exec app php artisan backup:restore --backup-date=2026-06-02-10:00

# Stop app during restore
docker-compose pause app

# Perform restore
docker-compose exec mysql mysql -u root -p$DB_PASSWORD $DB_DATABASE < backup.sql

# Resume app
docker-compose unpause app

# Verify
curl https://shurafah.app/up
```

---

## Database Migration Safety

### Best Practices

1. **Reversible Migrations**
   ```php
   // Good
   Schema::create('songs', function (Blueprint $table) { ... });
   Schema::drop('songs');
   
   // Bad
   DB::statement('DROP TABLE songs;');
   // No way to reverse!
   ```

2. **Data Migrations (Large Tables)**
   ```php
   // Bad: Locks table during migration
   Schema::table('songs', function (Blueprint $table) {
       $table->string('new_field')->default('old');
   });
   
   // Good: Backfilled via job
   Schema::table('songs', function (Blueprint $table) {
       $table->string('new_field')->nullable();
   });
   BackfillSongsNewField::dispatch();
   ```

3. **Test Rollbacks Locally**
   ```bash
   php artisan migrate
   php artisan migrate:rollback
   # Verify no errors and schema is correct
   ```

### Migration Deployment Process

1. Merge PR to `main` (triggers staging deployment)
2. Test migrations on staging (`php artisan migrate:status`)
3. Create and test rollback plan
4. Tag release (`git tag v0.1.0`)
5. Request approval in GitHub Actions
6. Production deploys with: `php artisan migrate --force`
7. Verify: `curl https://shurafah.app/up`

---

## Performance Monitoring During Deployment

### Key Metrics

| Metric | Baseline | Alert Threshold |
|--------|----------|------------------|
| HTTP 5xx errors | < 0.1% | > 1% |
| p95 response time | < 500ms | > 2s |
| Queue depth | < 100 | > 10,000 |
| Database queries/sec | ~50 | > 200 |
| CPU usage | 30-40% | > 70% |
| Memory usage | 50-60% | > 80% |

### Real-Time Monitoring

```bash
# Watch error rate (Sentry API)
curl -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  https://sentry.io/api/0/projects/shurafah/latest-event-count/?resolution=1m

# Watch application logs
docker-compose logs -f app | grep -E "ERROR|CRITICAL"

# Watch queue depth
watch -n 1 'docker-compose exec redis redis-cli INFO stats | grep processed'

# Watch database slow queries
docker-compose exec mysql mysql -u root -p$DB_PASSWORD \
  -e "SELECT TIME, SQL_TEXT FROM INFORMATION_SCHEMA.PROCESSLIST WHERE TIME > 5;"
```

---

## Incident Response

### High Error Rate (> 1%)

```
1. Check Sentry for common error
2. If deployment-related: initiate rollback
3. If data-related: investigate database logs
4. Notify team on Slack: #incidents channel
5. Document issue in runbook for future reference
```

### Queue Backlog (> 10k jobs)

```
1. SSH to production
2. Scale queue workers: docker-compose up -d --scale queue-worker=5
3. Monitor: watch -n 5 'docker-compose exec redis redis-cli INFO stats'
4. When cleared: scale back to normal
```

### Database Slow Queries

```
1. Enable slow query log
2. Analyze query execution plans (EXPLAIN)
3. Add indexes if needed
4. Test locally and create migration
5. Deploy index migration during off-peak hours
```

---

## Post-Deployment Checklist

- [ ] Health check passes (curl /up)
- [ ] Login functionality works
- [ ] Payment integration tested (test gateway)
- [ ] Audio playback tested (signed URL accessible)
- [ ] Admin panel accessible
- [ ] No new errors in Sentry
- [ ] Performance metrics within baseline
- [ ] Queue depth normal
- [ ] Backups completed successfully
- [ ] Team notified on Slack

---

## Contacts & Escalation

| Role | Person | Slack | On-Call |
|------|--------|-------|----------|
| Tech Lead | @name | #tech-leads | Yes |
| DevOps | @name | #devops | Yes |
| Product Manager | @name | #product | No |
| Finance (for payments) | @name | #finance | No |

---

## Additional Resources

- Sentry: https://sentry.io/organizations/shurafah/issues/
- GitHub Actions: https://github.com/manganadda-stalite/shurafah/actions
- Docker Hub: https://hub.docker.com/r/myusername/shurafah
- Staging: https://staging.shurafah.app
- Production: https://shurafah.app
