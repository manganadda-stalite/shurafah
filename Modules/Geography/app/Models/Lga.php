<?php

namespace Modules\Geography\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Geography\Database\Factories\LgaFactory;

class Lga extends Model
{
    /** @use HasFactory<LgaFactory> */
    use HasFactory;

    protected $fillable = ['state_id', 'name', 'code'];

    /**
     * @return BelongsTo<State, $this>
     */
    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    protected static function newFactory(): LgaFactory
    {
        return LgaFactory::new();
    }
}
