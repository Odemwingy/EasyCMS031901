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
            'source_page' => $this->resolveSourcePage(),
            'request_id' => request()->headers->get('X-Request-ID') ?: (string) Str::uuid(),
            'ip_address' => request()->ip(),
        ]);
    }

    private function resolveSourcePage(): ?string
    {
        $referer = request()->headers->get('referer');

        if (!$referer) {
            return null;
        }

        $path = parse_url($referer, PHP_URL_PATH);

        return is_string($path) && $path !== '' ? $path : null;
    }
}
