<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission, string $writeOperation = 'false'): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return $this->jsonError(1002, '未登录或 token 失效', 401);
        }

        if (!$user->hasPermission($permission)) {
            return $this->jsonError(1003, '无权限', 403);
        }

        if ($this->toBoolean($writeOperation) && $user->hasReadonlyRole()) {
            return $this->jsonError(1003, '只读角色不允许执行写操作', 403);
        }

        return $next($request);
    }

    private function jsonError(int $code, string $message, int $status): JsonResponse
    {
        return response()->json([
            'code' => $code,
            'message' => $message,
            'data' => [],
            'timestamp' => now()->getTimestampMs(),
        ], $status);
    }

    private function toBoolean(string $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
