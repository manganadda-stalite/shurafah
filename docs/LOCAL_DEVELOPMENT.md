# Local Development Guide (Laragon)

## Quick Start (5 minutes)

```bash
# 1. Start Laragon (Right-click → Start All)

# 2. Clone (in Laragon www folder)
cd C:\laragon\www  # Windows
cd ~/laragon/www   # macOS/Linux

git clone https://github.com/manganadda-stalite/shurafah.git
cd shurafah

# 3. Setup
cp .env.example .env
composer install
npm install

# 4. Initialize
php artisan key:generate
mysql -u root -e "CREATE DATABASE shurafah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
npm run dev

# 5. Verify
curl http://localhost/shurafah/public/up
echo "✓ App ready at http://localhost/shurafah/public"
```

---

## Service Endpoints

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **Web App** | http://localhost/shurafah/public | Phone: 08012345678 / Password: password |
| **Admin** | http://localhost/shurafah/public/admin | Email: admin@example.com / Password: password |
| **API** | http://localhost/shurafah/public/api/v1 | Bearer token (login to get) |
| **PhpMyAdmin** | http://localhost/phpmyadmin | root / (no password) |
| **Mailhog** (Emails) | http://localhost:1025 | (No auth) |
| **MySQL** | localhost:3306 | root / (no password) |

---

## Laragon Commands

```bash
# Laragon is in PATH globally
php --version
composer --version
mysql --version
node --version
npm --version

# Navigate to project
cd C:\laragon\www\shurafah  # Windows
cd ~/laragon/www/shurafah   # macOS/Linux
```

---

## Artisan Cheat Sheet

```bash
# Basic
php artisan serve                    # Run dev server (optional)
php artisan key:generate             # Set app key

# Database
php artisan migrate                  # Run migrations
php artisan migrate:rollback         # Rollback latest
php artisan migrate:refresh --seed   # Reset all + seed
php artisan migrate:status           # Show migration status

# Tinker (PHP REPL)
php artisan tinker

# Cache
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Queue
php artisan queue:work
php artisan queue:failed

# Seeding
php artisan seed
php artisan db:seed --class=SongSeeder
```

---

## Demo Credentials

### End User (Created by seeder)

**Phone Login:**
```
Phone: 08012345678
Password: password
```

**API Token:**
```bash
# Get token
curl -X POST http://localhost/shurafah/public/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "08012345678", "password": "password", "device_name": "Local Dev"}'

# Use in API calls
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost/shurafah/public/api/v1/me
```

### Admin User (Created by seeder)

**Email Login:**
```
Email: admin@example.com
Password: password
```

**2FA (if enabled):**
- Disabled by default for local dev
- Enable: Run `php artisan tinker` and execute:
  ```php
  $admin = AdminUser::first();
  $google2fa = new PragmaRX\Google2FA\Google2FA();
  $admin->two_factor_secret = $google2fa->generateSecretKey();
  $admin->save();
  ```

---

## File Structure

```
shurafah/
├─ Modules/
│  ├─ Core/               # Shared base classes, layouts, helpers
│  ├─ Auth/               # Authentication (users, admins, OTP)
│  ├─ Users/              # User profiles
│  ├─ Songs/              # Music domain
│  ├─ Artists/
│  ├─ Categories/
│  ├─ Playlists/
│  ├─ Waazi/              # Wa'azi domain (lectures)
│  ├─ Preachers/
│  ├─ WaaziCategories/
│  ├─ WaaziSeries/
│  ├─ Favourites/
│  ├─ Comments/
│  ├─ Downloads/
│  ├─ Premium/            # Subscriptions
│  ├─ Ads/
│  ├─ AdminRoles/         # RBAC
│  ├─ Notifications/
│  ├─ ActivityLogs/
│  └─ Settings/
├─ resources/
│  ├─ views/              # Blade templates (layouts, partials)
│  ├─ js/                 # Frontend JavaScript
│  └─ css/                # Compiled CSS
├─ storage/               # File uploads, logs, cache
├─ database/              # Database seeds and factories
├─ tests/                 # Test files
├─ docs/                  # Documentation
├─ architecture/          # Technical architecture docs
├─ .github/workflows/     # CI/CD pipelines
└─ .env                   # Environment config (local)
```

