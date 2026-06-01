<?php

namespace Modules\Auth\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Modules\Auth\Database\Factories\AdminUserFactory;
use Spatie\Permission\Traits\HasRoles;

class AdminUser extends Authenticatable
{
    /** @use HasFactory<AdminUserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * RBAC roles/permissions are resolved against the `admin` guard.
     */
    protected string $guard_name = 'admin';

    protected $table = 'admin_users';

    protected $fillable = [
        'full_name',
        'email',
        'password',
        'avatar_path',
        'status',
        'last_login_at',
        'two_factor_secret',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_secret' => 'encrypted',
        ];
    }

    protected static function newFactory(): AdminUserFactory
    {
        return AdminUserFactory::new();
    }
}
