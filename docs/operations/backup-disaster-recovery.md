# Backup & Disaster Recovery

## Overview

This document defines backup procedures, recovery processes, and disaster recovery (DR) plans for Shurafah.

---

## 1. Backup Strategy

### Backup Types

| Type | Frequency | Retention | Location | Purpose |
|------|-----------|-----------|----------|----------|
| **Database** | Daily (automated) | 30 days | S3 + Local | Full data recovery |
| **Application Code** | Per commit | ∞ | Git repo | Code history |
| **User Uploads** | Continuous | 30 days | S3 versioning | Media recovery |
| **Configuration** | Weekly | 30 days | S3 + Git | Config restore |
| **Logs** | Daily | 7 days | CloudWatch/S3 | Audit trail |

### RTO & RPO Targets

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|------|---|
| **Database corruption** | 2 hours | 1 hour (latest daily backup) |
| **User uploaded file deleted** | 30 minutes | 24 hours (S3 versioning) |
| **Application code corrupted** | 15 minutes | < 1 minute (Git + CI/CD) |
| **Complete site outage** | 4 hours | 1 hour (full backup restore) |
| **Data center failure** | 24 hours | 1 hour (geo-redundant backup) |

---

## 2. Database Backup

### Automated Daily Backup (Spatie Laravel Backup)

```php
// composer require spatie/laravel-backup

// config/backup.php
return [
    'backup' => [
        'name' => env('APP_NAME', 'Laravel'),
        'source' => [
            'files' => [
                'include' => [
                    base_path(),
                ],
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                    base_path('storage/logs'),
                    base_path('.git'),
                ],
            ],
            'databases' => [
                'mysql',  // Backs up 'mysql' connection from config/database.php
            ],
        ],
    ],

    'backup' => [
        'output' => 'disks' => ['s3'],  // Send to S3
    ],

    'cleanup' => [
        'enabled' => true,
        'deleteOldBackups' => true,
        'keep' => [
            'dailyBackups' => 7,
            'weeklyBackups' => 4,
            'monthlyBackups' => 12,
            'yearlyBackups' => 2,
        ],
    ],
];

// Schedule in app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // Daily backup at 2 AM UTC
    $schedule->command('backup:run --only-db')
        ->dailyAt('02:00')
        ->onOneServer()
        ->then(function () {
            Log::info('Database backup completed');
        })
        ->onFailure(function () {
            Notification::route('slack', config('services.slack.alerts_webhook'))
                ->notify(new BackupFailedNotification());
        });

    // Cleanup old backups weekly
    $schedule->command('backup:clean')
        ->weekly()
        ->onOneServer();
}
```

### Manual Database Backup

```bash
# Backup database to file
mysql -u root -ppassword shurafah > shurafah_backup.sql

# Or with compression
mysqldump -u root -ppassword shurafah | gzip > shurafah_backup.sql.gz

# Upload to S3
aws s3 cp shurafah_backup.sql.gz s3://shurafah-backups/manual/$(date +%Y-%m-%d).sql.gz

# Verify backup
mysql -u root -ppassword -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='shurafah';"
```

### Backup Verification

```bash
# List backups
php artisan backup:list

# Monitor backup health
php artisan backup:monitor

# Check backup details
aws s3 ls s3://shurafah-backups/ --recursive --summarize
```

---

## 3. Application Code & Configuration Backups

### Git Repository (Version Control)

All application code is backed up via Git history:

```bash
# Push to remote repository
git push origin main
git push origin --tags

# GitHub automatically maintains backups
# Branches: main, develop (if used), feature branches
# Tags: v0.1.0, v0.1.1, etc.
```

### Configuration Backup

Do NOT backup `.env` to Git (contains secrets). Instead:

```bash
# Backup encrypted .env to secure location
encrypt-file .env > .env.encrypted
aws s3 cp .env.encrypted s3://shurafah-backups/config/.env.encrypted

# Or store in AWS Secrets Manager
aws secretsmanager create-secret --name shurafah/prod/env --secret-string file://.env
```

