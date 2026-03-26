<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\InteractsWithAuditLogs;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use InteractsWithAuditLogs;

    public function login(LoginRequest $request): JsonResponse
    {
        $username = $request->string('username')->toString();
        $password = $request->string('password')->toString();

        $user = User::query()
            ->with('roles.menus')
            ->where('username', $username)
            ->first();

        if (!$user) {
            $this->writeAuditLog(
                'admin_login_fail',
                null,
                'login',
                2,
                '用户名或密码错误',
                'user',
                null,
                null,
                null,
                ['username' => $username]
            );

            return $this->businessError('用户名或密码错误，请重新输入');
        }

        $this->unlockExpiredUser($user);
        $user->refresh()->load('roles.menus');

        if ($user->status === 2) {
            $this->writeAuditLog(
                'admin_login_fail',
                $user,
                'login',
                2,
                '账号已停用',
                'user',
                (string) $user->id,
                $user->name
            );

            return $this->businessError('账号已停用，请联系管理员');
        }

        if ($user->status === 3) {
            $this->writeAuditLog(
                'admin_login_fail',
                $user,
                'login',
                2,
                '账号已锁定',
                'user',
                (string) $user->id,
                $user->name
            );

            return $this->businessError('账号已锁定，请联系管理员或 30 分钟后重试');
        }

        if (!Hash::check($password, $user->password)) {
            $this->handleLoginFailure($user, $username);

            return $this->businessError('用户名或密码错误，请重新输入');
        }

        $user->forceFill([
            'login_fail_count' => 0,
            'locked_at' => null,
            'last_login_at' => now(),
        ])->save();

        $token = $user->createToken('admin-web')->plainTextToken;
        $expiresAt = now()->addHours(8)->toIso8601String();

        $this->writeAuditLog(
            'admin_login_success',
            $user,
            'login',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            null,
            ['org_id' => $user->org_id]
        );

        return $this->success([
            'token' => $token,
            'expires_at' => $expiresAt,
            'user' => UserResource::make($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();
        $request->user()?->currentAccessToken()?->delete();

        if ($user) {
            $this->writeAuditLog(
                'admin_logout',
                $user,
                'logout',
                1,
                null,
                'user',
                (string) $user->id,
                $user->name
            );
        }

        return $this->success(null);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('roles');

        return $this->success(UserResource::make($user));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $currentPassword = $request->filled('old_password')
            ? $request->string('old_password')->toString()
            : $request->string('current_password')->toString();

        if (!Hash::check($currentPassword, $user->password)) {
            $this->writeAuditLog(
                'admin_user_password_change',
                $user,
                'change-password',
                2,
                '当前密码不正确',
                'user',
                (string) $user->id,
                $user->name
            );

            return $this->businessError('当前密码不正确');
        }

        $user->forceFill([
            'password' => Hash::make($request->string('new_password')->toString()),
            'must_change_password' => false,
        ])->save();

        $this->writeAuditLog(
            'admin_user_password_change',
            $user,
            'change-password',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name
        );

        return $this->success(null, '密码修改成功');
    }

    public function menus(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('roles.menus');

        $menus = $user->isSuperAdmin()
            ? Menu::query()
                ->where('status', 1)
                ->orderBy('sort')
                ->orderBy('id')
                ->get()
            : $user->roles
                ->pluck('menus')
                ->flatten()
                ->where('status', 1)
                ->unique('id')
                ->sortBy(fn (Menu $menu): string => str_pad((string) $menu->sort, 10, '0', STR_PAD_LEFT) . '-' . str_pad((string) $menu->id, 10, '0', STR_PAD_LEFT))
                ->values();

        return $this->success($this->buildMenuTree($menus));
    }

    private function handleLoginFailure(User $user, string $username): void
    {
        $failedCount = $user->login_fail_count + 1;
        $locked = $failedCount >= 5;

        $user->forceFill([
            'login_fail_count' => $failedCount,
            'status' => $locked ? 3 : $user->status,
            'locked_at' => $locked ? now() : null,
        ])->save();

        $this->writeAuditLog(
            'admin_login_fail',
            $user,
            'login',
            2,
            $locked ? '账号已锁定' : '用户名或密码错误',
            'user',
            (string) $user->id,
            $user->name,
            null,
            [
                'username' => $username,
                'login_fail_count' => $failedCount,
            ]
        );
    }

    private function unlockExpiredUser(User $user): void
    {
        if ($user->status !== 3 || !$user->locked_at) {
            return;
        }

        if ($user->locked_at->copy()->addMinutes(30)->isFuture()) {
            return;
        }

        $before = [
            'status' => 3,
            'login_fail_count' => $user->login_fail_count,
            'locked_at' => optional($user->locked_at)->toIso8601String(),
        ];

        $user->forceFill([
            'status' => 1,
            'login_fail_count' => 0,
            'locked_at' => null,
        ])->save();

        $this->writeAuditLog(
            'admin_user_unlock',
            $user,
            'unlock',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            $before,
            [
                'status' => 1,
                'login_fail_count' => 0,
                'locked_at' => null,
                'unlock_reason' => 'lock_expired',
            ]
        );
    }

    private function buildMenuTree(Collection $menus, ?int $parentId = null): array
    {
        return $menus
            ->where('parent_id', $parentId)
            ->map(function (Menu $menu) use ($menus): array {
                return [
                    'id' => $menu->id,
                    'parent_id' => $menu->parent_id,
                    'type' => $menu->type,
                    'name' => $menu->name,
                    'permission' => $menu->permission,
                    'route_path' => $menu->route_path,
                    'component' => $menu->component,
                    'icon' => $menu->icon,
                    'sort' => $menu->sort,
                    'status' => $menu->status,
                    'children' => $this->buildMenuTree($menus, $menu->id),
                ];
            })
            ->values()
            ->all();
    }
}