---

## Common Tasks

### Create a New Module

```bash
php artisan module:make Songs
```

This creates:
```
Modules/Songs/
├─ Routes/
├─ Http/Controllers/
├─ Models/
├─ Services/
├─ Database/Migrations/
├─ Resources/views/
├─ Tests/
└─ Providers/
```

### Create a Migration

```bash
php artisan make:migration create_songs_table --path Modules/Songs/Database/Migrations
```

### Create a Model with Factory & Seeder

```bash
php artisan make:model Modules/Songs/Models/Song -mf
php artisan make:seeder SongSeeder --path Modules/Songs/Database/Seeders
```

### Create a Test

```bash
php artisan make:test Feature/LoginTest --path Modules/Auth/Tests
php artisan make:test Unit/OtpServiceTest --path Modules/Auth/Tests
```

### Generate OpenAPI Documentation

```bash
php artisan scribe:generate  # (After Phase 23)
```

Docs available at: http://localhost/shurafah/public/docs/api

---

## Testing

```bash
# Run all tests
php artisan test

# Run with verbose output
php artisan test --verbose

# Run specific test file
php artisan test tests/Feature/Auth/LoginTest.php

# Run specific test
php artisan test tests/Feature/Auth/LoginTest.php --filter="user can login"

# Run with coverage
php artisan test --coverage

# Watch mode (auto re-run)
php artisan test --watch
```

---

## Debugging

### Using Tinker (REPL)

```bash
php artisan tinker

# In tinker:
$user = User::first();
$user->isPremium();
dd($user);
exit
```

### Using Xdebug with VS Code

1. Install "PHP Debug" extension
2. Set breakpoint (click line number)
3. Press F5 to start debugging
4. Navigate to page in browser
5. Debugger pauses at breakpoint

### View Sent Emails

All emails go to Mailhog: http://localhost:1025

### Check Database

```bash
# PhpMyAdmin: http://localhost/phpmyadmin
# Or use MySQL CLI:
mysql -u root shurafah

# In MySQL:
SHOW TABLES;
SELECT * FROM users;
EXIT;
```

---

## Performance Testing

```bash
# Generate test data
php artisan tinker
User::factory(1000)->create();
Song::factory(500)->create();
exit

# Load test with Apache Bench (comes with Apache in Laragon)
ab -n 1000 -c 100 http://localhost/shurafah/public/api/v1/songs

# Monitor with MySQL
mysql -u root -e "SHOW PROCESSLIST;"
```

---

## Environment-Specific Config

### Local Development

```bash
APP_DEBUG=true
LOG_CHANNEL=stack
APP_ENV=local
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=shurafah
DB_USERNAME=root
DB_PASSWORD=
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SMS_PROVIDER=test    # Don't send real SMSes
PAYSTACK_MODE=test   # Use test keys
```

### Testing (CI)

```bash
APP_ENV=testing
DB_CONNECTION=sqlite
DB_DATABASE=:memory:
CACHE_DRIVER=array
QUEUE_CONNECTION=sync
```

---

## Troubleshooting

See `CONTRIBUTING.md` section: "Common Issues & Troubleshooting" for detailed solutions.

**Quick fixes:**

```bash
# Reset everything
php artisan cache:clear
php artisan config:clear
rm -rf vendor node_modules storage/logs/*

composer install
npm install

php artisan migrate:refresh --seed
npm run dev

# Test
php artisan test
```

---

## Accessing MySQL from Laragon

```bash
# MySQL is available globally after installing Laragon
mysql -u root  # No password

# Create database
mysql -u root -e "CREATE DATABASE shurafah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Backup database
mysql -u root shurafah > backup.sql

# Restore database
mysql -u root shurafah < backup.sql

# Export table
mysql -u root shurafah -e "SELECT * FROM users;" > users.csv
```

---

## Next Steps

1. Read `docs/conventions/coding-standards.md` for code guidelines
2. Read `architecture/` docs to understand the system design
3. Pick a Phase from `docs/phases/` and start coding
4. Write tests alongside features (TDD recommended)
5. Follow PR template when submitting code

---

Questions? Ask in Slack #development or open a GitHub discussion.
