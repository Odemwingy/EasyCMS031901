<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('change-password', [AuthController::class, 'changePassword']);
            Route::get('me', [AuthController::class, 'me']);
            Route::get('menus', [AuthController::class, 'menus']);
        });
    });

    Route::middleware('auth:sanctum')->prefix('admin')->group(function (): void {
        Route::get('users', [UserController::class, 'index'])->middleware('admin.permission:admin:users:list');
        Route::get('users/{id}', [UserController::class, 'show'])->middleware('admin.permission:admin:users:list');
        Route::post('users', [UserController::class, 'store'])->middleware('admin.permission:admin:users:create,true');
        Route::put('users/{id}', [UserController::class, 'update'])->middleware('admin.permission:admin:users:edit,true');
        Route::patch('users/{id}/status', [UserController::class, 'updateStatus'])->middleware('admin.permission:admin:users:toggle-status,true');
        Route::patch('users/{id}/unlock', [UserController::class, 'unlock'])->middleware('admin.permission:admin:users:toggle-status,true');
        Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword'])->middleware('admin.permission:admin:users:reset-password,true');

        Route::get('roles', [RoleController::class, 'index'])->middleware('admin.permission:admin:roles:list');
        Route::get('roles/{id}', [RoleController::class, 'show'])->middleware('admin.permission:admin:roles:list');
        Route::post('roles', [RoleController::class, 'store'])->middleware('admin.permission:admin:roles:create,true');
        Route::put('roles/{id}', [RoleController::class, 'update'])->middleware('admin.permission:admin:roles:edit,true');
        Route::post('roles/{id}/copy', [RoleController::class, 'copy'])->middleware('admin.permission:admin:roles:create,true');
        Route::patch('roles/{id}/status', [RoleController::class, 'updateStatus'])->middleware('admin.permission:admin:roles:toggle-status,true');
        Route::delete('roles/{id}', [RoleController::class, 'destroy'])->middleware('admin.permission:admin:roles:delete,true');
        Route::get('roles/{id}/permissions', [RoleController::class, 'permissions'])->middleware('admin.permission:admin:roles:assign-permissions');
        Route::put('roles/{id}/permissions', [RoleController::class, 'updatePermissions'])->middleware('admin.permission:admin:roles:assign-permissions,true');

        Route::get('menus/tree', [MenuController::class, 'tree'])->middleware('admin.permission:admin:menus:list');
        Route::post('menus', [MenuController::class, 'store'])->middleware('admin.permission:admin:menus:create,true');
        Route::put('menus/{id}', [MenuController::class, 'update'])->middleware('admin.permission:admin:menus:edit,true');
        Route::patch('menus/{id}/status', [MenuController::class, 'updateStatus'])->middleware('admin.permission:admin:menus:toggle-status,true');
        Route::delete('menus/{id}', [MenuController::class, 'destroy'])->middleware('admin.permission:admin:menus:delete,true');

        Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('admin.permission:admin:audit-logs:list');
        Route::get('audit-logs/{id}', [AuditLogController::class, 'show'])->middleware('admin.permission:admin:audit-logs:list');
    });
});
