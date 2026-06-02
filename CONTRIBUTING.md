# Contributing to Shurafah

Thank you for contributing to Shurafah! This guide will help you set up your development environment and understand the development workflow.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Development Setup (Laragon)](#local-development-setup-laragon)
3. [Development Workflow](#development-workflow)
4. [Running Tests](#running-tests)
5. [Code Style & Quality](#code-style--quality)
6. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
7. [IDE Setup](#ide-setup)
8. [Git Workflow](#git-workflow)

---

## System Requirements

### Minimum

- **Laragon** 6.0+ (All-in-one dev environment)
  - Download: https://laragon.org/
  - Includes: PHP 8.3, MySQL 8.0, Apache/Nginx, Node.js, Composer, Git
  - Installation: Just run the installer, no additional setup needed

- **Git** (Usually included in Laragon)
  - Verify: `git --version`

- **Composer** (Usually included in Laragon)
  - Verify: `composer --version`

### Recommended (Optional)

- **Visual Studio Code** with extensions:
  - PHP Intelephense
  - Laravel Extra Intellisense
  - Git Graph
  - Thunder Client (for API testing)

- **DBeaver** or **TablePlus** for database browsing

- **Postman** or **Insomnia** for advanced API testing

---

## Local Development Setup (Laragon)

### Step 1: Verify Laragon Installation

```bash
# Open terminal and verify
php --version      # Should show PHP 8.3+
composer --version # Should show Composer 2.x
mysql --version    # Should show MySQL 8.0+
node --version     # Should show Node 18+
npm --version      # Should show NPM 9+
```

### Step 2: Clone Repository into Laragon

```bash
# Navigate to Laragon www directory
cd C:\laragon\www  # Windows
# OR
cd ~/laragon/www   # macOS/Linux

# Clone the repository
git clone https://github.com/manganadda-stalite/shurafah.git
cd shurafah
```

### Step 3: Copy Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Database in .env

Edit `.env` and update database settings:

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shurafah
DB_USERNAME=root
DB_PASSWORD=         # Leave empty (Laragon default)
```

### Step 5: Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### Step 6: Generate Application Key

```bash
php artisan key:generate
```

### Step 7: Create Database

**Option A: Using Laragon Menu**
1. Right-click Laragon icon → Menu → MySQL → MySQL Client
2. Run:
   ```sql
   CREATE DATABASE shurafah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

**Option B: Using Command Line**

```bash
mysql -u root -e "CREATE DATABASE shurafah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 8: Run Migrations and Seeders

```bash
php artisan migrate --seed
```

This creates all database tables and seeds reference data (zones, states, LGAs, demo users).

### Step 9: Build Assets

```bash
# Development mode (watches for changes)
npm run dev

# Production-like builds
npm run build
```

### Step 10: Create a Virtual Host (Optional but Recommended)

**In Laragon Menu:**
1. Right-click Laragon icon → Menu → Virtual Hosts
2. Create new virtual host
   - Name: `shurafah`
   - Root: `C:\laragon\www\shurafah\public`
3. Laragon auto-configures Apache/Nginx

**Or manually edit hosts file:**

```
Windows: C:\Windows\System32\drivers\etc\hosts
macOS/Linux: /etc/hosts

Add line:
127.0.0.1 shurafah.local
```

### Step 11: Start Laragon Services

```bash
# Right-click Laragon icon → Start All
# Or click "Start" button
```

### Step 12: Verify Setup

```bash
# Test application
curl http://localhost/shurafah/public/up
# Or if virtual host created:
curl http://shurafah.local/up

# Should return 200 OK with JSON: {"status":"ok"}
```

### Step 13: Access the Application

| Service | URL |
|---------|-----|
| **Web App** (Front) | http://localhost/shurafah/public/ |
| **Admin Panel** | http://localhost/shurafah/public/admin |
| **API** | http://localhost/shurafah/public/api/v1 |
| **PhpMyAdmin** (DB) | http://localhost/phpmyadmin |
| **Mailhog** (Emails) | http://localhost:1025 |
| **(With Virtual Host)** |
| **Web App** | http://shurafah.local |
| **Admin Panel** | http://shurafah.local/admin |
| **API** | http://shurafah.local/api/v1 |

---

## Development Workflow

### Daily Workflow

```bash
# 1. Start of day: ensure Laragon services are running
# Right-click Laragon → Start All (or click Start button)

# 2. Navigate to project
cd C:\laragon\www\shurafah  # Windows
# OR
cd ~/laragon/www/shurafah   # macOS/Linux

# 3. Pull latest changes from main
git checkout main
git pull origin main

# 4. Create a feature branch
git checkout -b feat/phase-03-auth

# 5. Develop your feature
# ... write code, tests, docs ...

# 6. Run tests locally (before pushing)
php artisan test

# 7. Fix code style
vendor/bin/pint

# 8. Commit with conventional messages
git add .
git commit -m "feat: add phone OTP verification"

# 9. Push and create PR
git push origin feat/phase-03-auth
# Go to GitHub and create a Pull Request

# 10. End of day: optionally stop services
# Right-click Laragon → Stop All (or close Laragon)
```

### Useful Laragon Features

```bash
# Access MySQL CLI directly
mysql -u root

# Database backup
mysql -u root shurafah > backup.sql

# Database restore
mysql -u root shurafah < backup.sql

# View logs
# Laragon Menu → Logs → Apache/MySQL/PHP
```

### Useful Artisan Commands

```bash
# Database
php artisan migrate
php artisan migrate:rollback
php artisan migrate:refresh --seed
php artisan migrate:status

# Cache/Queue
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan queue:work  # Run queue worker

# Debugging
php artisan tinker  # PHP REPL
php artisan seed    # Run seeders

# Development
php artisan serve --host=127.0.0.1 --port=8000  # Alternative dev server
```

---

## Running Tests

### Unit & Feature Tests

```bash
# Run all tests
php artisan test

# Run with verbose output
php artisan test --verbose

# Run specific test file
php artisan test tests/Feature/Auth/LoginTest.php

# Run specific test
php artisan test tests/Feature/Auth/LoginTest.php --filter="user can login"

# Run with coverage report
php artisan test --coverage

# Run only failed tests from last run
php artisan test --only-failures
```

### Watch Mode (Re-run tests on file change)

```bash
php artisan test --watch
```

### Test Organization

Tests live in each module's `Tests/` directory:

```
Modules/Auth/
  Tests/
    Feature/
      LoginTest.php
      RegisterTest.php
    Unit/
      OtpServiceTest.php
```

**Run tests for a specific module:**

```bash
php artisan test Modules/Auth/Tests/
```

---

## Code Style & Quality

### 1. PHP Code Style (Pint)

Laravel Pint enforces PSR-12 standard.

```bash
# Check style violations
vendor/bin/pint --test

# Automatically fix style issues
vendor/bin/pint

# Fix a specific file
vendor/bin/pint app/Models/User.php
```

### 2. Static Analysis (Larastan)

Larastan is PHP static analysis (PHPStan for Laravel).

```bash
# Run analysis
vendor/bin/larastan analyse --level=5

# This checks:
# - Type mismatches
# - Undefined methods/properties
# - Unreachable code
# - And more...
```

### 3. Code Review Checklist

Before pushing, verify:

- [ ] `vendor/bin/pint --test` passes (no style errors)
- [ ] `vendor/bin/larastan analyse --level=5` passes
- [ ] `php artisan test` passes (all tests green)
- [ ] No sensitive data in code (passwords, API keys, etc.)
- [ ] New models/migrations documented
- [ ] PR description updated
- [ ] Database changes reversible

---

## Common Issues & Troubleshooting

### Issue: Port Already in Use

**Error:** `Address already in use` (Port 80, 443, 3306, etc.)

**Solution 1: Change port in Laragon**
- Laragon Menu → Preferences → Services
- Apache: Change port (e.g., 8080)
- MySQL: Change port (e.g., 3307)
- Update `.env` with new port

**Solution 2: Stop conflicting service**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :3306
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :3306
kill -9 <PID>
```

### Issue: PHP Version Mismatch

**Error:** `Your requirements could not be resolved to an installable set of packages` (composer install)

**Solution:**
```bash
# Check PHP version
php --version  # Should be 8.3+

# In Laragon:
# Menu → Preferences → PHP → Select PHP 8.3
# Restart Laragon
```

### Issue: Database Connection Refused

**Error:** `SQLSTATE[HY000]: General error: 2006 MySQL server has gone away`

**Solution:**
```bash
# Verify MySQL is running
# Laragon should show green "MySQL" indicator

# Restart MySQL:
# Right-click Laragon → Stop MySQL → Start MySQL

# Or from command line:
mysql -u root -e "SELECT 1;"
```

### Issue: "composer" command not found

**Solution:**
```bash
# Laragon should have composer in PATH
# If not, add Laragon to PATH:

# Windows: Environment Variables → PATH → Add:
# C:\laragon\bin\composer
# C:\laragon\bin\php

# macOS/Linux (add to ~/.bash_profile or ~/.zshrc):
export PATH="$PATH:$HOME/laragon/bin/composer"
export PATH="$PATH:$HOME/laragon/bin/php"
```

### Issue: Permission Denied on Storage

**Error:** `Permission denied` when uploading files

**Solution:**
```bash
# Fix folder permissions
# Windows (run as Administrator):
ice
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T

# macOS/Linux:
chmod -R 775 storage bootstrap/cache
```

### Issue: Node Modules Out of Sync

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tests Fail with Database Error

**Error:** `SQLSTATE[42S02]: Table 'shurafah_test.users' doesn't exist`

**Solution:**
```bash
# Ensure test database exists
mysql -u root -e "CREATE DATABASE shurafah_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations for test environment
php artisan migrate --env=testing
```

### Issue: "The database could not be found"

**Error:** When running migrations

**Solution:**
```bash
# Create database first
mysql -u root -e "CREATE DATABASE shurafah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Then run migrations
php artisan migrate --seed
```

---

## IDE Setup

### Visual Studio Code

#### Recommended Extensions

1. **PHP Intelephense**
   - Provides autocomplete, type checking, code navigation
   - Install: `ms-vscode.vscode-php-intellisense`

2. **Laravel Extra Intellisense**
   - Route/config/view autocomplete
   - Install: `amiralizadeh.laravel-extra-intellisense`

3. **Laravel Blade Snippets**
   - Blade syntax highlighting and snippets
   - Install: `onecentlin.laravel-blade`

4. **Git Graph**
   - Visualize git branches
   - Install: `mhutchie.git-graph`

5. **Pest**
   - Run tests directly from editor
   - Install: `m1guelpf.pest`

6. **Thunder Client** (Alternative to Postman)
   - API testing in VS Code
   - Install: `rangav.vscode-thunder-client`

#### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "[php]": {
    "editor.defaultFormatter": "bmewburn.vscode-intelephense-client",
    "editor.formatOnSave": false,
    "editor.codeActionsOnSave": {
      "source.fixAll": true
    }
  },
  "intelephense.format.enable": false,
  "intelephense.files.exclude": [
    "**/.git",
    "**/node_modules",
    "**/vendor"
  ],
  "laravel.routes": true,
  "laravel.views": true,
  "laravel.env": ".env",
  "editor.rulers": [80, 120]
}
```

### PhpStorm / JetBrains IDEs

#### Setup

1. **Enable Laravel plugin** (usually pre-enabled)
   - Settings → Plugins → Search "Laravel" → Install

2. **Configure PHP interpreter**
   - Settings → Languages & Frameworks → PHP
   - CLI Interpreter → Select PHP executable from Laragon
   - Path: `C:\laragon\bin\php\php8.3\php.exe` (Windows)
   - Path: `~/laragon/bin/php/php8.3/bin/php` (macOS/Linux)

3. **Enable Blade support**
   - Settings → Languages & Frameworks → Blade
   - Check "Enable Blade support"

4. **Configure Laravel**
   - Settings → Languages & Frameworks → PHP → Laravel
   - Set "Laravel path" to project root

### Debugging with Xdebug

**Xdebug usually comes with Laragon PHP**

**Enable in `.env`:**
```bash
APP_DEBUG=true
```

**In VS Code:**
- Install "PHP Debug" extension
- Add breakpoint (click line number)
- Start debug: press F5
- Navigate to page/endpoint in browser
- Debugger stops at breakpoint

**In PhpStorm:**
- Set breakpoint
- Navigate to page/endpoint in browser
- Debugger automatically attaches

---

## Git Workflow

### Branch Naming Convention

```
feat/phase-03-auth              # Feature
fix/login-form-validation        # Bug fix
docs/update-readme              # Documentation
refactor/extract-services       # Code refactoring
test/add-payment-tests          # Tests
chore/update-dependencies       # Dependencies
perf/optimize-query             # Performance
```

### Commit Message Convention

```
feat: add phone OTP verification
fix: prevent double-tap on submit button
docs: document auth module
refactor: extract SongService from controller
test: add tests for payment webhook
chore: update Laravel to 13.5
perf: add database indexes for queries
```

**Format:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Example:**
```
feat: add phone OTP verification

Implements OTP-based phone verification for user registration.
- Generates 6-digit code
- Sends via SMS (Termii)
- Expires after 10 minutes
- Single-use validation

Fixes #123
```

### Pull Request Process

1. **Create branch**
   ```bash
   git checkout -b feat/phase-03-auth
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add OTP verification"
   ```

3. **Push to remote**
   ```bash
   git push origin feat/phase-03-auth
   ```

4. **Create Pull Request on GitHub**
   - Title: `feat: add OTP verification`
   - Description: Follow PR template (see below)
   - Request reviewers

5. **Address feedback**
   ```bash
   git add .
   git commit -m "refactor: improve OTP validation"
   git push origin feat/phase-03-auth
   ```

6. **Merge when approved**
   - Squash commits: `1 commit per feature`
   - Delete branch after merge

### Pull Request Template

```markdown
## Phase
**Phase 03 - User Authentication**

## What does this PR do?
Briefly describe the changes.

## Type of change
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement

## Scope
- [ ] Affects frontend
- [ ] Affects API
- [ ] Affects admin panel
- [ ] Database changes

## Database migrations
- [ ] No migrations
- [ ] Migrations added (list below)

## Testing
- [ ] Unit tests added
- [ ] Feature tests added
- [ ] Manual testing completed

## Security
- [ ] Security checklist passed (see architecture/07)
- [ ] No secrets in code
- [ ] Input validation added
- [ ] Authorization checks added

## Screenshots / Evidence
*(If UI changes)*

## Definition of Done
- [ ] Code review passed
- [ ] Tests passing (100% green)
- [ ] Pint style clean
- [ ] Larastan analysis clean
- [ ] Security checklist passed
- [ ] Documentation updated
- [ ] No design regressions

## Closes
Fixes #123
```

---

## Help & Support

- **Laravel Docs**: https://laravel.com/docs
- **Laragon Docs**: https://laragon.org/
- **Pest Testing**: https://pestphp.com
- **GitHub Issues**: https://github.com/manganadda-stalite/shurafah/issues
- **Slack**: #development channel

---

Happy coding! 🚀
