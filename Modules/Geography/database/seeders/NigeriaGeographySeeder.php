<?php

namespace Modules\Geography\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Geography\Models\Lga;
use Modules\Geography\Models\State;
use Modules\Geography\Models\Zone;

class NigeriaGeographySeeder extends Seeder
{
    /**
     * Seed Nigeria's 6 geopolitical zones, 36 states + FCT, and 774 LGAs.
     *
     * Idempotent: re-running updates existing rows by their unique codes rather
     * than duplicating them.
     */
    public function run(): void
    {
        /** @var array<int, array{name: string, code: string, states: array<int, array{name: string, code: string, lgas: array<int, string>}>}> $data */
        $data = require module_path('Geography', 'database/data/nigeria.php');

        foreach ($data as $zoneData) {
            $zone = Zone::updateOrCreate(
                ['code' => $zoneData['code']],
                ['name' => $zoneData['name']],
            );

            foreach ($zoneData['states'] as $stateData) {
                $state = State::updateOrCreate(
                    ['code' => $stateData['code']],
                    ['zone_id' => $zone->id, 'name' => $stateData['name']],
                );

                $existing = $state->lgas()->pluck('name')->all();
                $rows = [];

                foreach ($stateData['lgas'] as $lgaName) {
                    if (in_array($lgaName, $existing, true)) {
                        continue;
                    }

                    $rows[] = [
                        'state_id' => $state->id,
                        'name' => $lgaName,
                        'code' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                if ($rows !== []) {
                    Lga::insert($rows);
                }
            }
        }
    }
}
