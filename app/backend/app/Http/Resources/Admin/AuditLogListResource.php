<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'log_type' => $this->log_type,
            'log_type_label' => $this->logTypeLabel(),
            'operator_id' => $this->operator_id,
            'operator_name' => $this->operator_name,
            'action' => $this->action,
            'action_label' => $this->actionLabel(),
            'object_type' => $this->object_type,
            'object_type_label' => $this->objectTypeLabel(),
            'object_id' => $this->object_id,
            'object_name' => $this->object_name,
            'result' => $this->result,
            'result_label' => $this->result === 1 ? '成功' : '失败',
            'project_id' => $this->project_id,
            'created_at' => optional($this->created_at)?->toIso8601String(),
        ];
    }

    private function logTypeLabel(): string
    {
        return match (true) {
            str_contains($this->log_type, 'login') => '登录相关',
            str_contains($this->log_type, 'role') => '角色权限操作',
            str_contains($this->log_type, 'menu') => '菜单操作',
            str_contains($this->log_type, 'user') => '用户权限操作',
            default => $this->log_type,
        };
    }

    private function actionLabel(): string
    {
        return match ($this->action) {
            'create' => '新建',
            'edit' => '编辑',
            'toggle-status' => '切换状态',
            'reset-password' => '重置密码',
            'change-password' => '修改密码',
            'unlock' => '解锁',
            'copy' => '复制',
            'assign-permissions' => '配置权限',
            'delete' => '删除',
            'login' => '登录',
            'logout' => '登出',
            default => $this->action,
        };
    }

    private function objectTypeLabel(): string
    {
        return match ($this->object_type) {
            'user' => '用户',
            'role' => '角色',
            'menu' => '菜单',
            default => $this->object_type ?: '-',
        };
    }
}
