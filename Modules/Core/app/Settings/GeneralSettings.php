<?php

namespace Modules\Core\Settings;

use Spatie\LaravelSettings\Settings;

class GeneralSettings extends Settings
{
    public string $site_name;

    public string $support_email;

    public string $default_currency;

    public bool $maintenance_mode;

    public static function group(): string
    {
        return 'general';
    }
}
