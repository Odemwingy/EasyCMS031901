<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'parent_name' => $this->parent?->name,
            'type' => $this->type,
            'type_label' => match ($this->type) {
                1 => '目录',
                2 => '菜单项',
                3 => '按钮',
                default => '未知',
            },
            'name' => $this->name,
            'permission' => $this->permission,
            'route_path' => $this->route_path,
            'component' => $this->component,
            'icon' => $this->icon,
            'sort' => $this->sort,
            'status' => $this->status,
            'status_label' => $this->status === 1 ? '启用' : '停用',
            'remark' => $this->remark,
            'created_at' => optional($this->created_at)?->toIso8601String(),
            'updated_at' => optional($this->updated_at)?->toIso8601String(),
        ];
    }
}