---

## 4. User Uploads & Media Backups

### S3 Versioning (Point-in-Time Recovery)

```bash
# Enable versioning on S3 bucket
aws s3api put-bucket-versioning \
  --bucket shurafah-production \
  --versioning-configuration Status=Enabled

# List all versions of a file
aws s3api list-object-versions --bucket shurafah-production --prefix "songs/abc123.mp3"

# Restore old version
aws s3api copy-object \
  --copy-source shurafah-production/songs/abc123.mp3?versionId=OLD_VERSION_ID \
  --bucket shurafah-production \
  --key songs/abc123.mp3
```

### Cross-Region Replication (Geo-Redundancy)

```bash
# Enable replication from primary to backup bucket
aws s3api put-bucket-replication \
  --bucket shurafah-production \
  --replication-configuration file://replication-config.json

# replication-config.json:
{
  "Role": "arn:aws:iam::ACCOUNT_ID:role/s3-replication",
  "Rules": [
    {
      "Status": "Enabled",
      "Priority": 1,
      "Filter": { "Prefix": "" },
      "Destination": {
        "Bucket": "arn:aws:s3:::shurafah-backup-region",
        "ReplicationTime": { "Status": "Enabled", "Time": { "Minutes": 15 } }
      }
    }
  ]
}
```

---

## 5. Disaster Recovery Procedures

### Scenario 1: Database Corruption (Data Lost)

**Detection:**
- Queries fail with error: `Table is marked as crashed`
- Sentry alerts: Database connectivity issues

**Recovery Steps:**

```bash
# 1. Identify backup date
sail artisan backup:list

# 2. Stop application (to prevent further writes)
sail down

# 3. Create another backup (of corrupted state, for analysis)
mysql -u root -ppassword shurafah > corrupted_backup.sql

# 4. Drop corrupted database
mysql -u root -ppassword -e "DROP DATABASE shurafah;"

# 5. Create fresh database
mysql -u root -ppassword -e "CREATE DATABASE shurafah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 6. Restore from backup
mysql -u root -ppassword shurafah < /backups/shurafah_2026-06-01.sql

# 7. Verify data integrity
mysql -u root -ppassword shurafah -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='shurafah';"

# 8. Restart application
sail up -d

# 9. Run health check
curl http://localhost/up

# 10. Notify stakeholders
```

**RTO: 1-2 hours | RPO: 1 day**

### Scenario 2: Ransomware / Malicious Data Modification

**Detection:**
- Unusual database changes detected
- Sentry: Unusual DELETE/UPDATE volume
- User reports: Content replaced/deleted

**Recovery Steps:**

```bash
# 1. IMMEDIATELY isolate affected services
# - Take application offline
# - Block S3 bucket access
# - Enable emergency mode

# 2. Identify attack timeline
# - Check activity logs: SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 1000;
# - Determine last known good backup date

# 3. Restore from clean backup BEFORE attack
php artisan backup:restore --backup-date=2026-05-30

# 4. Verify all data restored
php artisan migrate:status
php artisan tinker
User::count();  // Verify user count matches
Song::count();  // Verify song count matches

# 5. Review and patch security vulnerability
# - Check access logs
# - Identify compromised accounts
# - Rotate credentials

# 6. Bring application back online
sail up -d

# 7. Monitor closely for 24+ hours
```

**RTO: 2-4 hours | RPO: 1 day (or last clean backup)**

### Scenario 3: Complete Server Failure

**Detection:**
- Application unreachable for > 5 minutes
- Monitoring alerts: All health checks failing
- Hosting provider notification: Server hardware failure

**Recovery Steps:**

