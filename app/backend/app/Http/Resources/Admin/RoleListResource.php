<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'data_scope' => $this->dataScopeValue(),
            'is_system_preset' => (bool) $this->is_system_preset,
            'status' => $this->status,
            'status_label' => $this->status === 1 ? '启用' : '停用',
            'user_count' => (int) ($this->users_count ?? $this->user_count ?? 0),
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
        ];
    }

    private function dataScopeValue(): int
    {
        return match ($this->data_scope) {
            'org' => 2,
            'project' => 3,
            default => 1,
        };
    }
}
