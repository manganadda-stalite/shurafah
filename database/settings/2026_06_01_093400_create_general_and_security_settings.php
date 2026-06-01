<?php

use Spatie\LaravelSettings\Migrations\SettingsMigration;

return new class extends SettingsMigration
{
    public function up(): void
    {
        $this->migrator->add('general.site_name', 'Shurafah');
        $this->migrator->add('general.support_email', 'support@shurafah.test');
        $this->migrator->add('general.default_currency', 'NGN');
        $this->migrator->add('general.maintenance_mode', false);

        $this->migrator->add('security.otp_expiry_minutes', 10);
        $this->migrator->add('security.otp_max_attempts', 5);
        $this->migrator->add('security.max_login_attempts', 5);
        $this->migrator->add('security.force_admin_two_factor', false);
    }

    public function down(): void
    {
        $this->migrator->deleteIfExists('general.site_name');
        $this->migrator->deleteIfExists('general.support_email');
        $this->migrator->deleteIfExists('general.default_currency');
        $this->migrator->deleteIfExists('general.maintenance_mode');

        $this->migrator->deleteIfExists('security.otp_expiry_minutes');
        $this->migrator->deleteIfExists('security.otp_max_attempts');
        $this->migrator->deleteIfExists('security.max_login_attempts');
        $this->migrator->deleteIfExists('security.force_admin_two_factor');
    }
};
