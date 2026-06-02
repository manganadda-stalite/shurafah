# Admin Roles & Permissions (RBAC)

## Overview

Shurafah uses **Role-Based Access Control (RBAC)** for admin/staff users. This document defines all roles, their permissions, and security requirements.

---

## 1. Role Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                   SUPER ADMIN                           │
│  (Full system access, can create/edit other admins)    │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼─────┐  ┌────▼──────┐  ┌───▼──────┐
   │ CONTENT  │  │  FINANCE  │  │ SUPPORT  │
   │ MANAGER  │  │  MANAGER  │  │  MANAGER │
   └────┬─────┘  └────┬──────┘  └───┬──────┘
        │              │              │
   ┌────▼─────┐  ┌────▼──────┐  ┌───▼──────┐
   │MODERATOR │  │ ANALYST   │  │ SUPPORT  │
   │          │  │           │  │ STAFF    │
   └──────────┘  └───────────┘  └──────────┘
```

---

## 2. Roles Definition

### 🔴 SUPER ADMIN

**Purpose:** Complete system administration

**Capabilities:**
- Manage all admin users (create, edit, delete, assign roles)
- Manage all content (songs, artists, lectures, categories)
- Manage all users and subscriptions
- View all analytics and reports
- Configure system settings
- Manage admin roles and permissions
- Execute dangerous operations (database resets, etc.)

**Required Security:**
- 2FA mandatory (must set up on first login)
- IP whitelisting recommended
- Monthly password rotation required
- Audit logged for every action
- Email notification on every login

**Team Size:** 1-2 people maximum

### 🟠 CONTENT MANAGER

**Purpose:** Manage music catalog (songs, artists, playlists, categories)

**Capabilities:**
- Create, edit, publish, archive songs
- Create, edit, delete artists and collaborators
- Create, edit, delete categories and subcategories
- Create, edit, delete playlists
- Add featured/trending badges
- Bulk import songs and metadata
- View content analytics

**Cannot:**
- Delete published content (archive only)
- Manage users or admins
- View financial data
- Manage system settings

**Required Security:**
- 2FA optional
- Audit logging enabled
- Changes require review (if workflow enabled)

**Team Size:** 2-5 people

### 🟠 MODERATOR

**Purpose:** Moderate user-generated content and ensure compliance

**Capabilities:**
- View comments on songs/lectures
- Delete/hide inappropriate comments
- Ban users for violations
- View abuse reports
- Respond to user reports
- View moderation queue
- Generate compliance reports

**Cannot:**
- Edit content (songs, lectures)
- Delete content permanently
- Manage admins
- Access financial data

**Required Security:**
- Audit logging enabled
- Rate limiting on moderation actions

**Team Size:** 2-4 people

### 🟢 FINANCE MANAGER

**Purpose:** Manage payments, subscriptions, and financial reporting

**Capabilities:**
- View all transactions
- View subscription list
- View payment analytics
- Generate financial reports
- Configure payment methods
- View payout settings
- Refund subscriptions
- Export financial data (CSV/PDF)

**Cannot:**
- Manage content
- Manage admins
- Manage users (except subscription status)
- Access system settings

**Required Security:**
- 2FA mandatory
- Audit logging on all financial transactions
- Separation of duties (cannot also be ANALYST)
- Monthly reconciliation required
- PCI compliance required

**Team Size:** 1-2 people

### 🟢 ANALYST

**Purpose:** Monitor platform analytics and generate insights

**Capabilities:**
- View all analytics dashboards
- View user growth metrics
- View content performance metrics
- Generate reports (custom queries)
- Export data (CSV, Excel)
- View engagement metrics
- View payment metrics (read-only)

**Cannot:**
- Modify any data
- Manage users, content, or admins
- Manage financial settings
- Delete data

**Required Security:**
- 2FA optional
- No sensitive data in exports (PII masked)

**Team Size:** 1-3 people

### 🔵 SUPPORT MANAGER

**Purpose:** Manage support tickets and customer communications

**Capabilities:**
- View/respond to support tickets
- View user accounts (read-only)
- Send notifications to users
- Manage FAQ/help content
- View support analytics
- Ban users (for severe violations)

**Cannot:**
- Delete user data
- Manage content or financial data
- Manage admins
- Access system settings

**Required Security:**
- Audit logging enabled

**Team Size:** 2-4 people

### 🔵 SUPPORT STAFF

**Purpose:** Handle first-level customer support

**Capabilities:**
- View support tickets (assigned to them)
- Respond to support tickets
- View user account info (read-only)
- Send canned responses
- Escalate to SUPPORT MANAGER

**Cannot:**
- Ban users
- Delete anything
- Manage settings

**Required Security:**
- Basic audit logging

**Team Size:** 3-8 people

---

## 3. Permissions Matrix

### Content Management

| Permission | Super Admin | Content Manager | Moderator | Analyst | Finance | Support Manager | Support Staff |
|------------|:-----------:|:---------------:|:---------:|:-------:|:-------:|:---------------:|:-------------:|
| Create Song | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Song | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Song | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Archive Song | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Artist | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Artist | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Category | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Playlist | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### User Management

| Permission | Super Admin | Content Manager | Moderator | Analyst | Finance | Support Manager | Support Staff |
|------------|:-----------:|:---------------:|:---------:|:-------:|:-------:|:---------------:|:-------------:|
| View User | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ (assigned) |
| Edit User | ✅ | ❌ | ❌ | ❌ | ✅ (sub only) | ❌ | ❌ |
| Ban User | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Delete User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Subscriptions | ✅ | ❌ | ❌ | ✅ (read-only) | ✅ | ❌ | ❌ |
| Manage Subscriptions | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### Moderation

| Permission | Super Admin | Content Manager | Moderator | Analyst | Finance | Support Manager | Support Staff |
|------------|:-----------:|:---------------:|:---------:|:-------:|:-------:|:---------------:|:-------------:|
| View Comments | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Comments | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Reports | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Resolve Reports | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |

### Financial

| Permission | Super Admin | Content Manager | Moderator | Analyst | Finance | Support Manager | Support Staff |
|------------|:-----------:|:---------------:|:---------:|:-------:|:-------:|:---------------:|:-------------:|
| View Transactions | ✅ | ❌ | ❌ | ✅ (read-only) | ✅ | ❌ | ❌ |
| Process Refunds | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Financial Reports | ✅ | ❌ | ❌ | ✅ (read-only) | ✅ | ❌ | ❌ |
| Configure Payments | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Export Financial Data | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### Admin Management

| Permission | Super Admin | Content Manager | Moderator | Analyst | Finance | Support Manager | Support Staff |
|------------|:-----------:|:---------------:|:---------:|:-------:|:-------:|:---------------:|:-------------:|
| Create Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Admin Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Analytics & Settings

| Permission | Super Admin | Content Manager | Moderator | Analyst | Finance | Support Manager | Support Staff |
|------------|:-----------:|:---------------:|:---------:|:-------:|:-------:|:---------------:|:-------------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Activity Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Implementation (Laravel Permissions)

### Install Spatie Laravel Permission

```bash
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

