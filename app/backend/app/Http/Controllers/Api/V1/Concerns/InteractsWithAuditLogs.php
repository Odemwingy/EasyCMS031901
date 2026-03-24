<?php

namespace App\Http\Controllers\Api\V1\Concerns;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Str;

trait InteractsWithAuditLogs
{
    protected function writeAuditLog(
        string $logType,
        ?User $operator,
        string $action,
        int $result,
        ?string $failReason = null,
        ?string $objectType = null,
        ?string $objectId = null,
        ?string $objectName = null,
        ?array $beforeValue = null,
        ?array $afterValue = null
    ): void {
        AuditLog::query()->create([
            'log_type' => $logType,
            'operator_id' => $operator?->id,
            'operator_name' => $operator?->name,
            'action' => $action,
            'object_type' => $objectType,
            'object_id' => $objectId,
            'object_name' => $objectName,
            'before_value' => $beforeValue,
            'after_value' => $afterValue,
            'result' => $result,
            'fail_reason' => $failReason,
            'request_id' => (string) Str::uuid(),
            'ip_address' => request()->ip(),
        ]);
    }
}
