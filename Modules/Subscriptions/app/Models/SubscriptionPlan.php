<?php

namespace Modules\Subscriptions\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Subscriptions\Database\Factories\SubscriptionPlanFactory;
use Modules\Subscriptions\Enums\SubscriptionInterval;

class SubscriptionPlan extends Model
{
    /** @use HasFactory<SubscriptionPlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price_minor',
        'currency',
        'interval',
        'interval_count',
        'features',
        'is_active',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price_minor' => 'integer',
            'interval' => SubscriptionInterval::class,
            'interval_count' => 'integer',
            'features' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    protected static function newFactory(): SubscriptionPlanFactory
    {
        return SubscriptionPlanFactory::new();
    }
}
