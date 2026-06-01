<?php

namespace Modules\AdminRoles\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Auth\Models\AdminUser;

class SuperAdminSeeder extends Seeder
{
    /**
     * Create (or update) the bootstrap super-admin staff account and grant it
     * the `super-admin` role.
     *
     * The password is read from the SUPER_ADMIN_PASSWORD env var and is never
     * hard-coded. When it is absent (e.g. CI / fresh local), a strong random
     * password is generated and printed once so the account is never seeded
     * with a guessable credential.
     */
    public function run(): void
    {
        $email = (string) config('auth.super_admin.email', 'superadmin@shurafah.test');
        $configuredPassword = config('auth.super_admin.password');
        $hasConfiguredPassword = is_string($configuredPassword) && $configuredPassword !== '';

        $password = $hasConfiguredPassword ? $configuredPassword : Str::password(20);

        $admin = AdminUser::withTrashed()->firstOrNew(['email' => $email]);
        $admin->full_name = $admin->full_name ?: 'Super Admin';
        $admin->status = 'active';
        $admin->email_verified_at ??= now();

        // Only (re)set the password when one is explicitly supplied or the
        // account is being created for the first time.
        if (! $admin->exists || $hasConfiguredPassword) {
            $admin->password = Hash::make($password);
        }

        if ($admin->trashed()) {
            $admin->restore();
        }

        $admin->save();
        $admin->syncRoles(['super-admin']);

        if (! $hasConfiguredPassword) {
            $this->command->warn("Generated super-admin password for {$email}: {$password}");
            $this->command->warn('Set SUPER_ADMIN_PASSWORD in your environment to control this.');
        }
    }
}
