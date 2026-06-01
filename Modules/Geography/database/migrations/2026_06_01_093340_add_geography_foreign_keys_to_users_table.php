<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Attach the geography foreign keys to `users`. The columns were created in
     * the base users migration; the constraints are added here, after the
     * `zones`/`states`/`lgas` tables exist. On SQLite (used in tests) adding a
     * foreign key to an existing table is a no-op, so guard accordingly.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('zone_id')->references('id')->on('zones')->nullOnDelete();
            $table->foreign('state_id')->references('id')->on('states')->nullOnDelete();
            $table->foreign('lga_id')->references('id')->on('lgas')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['zone_id']);
            $table->dropForeign(['state_id']);
            $table->dropForeign(['lga_id']);
        });
    }
};
