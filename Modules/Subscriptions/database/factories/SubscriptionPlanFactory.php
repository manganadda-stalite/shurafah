<?php

namespace Modules\Subscriptions\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Subscriptions\Enums\SubscriptionInterval;
use Modules\Subscriptions\Models\SubscriptionPlan;

/**
 * @extends Factory<SubscriptionPlan>
 */
class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'price_minor' => fake()->numberBetween(0, 5_000_00),
            'currency' => 'NGN',
            'interval' => SubscriptionInterval::Monthly,
            'interval_count' => 1,
            'features' => ['ad_free' => true],
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
