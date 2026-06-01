<?php

namespace Modules\Subscriptions\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Subscriptions\Enums\SubscriptionInterval;
use Modules\Subscriptions\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Seed the Free and Premium (Monthly/Yearly) plans. Prices are stored in
     * kobo (minor units). The premium perks mirror the "320 kbps" / ad-free
     * benefits shown on the static profile mock-up; amounts are sensible
     * defaults and remain editable from the admin settings later.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'price_minor' => 0,
                'currency' => 'NGN',
                'interval' => SubscriptionInterval::Monthly,
                'interval_count' => 1,
                'features' => [
                    'ad_supported' => true,
                    'audio_quality_kbps' => 128,
                    'offline_downloads' => false,
                ],
                'is_active' => true,
                'sort_order' => 0,
            ],
            [
                'name' => 'Premium (Monthly)',
                'slug' => 'premium-monthly',
                'price_minor' => 150_000,
                'currency' => 'NGN',
                'interval' => SubscriptionInterval::Monthly,
                'interval_count' => 1,
                'features' => [
                    'ad_free' => true,
                    'audio_quality_kbps' => 320,
                    'offline_downloads' => true,
                ],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Premium (Yearly)',
                'slug' => 'premium-yearly',
                'price_minor' => 1_500_000,
                'currency' => 'NGN',
                'interval' => SubscriptionInterval::Yearly,
                'interval_count' => 1,
                'features' => [
                    'ad_free' => true,
                    'audio_quality_kbps' => 320,
                    'offline_downloads' => true,
                ],
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
