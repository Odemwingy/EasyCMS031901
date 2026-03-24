<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'user_type',
        'org_id',
        'status',
        'must_change_password',
        'login_fail_count',
        'locked_at',
        'last_login_at',
        'created_by',
        'remark',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'locked_at' => 'datetime',
        'last_login_at' => 'datetime',
        'user_type' => 'integer',
        'status' => 'integer',
        'must_change_password' => 'boolean',
        'password' => 'hashed',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')->withTimestamps();
    }

    public function isSuperAdmin(): bool
    {
        return $this->activeRoles()->contains(
            fn (Role $role): bool => $role->code === 'system_admin'
        );
    }

    public function permissionCodes(): array
    {
        if ($this->isSuperAdmin()) {
            return Menu::query()
                ->where('status', 1)
                ->whereNotNull('permission')
                ->pluck('permission')
                ->filter()
                ->unique()
                ->values()
                ->all();
        }

        return $this->activeRoles()
            ->pluck('menus')
            ->flatten()
            ->where('status', 1)
            ->pluck('permission')
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->isSuperAdmin() || in_array($permission, $this->permissionCodes(), true);
    }

    public function hasReadonlyRole(): bool
    {
        if ($this->isSuperAdmin()) {
            return false;
        }

        return $this->activeRoles()->contains(
            fn (Role $role): bool => $role->is_readonly
        );
    }

    private function activeRoles(): Collection
    {
        $roles = $this->relationLoaded('roles')
            ? $this->getRelation('roles')
            : $this->roles()->with('menus')->get();

        if ($roles instanceof EloquentCollection) {
            $roles->loadMissing('menus');
        }

        return $roles
            ->filter(fn (Role $role): bool => $role->status === 1)
            ->values();
    }
}
