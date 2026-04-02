<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'type',
        'name',
        'permission',
        'route_path',
        'component',
        'icon',
        'sort',
        'status',
        'remark',
        'created_by',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'type' => 'integer',
        'sort' => 'integer',
        'status' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort')->orderBy('id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_menu_permissions')
            ->withPivot('is_explicit')
            ->withTimestamps();
    }
}
