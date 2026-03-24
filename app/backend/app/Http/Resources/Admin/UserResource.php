<?php

namespace App\Http\Resources\Admin;

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
            'org_name' => config('easycms.orgs')[$this->org_id] ?? $this->org_id,
            'roles' => $this->roles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'code' => $role->code,
            ])->values()->all(),
            'project_ids' => $this->project_ids ?? [],
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
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'remark' => $this->remark,
        ];
    }
}
