<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    protected function success(mixed $data = [], string $message = 'success'): JsonResponse
    {
        return response()->json([
            'code' => 0,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->getTimestampMs(),
        ]);
    }

    protected function error(int $code, string $message, mixed $data = [], int $status = 400): JsonResponse
    {
        return response()->json([
            'code' => $code,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->getTimestampMs(),
        ], $status);
    }

    protected function businessError(string $message, mixed $data = []): JsonResponse
    {
        return $this->error(1005, $message, $data, 422);
    }
}
