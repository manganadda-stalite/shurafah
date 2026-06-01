<?php

namespace Modules\Auth\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Modules\Auth\Models\OtpCode;

/**
 * @extends Factory<OtpCode>
 */
class OtpCodeFactory extends Factory
{
    protected $model = OtpCode::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'phone' => '080'.fake()->numerify('########'),
            'code_hash' => Hash::make((string) fake()->numberBetween(100000, 999999)),
            'purpose' => 'phone_verification',
            'expires_at' => now()->addMinutes(10),
            'consumed_at' => null,
        ];
    }
}
