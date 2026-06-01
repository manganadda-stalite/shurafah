<?php

namespace Modules\Geography\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Geography\Models\Lga;
use Modules\Geography\Models\State;

/**
 * @extends Factory<Lga>
 */
class LgaFactory extends Factory
{
    protected $model = Lga::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'state_id' => State::factory(),
            'name' => fake()->city(),
            'code' => null,
        ];
    }
}
