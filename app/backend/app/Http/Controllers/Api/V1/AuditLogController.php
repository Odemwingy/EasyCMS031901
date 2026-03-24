<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AuditLogIndexRequest;
use App\Http\Resources\Admin\AuditLogDetailResource;
use App\Http\Resources\Admin\AuditLogListResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AuditLogController extends Controller
{
    public function index(AuditLogIndexRequest $request): JsonResponse
    {
        $query = AuditLog::query()->orderByDesc('id');

        if ($logType = $request->string('log_type')->toString()) {
            $query->where('log_type', $logType);
        }

        if ($operatorId = $request->integer('operator_id')) {
            $query->where('operator_id', $operatorId);
        }

        if ($objectType = $request->string('object_type')->toString()) {
            $query->where('object_type', $objectType);
        }

        if ($objectId = $request->string('object_id')->toString()) {
            $query->where('object_id', 'like', "%{$objectId}%");
        }

        if ($projectId = $request->string('project_id')->toString()) {
            $query->where('project_id', $projectId);
        }

        if ($startTime = $request->string('start_time')->toString()) {
            $query->where('created_at', '>=', $startTime);
        }

        if ($endTime = $request->string('end_time')->toString()) {
            $query->where('created_at', '<=', $endTime);
        }

        $page = max($request->integer('page', 1), 1);
        $size = $request->integer('per_page', 20);
        $logs = $query->paginate($size, ['*'], 'page', $page);

        return $this->success([
            'total' => $logs->total(),
            'per_page' => $logs->perPage(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'list' => AuditLogListResource::collection($logs->getCollection()),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $log = AuditLog::query()->findOrFail($id);

        return $this->success(AuditLogDetailResource::make($log));
    }
}
