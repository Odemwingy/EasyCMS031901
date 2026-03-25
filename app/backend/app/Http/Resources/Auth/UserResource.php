<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'name' => $this->name,
            'user_type' => $this->user_type,
            'user_type_label' => $this->user_type === 1 ? '内部员工' : '企业客户',
            'org_id' => $this->org_id,
            'status' => $this->status,
            'status_label' => match ($this->status) {
                1 => '启用',
                2 => '停用',
                3 => '锁定',
                4 => '未激活',
                default => '未知',
            },
            'must_change_password' => $this->must_change_password,
            'last_login_at' => optional($this->last_login_at)?->toIso8601String(),
            'roles' => $this->roles
                ->map(fn ($role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'code' => $role->code,
                ])
                ->values()
                ->all(),
        ];
    }
}
