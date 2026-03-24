<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;

class AuditLogDetailResource extends AuditLogListResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'before_value' => $this->before_value,
            'after_value' => $this->after_value,
            'fail_reason' => $this->fail_reason,
            'source_page' => $this->source_page,
            'request_id' => $this->request_id,
        ]);
    }
}
