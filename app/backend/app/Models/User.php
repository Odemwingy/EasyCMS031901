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

    private const PERMISSION_ALIASES = [
        'admin:users:edit' => ['admin:users:update'],
        'admin:users:update' => ['admin:users:edit'],
        'admin:users:toggle-status' => ['admin:users:change-status'],
        'admin:users:change-status' => ['admin:users:toggle-status'],
        'admin:users:reset-password' => ['admin:users:update'],
        'admin:roles:edit' => ['admin:roles:update'],
        'admin:roles:update' => ['admin:roles:edit'],
        'admin:roles:toggle-status' => ['admin:roles:change-status'],
        'admin:roles:change-status' => ['admin:roles:toggle-status'],
        'admin:roles:create' => ['admin:roles:copy'],
        'admin:roles:copy' => ['admin:roles:create'],
        'admin:roles:assign-permissions' => ['admin:roles:list'],
        'admin:menus:edit' => ['admin:menus:update'],
        'admin:menus:update' => ['admin:menus:edit'],
        'admin:menus:toggle-status' => ['admin:menus:change-status'],
        'admin:menus:change-status' => ['admin:menus:toggle-status'],
    ];

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
        if ($this->isSuperAdmin()) {
            return true;
        }

        $ownedPermissions = $this->permissionCodes();

        foreach ($this->permissionVariants($permission) as $candidate) {
            if (in_array($candidate, $ownedPermissions, true)) {
                return true;
            }
        }

        return false;
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

    private function permissionVariants(string $permission): array
    {
        return array_values(array_unique([
            $permission,
            ...(self::PERMISSION_ALIASES[$permission] ?? []),
        ]));
    }
}
