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
            'org_id' => $this->org_id,
            'status' => $this->status,
            'must_change_password' => $this->must_change_password,
            'last_login_at' => optional($this->last_login_at)?->toIso8601String(),
            'roles' => $this->roles->pluck('code')->values(),
        ];
    }
}
