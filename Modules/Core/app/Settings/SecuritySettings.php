<?php

namespace Modules\Core\Settings;

use Spatie\LaravelSettings\Settings;

class SecuritySettings extends Settings
{
    public int $otp_expiry_minutes;

    public int $otp_max_attempts;

    public int $max_login_attempts;

    public bool $force_admin_two_factor;

    public static function group(): string
    {
        return 'security';
    }
}
