<?php

/*
 * Phase 2 — Database Foundation.
 *
 * Verifies that `migrate:fresh --seed` produces the expected reference data:
 * the full Nigeria geography (6 zones / 37 states / 774 LGAs), the RBAC roles
 * and permissions with a bootstrap super-admin, the subscription plans, and the
 * general/security settings. A broken schema or seeder would change these
 * counts or relationships and fail the suite.
 */

use App\Enums\AccountType;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Models\AdminUser;
use Modules\Core\Settings\GeneralSettings;
use Modules\Core\Settings\SecuritySettings;
use Modules\Geography\Models\Lga;
use Modules\Geography\Models\State;
use Modules\Geography\Models\Zone;
use Modules\Subscriptions\Enums\SubscriptionInterval;
use Modules\Subscriptions\Models\SubscriptionPlan;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('seeds the full Nigeria geography', function () {
    $this->seed();

    expect(Zone::count())->toBe(6)
        ->and(State::count())->toBe(37)
        ->and(Lga::count())->toBe(774);

    // Lagos lives in the South West zone and has 20 LGAs.
    $lagos = State::where('code', 'LA')->firstOrFail();
    expect($lagos->zone->name)->toBe('South West')
        ->and($lagos->lgas()->count())->toBe(20);
});

it('seeds RBAC roles, permissions and a super-admin', function () {
    $this->seed();

    $expectedRoles = ['super-admin', 'content-manager', 'moderator', 'finance', 'analyst', 'support'];
    expect(Role::where('guard_name', 'admin')->pluck('name')->sort()->values()->all())
        ->toBe(collect($expectedRoles)->sort()->values()->all());

    // The super-admin role holds every defined permission.
    $permissionCount = Permission::where('guard_name', 'admin')->count();
    expect($permissionCount)->toBeGreaterThan(0)
        ->and(Role::findByName('super-admin', 'admin')->permissions()->count())->toBe($permissionCount);

    $admin = AdminUser::firstOrFail();
    expect($admin->email)->toBe('superadmin@shurafah.test')
        ->and($admin->hasRole('super-admin'))->toBeTrue();
});

it('seeds the subscription plans', function () {
    $this->seed();

    expect(SubscriptionPlan::pluck('slug')->sort()->values()->all())
        ->toBe(['free', 'premium-monthly', 'premium-yearly']);

    $monthly = SubscriptionPlan::where('slug', 'premium-monthly')->firstOrFail();
    expect($monthly->price_minor)->toBe(150_000)
        ->and($monthly->currency)->toBe('NGN')
        ->and($monthly->interval)->toBe(SubscriptionInterval::Monthly)
        ->and($monthly->features['ad_free'])->toBeTrue();
});

it('seeds general and security settings', function () {
    $this->seed();

    expect(app(GeneralSettings::class)->site_name)->toBe('Shurafah')
        ->and(app(GeneralSettings::class)->default_currency)->toBe('NGN')
        ->and(app(SecuritySettings::class)->otp_expiry_minutes)->toBe(10);
});

it('casts user enum attributes and hashes the password', function () {
    $user = User::factory()->premium()->create();

    expect($user->account_type)->toBe(AccountType::Premium)
        ->and($user->status)->toBe(UserStatus::Active)
        ->and($user->password)->not->toBe('password')
        ->and(Hash::check('password', $user->password))->toBeTrue();
});
