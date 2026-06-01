<?php

namespace Modules\AdminRoles\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * The RBAC guard for staff accounts.
     */
    private const GUARD = 'admin';

    /**
     * Permission catalogue, named `<area>.<action>`.
     *
     * @var list<string>
     */
    private const PERMISSIONS = [
        'songs.view', 'songs.manage',
        'artists.manage',
        'categories.manage',
        'playlists.manage',
        'waazi.view', 'waazi.manage',
        'preachers.manage',
        'series.manage',
        'users.view', 'users.manage',
        'comments.moderate',
        'reports.handle',
        'subscriptions.manage',
        'payments.view',
        'ads.manage',
        'analytics.view',
        'broadcasts.manage',
        'settings.manage',
        'activity.view',
        'roles.manage',
        'admins.manage',
    ];

    /**
     * Role => permissions. `super-admin` receives every permission.
     *
     * @var array<string, list<string>>
     */
    private const ROLES = [
        'content-manager' => [
            'songs.view', 'songs.manage', 'artists.manage', 'categories.manage',
            'playlists.manage', 'waazi.view', 'waazi.manage', 'preachers.manage',
            'series.manage',
        ],
        'moderator' => [
            'comments.moderate', 'reports.handle', 'users.view',
        ],
        'finance' => [
            'subscriptions.manage', 'payments.view', 'analytics.view',
        ],
        'analyst' => [
            'analytics.view', 'users.view',
        ],
        'support' => [
            'users.view', 'comments.moderate',
        ],
    ];

    public function run(): void
    {
        App::make(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, self::GUARD);
        }

        // Refresh the cache so the freshly created permissions are resolvable
        // by name when syncing them onto roles below.
        App::make(PermissionRegistrar::class)->forgetCachedPermissions();

        $superAdmin = Role::findOrCreate('super-admin', self::GUARD);
        $superAdmin->syncPermissions(Permission::where('guard_name', self::GUARD)->get());

        foreach (self::ROLES as $roleName => $permissions) {
            $role = Role::findOrCreate($roleName, self::GUARD);
            $role->syncPermissions($permissions);
        }

        App::make(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
