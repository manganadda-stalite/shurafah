<?php

namespace Modules\Subscriptions\Enums;

/**
 * Billing interval for a subscription plan.
 */
enum SubscriptionInterval: string
{
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function label(): string
    {
        return match ($this) {
            self::Monthly => 'Monthly',
            self::Yearly => 'Yearly',
        };
    }
}