```bash
# 1. Provision new server (or new region)
# - Same specifications as primary
# - Configure Docker/PHP/MySQL/Redis

# 2. Restore application code
git clone https://github.com/manganadda-stalite/shurafah.git
cd shurafah
git checkout v0.1.0  # Restore specific release version

# 3. Restore database
aws s3 cp s3://shurafah-backups/daily/shurafah_2026-06-02.sql.gz .
gunzip shurafah_2026-06-02.sql.gz
mysql -u root -ppassword shurafah < shurafah_2026-06-02.sql

# 4. Restore environment config
aws secretsmanager get-secret-value --secret-id shurafah/prod/env --query SecretString --output text > .env

# 5. Copy user uploads (if stored on server)
aws s3 sync s3://shurafah-production/uploads storage/uploads/

# 6. Start application
docker-compose up -d

# 7. Update DNS
# - In Route53: Update A record to point to new server IP
# - TTL might be cached; wait up to 1 hour for full propagation

# 8. Verify application
curl https://shurafah.app/up

# 9. Monitor closely
```

**RTO: 2-4 hours | RPO: 1 hour (for database)**

### Scenario 4: Accidental Delete (Single User File)

**Detection:**
- User reports: "My song is missing!"
- Sentry: 404 errors for specific file

**Recovery Steps:**

```bash
# 1. Find file version ID in S3
aws s3api list-object-versions \
  --bucket shurafah-production \
  --prefix "songs/abc123.mp3" \
  --query 'Versions[].[Key,VersionId,LastModified]' \
  --output table

# 2. Restore specific version
aws s3api copy-object \
  --copy-source shurafah-production/songs/abc123.mp3?versionId=VERSION_ID \
  --bucket shurafah-production \
  --key songs/abc123.mp3

# 3. Verify file restored
aws s3 ls s3://shurafah-production/songs/abc123.mp3

# 4. No application restart needed (file accessed directly)
```

**RTO: < 5 minutes | RPO: < 1 minute (S3 versioning)**

---

## 6. Testing & Validation

### Monthly Backup Restore Test

```bash
#!/bin/bash
# scripts/test-backup-restore.sh

echo "=== Monthly Backup Restore Test ==="
echo "Date: $(date)"

# 1. Create test database
mysql -u root -ppassword -e "CREATE DATABASE shurafah_restore_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Restore latest backup
LATEST_BACKUP=$(aws s3 ls s3://shurafah-backups/daily/ --recursive | sort | tail -1 | awk '{print $NF}')
echo "Restoring: $LATEST_BACKUP"

aws s3 cp "s3://shurafah-backups/$LATEST_BACKUP" ./test-backup.sql.gz
gunzip test-backup.sql.gz

mysql -u root -ppassword shurafah_restore_test < test-backup.sql

# 3. Verify data integrity
echo "Verifying data..."

USER_COUNT=$(mysql -u root -ppassword shurafah_restore_test -se "SELECT COUNT(*) FROM users;")
echo "Users: $USER_COUNT"

SONG_COUNT=$(mysql -u root -ppassword shurafah_restore_test -se "SELECT COUNT(*) FROM songs;")
echo "Songs: $SONG_COUNT"

# 4. Cleanup
mysql -u root -ppassword -e "DROP DATABASE shurafah_restore_test;"

echo "=== Test Complete ==="
echo "Status: PASSED" >> /var/log/backup-test.log
```

**Schedule:** First Friday of every month at 3 AM UTC

```php
// app/Console/Kernel.php
$schedule->call(function () {
    shell_exec('/scripts/test-backup-restore.sh');
})->firstFridayOfMonth()->at('03:00');
```

### Verification Checklist

- [ ] Backup file exists and has > 0 bytes
- [ ] Backup timestamp is recent (< 24 hours old)
- [ ] Database restore completes without errors
- [ ] Data integrity verified (row counts match)
- [ ] Application starts after restore
- [ ] API endpoints respond
- [ ] Authentication works

---

## 7. Backup Monitoring & Alerts

### Daily Backup Health Check