### Define Roles and Permissions

```php
// database/seeders/RolesAndPermissionsSeeder.php
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run()
    {
        // Define permissions
        $permissions = [
            'create_song', 'edit_song', 'delete_song', 'archive_song',
            'create_artist', 'edit_artist', 'delete_artist',
            'create_category', 'edit_category', 'delete_category',
            'view_comments', 'delete_comments', 'ban_users',
            'view_transactions', 'process_refunds',
            'manage_admins', 'assign_roles',
            'view_analytics', 'manage_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Define roles and assign permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin->syncPermissions(Permission::all());

        $contentManager = Role::firstOrCreate(['name' => 'content-manager']);
        $contentManager->syncPermissions([
            'create_song', 'edit_song', 'archive_song',
            'create_artist', 'edit_artist',
            'create_category', 'edit_category',
        ]);

        $moderator = Role::firstOrCreate(['name' => 'moderator']);
        $moderator->syncPermissions([
            'view_comments', 'delete_comments', 'ban_users',
        ]);

        $financeManager = Role::firstOrCreate(['name' => 'finance']);
        $financeManager->syncPermissions([
            'view_transactions', 'process_refunds',
        ]);

        $analyst = Role::firstOrCreate(['name' => 'analyst']);
        $analyst->syncPermissions(['view_analytics']);

        $supportManager = Role::firstOrCreate(['name' => 'support-manager']);
        $supportManager->syncPermissions(['ban_users']);

        $supportStaff = Role::firstOrCreate(['name' => 'support']);
        $supportStaff->syncPermissions([]);
    }
}
```

### Use in Controllers

```php
// Modules/Songs/Http/Controllers/Admin/SongController.php
class SongController extends Controller
{
    public function store(StoreSongRequest $request)
    {
        // Check permission
        if (!auth()->user()->can('create_song')) {
            abort(403, 'Unauthorized');
        }

        // Create song...
    }

    public function destroy(Song $song)
    {
        // Check permission (only super admin)
        if (!auth()->user()->hasRole('super-admin')) {
            abort(403, 'Only super admins can delete songs');
        }

        $song->delete();
    }
}
```

