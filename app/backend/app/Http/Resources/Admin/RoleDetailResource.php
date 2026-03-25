<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $menus = $this->menus ?? collect();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'data_scope' => match ($this->data_scope) {
                'org' => 2,
                'project' => 3,
                default => 1,
            },
            'data_scope_label' => match ($this->data_scope) {
                'org' => '组织级',
                'project' => '项目级',
                default => '全部数据',
            },
            'status' => $this->status,
            'status_label' => $this->status === 1 ? '启用' : '停用',
            'is_system_preset' => (bool) $this->is_system_preset,
            'is_readonly' => (bool) $this->is_readonly,
            'user_count' => (int) ($this->users_count ?? $this->users?->count() ?? 0),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
            'module_permissions' => $menus->where('type', 1)->pluck('name')->values()->all(),
            'page_permissions' => $menus->where('type', 2)->pluck('name')->values()->all(),
            'operation_permissions' => $menus->where('type', 3)->map(fn ($menu) => [
                'id' => $menu->id,
                'name' => $menu->name,
                'permission' => $menu->permission,
                'parent_name' => $menu->parent?->name,
            ])->values()->all(),
            'permissions' => $menus->pluck('permission')->filter()->values()->all(),
            'users' => ($this->users ?? collect())->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->name,
                    'org_id' => $user->org_id,
                    'org_name' => config('easycms.orgs')[$user->org_id] ?? $user->org_id,
                    'status' => $user->status,
                    'status_label' => match ($user->status) {
                        1 => '启用',
                        2 => '停用',
                        3 => '锁定',
                        4 => '未激活',
                        default => '未知',
                    },
                    'assigned_at' => optional($user->pivot?->created_at)?->toIso8601String(),
                ];
            })->values()->all(),
        ];
    }
}
