<?php

namespace App\Enums;

/**
 * End-user account tier. A "guest" is the absence of a user row, so it is not
 * represented here; every persisted user is at least `free`.
 */
enum AccountType: string
{
    case Free = 'free';
    case Premium = 'premium';

    public function label(): string
    {
        return match ($this) {
            self::Free => 'Free',
            self::Premium => 'Premium',
        };
    }
}