### Use in Middleware

```php
// routes/admin.php
Route::middleware(['auth:admin', 'role:super-admin|content-manager'])
    ->group(function () {
        Route::resource('songs', SongController::class);
    });

Route::middleware(['auth:admin', 'permission:manage_admins'])
    ->group(function () {
        Route::resource('admins', AdminController::class);
    });
```

---

## 5. Security Requirements by Role

### 2FA (Two-Factor Authentication)

**Mandatory for:**
- Super Admin ✅
- Finance Manager ✅
- Content Manager (recommended) ⚠️

**Optional for:**
- Moderator
- Analyst
- Support Manager
- Support Staff

### IP Whitelisting

**Recommended for:**
- Super Admin (home IP + office IP)
- Finance Manager (office IP only)

### Password Policy

**All admin users:**
- Minimum 12 characters
- Must include: uppercase, lowercase, numbers, symbols
- No reuse of last 5 passwords
- Expiration: 90 days

**Super Admin:**
- Expiration: 60 days (stricter)
- Rotation: Monthly recommended

### Session Management

**Session timeout:**
- Super Admin: 15 minutes of inactivity
- Finance Manager: 30 minutes of inactivity
- Other roles: 60 minutes of inactivity

### Activity Logging

**All admin actions are logged:**

```php
// Modules/ActivityLogs/Models/ActivityLog.php
class ActivityLog extends Model
{
    protected $fillable = [
        'admin_user_id',
        'action', // 'created_song', 'deleted_user', etc.
        'resource_type', // 'Song', 'User', etc.
        'resource_id',
        'old_values', // Before update
        'new_values', // After update
        'ip_address',
        'user_agent',
        'created_at',
    ];

    public function admin()
    {
        return $this->belongsTo(AdminUser::class, 'admin_user_id');
    }
}

// Usage in controller
ActivityLog::create([
    'admin_user_id' => auth()->id(),
    'action' => 'created_song',
    'resource_type' => 'Song',
    'resource_id' => $song->id,
    'new_values' => $song->toArray(),
    'ip_address' => request()->ip(),
    'user_agent' => request()->userAgent(),
]);
```

---

## 6. Audit & Compliance

### Monthly Access Review

```bash
# Generate admin access report
php artisan admin:access-report --month=2026-06

# Output:
# Admin | Role | Last Login | Actions (30d) | Status
# --|--|--|--|--
# user@example.com | super-admin | 2026-06-01 | 245 | Active
# content@example.com | content-manager | 2026-05-20 | 0 | Inactive
```

### Compliance Checks

- [ ] Inactive admins (> 30 days) flagged for review
- [ ] Super admins have 2FA enabled
- [ ] Finance managers have 2FA enabled
- [ ] Admins with multiple roles audited
- [ ] Activity logs retained for 12 months
- [ ] Failed login attempts tracked
- [ ] Admin password rotations tracked

### GDPR Compliance

- Admin data deletion: Anonymize activity logs after 7 years
- Admin export: Support admin data portability
- Admin consent: Document 2FA and security policy acceptance

---

## 7. Offboarding Checklist

When an admin leaves:

```bash
# 1. Disable admin account (don't delete)
php artisan admin:disable user@example.com

# 2. Revoke all sessions
DB::table('personal_access_tokens')
    ->where('tokenable_id', $admin->id)
    ->delete();

# 3. Export activity logs (for compliance)
ActivityLog::where('admin_user_id', $admin->id)
    ->orderBy('created_at', 'desc')
    ->get()
    ->export('csv');

# 4. Reassign responsibilities
# - Notify new admin of pending tasks
# - Transfer open tickets
# - Update contact lists

# 5. Rotate sensitive credentials (if known)
# - Payment gateway API keys
# - SMS provider keys
# - AWS credentials
```

---

## 8. Integration Checklist (Phase 13 - Admin)

- [ ] Spatie Laravel Permission installed
- [ ] Roles created (all 7 roles)
- [ ] Permissions defined
- [ ] Permission assignments completed
- [ ] Activity logging implemented
- [ ] 2FA setup for super admin and finance
- [ ] IP whitelisting configured (if needed)
- [ ] Session timeout configured
- [ ] Admin login audit logging
- [ ] Tests written for permission checks
- [ ] Security checklist passed
