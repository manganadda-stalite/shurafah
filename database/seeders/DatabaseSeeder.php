<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\AdminRoles\Database\Seeders\AdminRolesDatabaseSeeder;
use Modules\Geography\Database\Seeders\GeographyDatabaseSeeder;
use Modules\Subscriptions\Database\Seeders\SubscriptionsDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with the Phase 2 foundation data.
     */
    public function run(): void
    {
        $this->call([
            GeographyDatabaseSeeder::class,
            AdminRolesDatabaseSeeder::class,
            SubscriptionsDatabaseSeeder::class,
        ]);
    }
}
