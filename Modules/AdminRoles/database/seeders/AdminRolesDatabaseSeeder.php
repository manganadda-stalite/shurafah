<?php

namespace Modules\AdminRoles\Database\Seeders;

use Illuminate\Database\Seeder;

class AdminRolesDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            SuperAdminSeeder::class,
        ]);
    }
}
