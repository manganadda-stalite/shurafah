<?php

namespace Modules\Geography\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Geography\Models\State;
use Modules\Geography\Models\Zone;

/**
 * @extends Factory<State>
 */
class StateFactory extends Factory
{
    protected $model = State::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->city();

        return [
            'zone_id' => Zone::factory(),
            'name' => $name,
            'code' => Str::upper(Str::substr(Str::slug($name), 0, 3)).fake()->unique()->numberBetween(10, 99),
        ];
    }
}
