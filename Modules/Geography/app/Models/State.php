<?php

namespace Modules\Geography\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Geography\Database\Factories\StateFactory;

class State extends Model
{
    /** @use HasFactory<StateFactory> */
    use HasFactory;

    protected $fillable = ['zone_id', 'name', 'code'];

    /**
     * @return BelongsTo<Zone, $this>
     */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * @return HasMany<Lga, $this>
     */
    public function lgas(): HasMany
    {
        return $this->hasMany(Lga::class);
    }

    protected static function newFactory(): StateFactory
    {
        return StateFactory::new();
    }
}
