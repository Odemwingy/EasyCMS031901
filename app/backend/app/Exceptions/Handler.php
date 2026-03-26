<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->renderable(function (ValidationException $exception, $request): ?JsonResponse {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'code' => 1001,
                'message' => '参数校验失败',
                'data' => [
                    'errors' => $exception->errors(),
                ],
                'timestamp' => now()->getTimestampMs(),
            ], $exception->status);
        });

        $this->renderable(function (AuthenticationException $exception, $request): ?JsonResponse {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'code' => 1002,
                'message' => '未登录或 token 失效',
                'data' => [],
                'timestamp' => now()->getTimestampMs(),
            ], 401);
        });

        $this->renderable(function (AuthorizationException $exception, $request): ?JsonResponse {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'code' => 1003,
                'message' => '无权限',
                'data' => [],
                'timestamp' => now()->getTimestampMs(),
            ], 403);
        });

        $this->renderable(function (ModelNotFoundException $exception, $request): ?JsonResponse {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'code' => 1004,
                'message' => '资源不存在',
                'data' => [],
                'timestamp' => now()->getTimestampMs(),
            ], 404);
        });

        $this->renderable(function (NotFoundHttpException $exception, $request): ?JsonResponse {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'code' => 1004,
                'message' => '资源不存在',
                'data' => [],
                'timestamp' => now()->getTimestampMs(),
            ], 404);
        });

        $this->renderable(function (Throwable $exception, $request): ?JsonResponse {
            if (
                !$request->is('api/*')
                || $exception instanceof ValidationException
                || $exception instanceof AuthenticationException
                || $exception instanceof AuthorizationException
                || $exception instanceof ModelNotFoundException
                || $exception instanceof NotFoundHttpException
            ) {
                return null;
            }

            report($exception);

            return response()->json([
                'code' => 5000,
                'message' => '服务器内部错误',
                'data' => [],
                'timestamp' => now()->getTimestampMs(),
            ], 500);
        });
    }
}