```php
// Modules/Core/Services/BackupHealthService.php
class BackupHealthService
{
    public function check(): array
    {
        $latestBackup = $this->getLatestBackup();
        $errors = [];

        // Check if backup exists
        if (!$latestBackup) {
            $errors[] = 'No backup found';
        }

        // Check if backup is recent (< 25 hours)
        $hoursOld = now()->diffInHours($latestBackup['timestamp']);
        if ($hoursOld > 25) {
            $errors[] = "Backup is $hoursOld hours old";
        }

        // Check backup size (> 10 MB expected for shurafah)
        if ($latestBackup['size_mb'] < 10) {
            $errors[] = "Backup suspiciously small: {$latestBackup['size_mb']} MB";
        }

        // Check backup location is accessible
        if (!Storage::disk('s3')->exists($latestBackup['s3_path'])) {
            $errors[] = "Backup not accessible on S3";
        }

        return [
            'healthy' => empty($errors),
            'latest_backup' => $latestBackup,
            'errors' => $errors,
        ];
    }

    private function getLatestBackup()
    {
        // Query S3 for latest backup
        $objects = Storage::disk('s3')
            ->listContents('backups/daily')
            ->sortByDesc('timestamp')
            ->first();

        return $objects;
    }
}

// Scheduled health check (every 4 hours)
$schedule->call(function () {
    $health = app(BackupHealthService::class)->check();

    if (!$health['healthy']) {
        Notification::route('slack', config('services.slack.alerts_webhook'))
            ->notify(new BackupHealthAlertNotification($health));
    }
})->everyFourHours();
```

### Alert Channels

| Severity | Channel | Recipient |
|----------|---------|----------|
| **INFO** | Slack #operations | DevOps team |
| **WARNING** | Slack #alerts + Email | Tech lead |
| **CRITICAL** | Slack #alerts + Email + SMS | Tech lead + On-call |

---

## 8. Retention Policy

```
Backup Type          | Retention | Deletion Policy
---------------------|-----------|------------------
Daily (automated)    | 30 days   | Auto-delete after 30 days
Weekly              | 12 weeks  | Auto-delete after 12 weeks
Monthly             | 12 months | Auto-delete after 12 months
Pre-release         | 7 days    | Manual review before delete
Disaster backup     | 90 days   | Encrypt, offline storage
Compliance (GDPR)   | 7 years   | Encrypted archive
```

---

## 9. Compliance & Documentation

### Required Documentation

- [ ] Backup procedures document (this file)
- [ ] Recovery runbooks for each scenario
- [ ] Test results log (monthly)
- [ ] Backup inventory (automated S3 listing)
- [ ] Incident reports (post-recovery)

### Audit Trail

```bash
# Query backup history
aws s3api list-object-versions --bucket shurafah-backups --output table

# Check backup logs
grep "backup" /var/log/laravel.log | tail -20

# Verify integrity checks
php artisan backup:monitor
```

---

## 10. Disaster Recovery Contact List

| Role | Name | Phone | Email | Escalation |
|------|------|-------|-------|-------------|
| **Tech Lead** | — | +234-XXX-XXXX | tech-lead@shurafah.app | Primary |
| **DevOps** | — | +234-XXX-XXXX | devops@shurafah.app | Secondary |
| **AWS Support** | — | +1-206-555-0100 | support@aws.amazon.com | Tertiary |
| **Hosting Provider** | — | — | support@hosting.com | Emergency |

---

## Integration Checklist (Phase 0)

- [ ] Spatie Laravel Backup installed and configured
- [ ] Daily automated backups scheduled (2 AM UTC)
- [ ] S3 versioning enabled on production bucket
- [ ] Cross-region replication configured
- [ ] Backup health monitoring implemented
- [ ] Monthly restore test scheduled
- [ ] Recovery runbooks documented
- [ ] Disaster contact list created
- [ ] RTO/RPO targets reviewed and approved
- [ ] Security checklist passed
