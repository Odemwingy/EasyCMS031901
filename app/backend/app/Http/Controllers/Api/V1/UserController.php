<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\InteractsWithAuditLogs;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ResetUserPasswordRequest;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Http\Requests\Admin\UserIndexRequest;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use InteractsWithAuditLogs;

    public function index(UserIndexRequest $request): JsonResponse
    {
        $query = User::query()->with('roles');

        if ($keyword = $request->string('keyword')->toString()) {
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('username', 'like', "%{$keyword}%")
                    ->orWhere('name', 'like', "%{$keyword}%");
            });
        }

        if ($orgId = $request->string('org_id')->toString()) {
            $query->where('org_id', $orgId);
        }

        if ($status = $request->integer('status')) {
            $query->where('status', $status);
        }

        if ($userType = $request->integer('user_type')) {
            $query->where('user_type', $userType);
        }

        if ($roleId = $request->integer('role_id')) {
            $query->whereHas('roles', fn ($builder) => $builder->where('roles.id', $roleId));
        }

        $page = max($request->integer('page', 1), 1);
        $size = $request->integer('per_page') ?: $request->integer('size', 20);
        $users = $query
            ->orderByDesc('id')
            ->paginate($size, ['*'], 'page', $page);

        $users->getCollection()->transform(function (User $user): User {
            $user->setAttribute('project_ids', $this->fetchProjectIds($user->id));

            return $user;
        });

        return $this->success([
            'total' => $users->total(),
            'per_page' => $users->perPage(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage(),
            'list' => UserResource::collection($users->getCollection()),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::query()->with('roles')->findOrFail($id);
        $user->setAttribute('project_ids', $this->fetchProjectIds($user->id));

        return $this->success(UserResource::make($user));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();

        $user = DB::transaction(function () use ($request, $operator): User {
            $user = User::query()->create([
                'username' => $request->string('username')->toString(),
                'name' => $request->string('name')->toString(),
                'email' => sprintf('%s@easycms.local', $request->string('username')->toString()),
                'password' => Hash::make($request->string('password')->toString()),
                'user_type' => $request->integer('user_type'),
                'org_id' => $request->string('org_id')->toString(),
                'status' => $request->integer('status', 1),
                'must_change_password' => true,
                'created_by' => $operator->id,
                'remark' => $request->input('remark'),
            ]);

            $user->roles()->sync($request->input('role_ids', []));
            $this->syncProjects($user->id, $request->input('project_ids', []));

            return $user->load('roles');
        });

        $user->setAttribute('project_ids', $this->fetchProjectIds($user->id));

        $this->writeAuditLog(
            'admin_user_create',
            $operator,
            'create',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            null,
            UserResource::make($user)->resolve()
        );

        return $this->success([
            'id' => $user->id,
            'username' => $user->username,
            'name' => $user->name,
            'status' => $user->status,
            'status_label' => $user->status === 1 ? '启用' : '停用',
            'created_at' => optional($user->created_at)?->toIso8601String(),
        ], '用户创建成功');
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $user = User::query()->with('roles')->findOrFail($id);
        $beforeUser = clone $user;
        $beforeUser->setRelation('roles', $user->roles);
        $beforeUser->setAttribute('project_ids', $this->fetchProjectIds($user->id));
        $before = UserResource::make($beforeUser)->resolve();

        DB::transaction(function () use ($request, $user): void {
            $user->update([
                'name' => $request->string('name')->toString(),
                'user_type' => $request->integer('user_type'),
                'org_id' => $request->string('org_id')->toString(),
                'status' => $request->integer('status'),
                'remark' => $request->input('remark'),
            ]);

            $user->roles()->sync($request->input('role_ids', []));
            $this->syncProjects($user->id, $request->input('project_ids', []));
        });

        $user->refresh()->load('roles');
        $user->setAttribute('project_ids', $this->fetchProjectIds($user->id));

        $this->writeAuditLog(
            'admin_user_update',
            $operator,
            'edit',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            $before,
            UserResource::make($user)->resolve()
        );

        return $this->success(UserResource::make($user), '用户信息已更新');
    }

    public function updateStatus(UpdateUserStatusRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $user = User::query()->with('roles')->findOrFail($id);
        $targetStatus = $request->integer('status');

        if ($targetStatus === 2 && $this->isLastSystemAdmin($user)) {
            $this->writeAuditLog(
                'admin_user_status_change',
                $operator,
                'toggle-status',
                2,
                '系统至少需要保留一个启用状态的系统管理员账号',
                'user',
                (string) $user->id,
                $user->name,
                ['status' => $user->status],
                ['status' => $targetStatus]
            );

            return $this->businessError('系统至少需要保留一个启用状态的系统管理员账号');
        }

        $beforeStatus = $user->status;

        $user->forceFill([
            'status' => $targetStatus,
            'locked_at' => $targetStatus === 2 ? $user->locked_at : null,
            'login_fail_count' => $targetStatus === 1 ? 0 : $user->login_fail_count,
        ])->save();

        $this->writeAuditLog(
            'admin_user_status_change',
            $operator,
            'toggle-status',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            ['status' => $beforeStatus],
            ['status' => $targetStatus]
        );

        return $this->success(null, $targetStatus === 1 ? '用户已启用' : '用户已停用');
    }

    public function unlock(Request $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $user = User::query()->findOrFail($id);

        $user->forceFill([
            'status' => 1,
            'login_fail_count' => 0,
            'locked_at' => null,
        ])->save();

        $this->writeAuditLog(
            'admin_user_unlock',
            $operator,
            'unlock',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            ['status' => 3],
            ['status' => 1]
        );

        return $this->success(null, '账号已解锁');
    }

    public function resetPassword(ResetUserPasswordRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $user = User::query()->findOrFail($id);

        $newPassword = $request->filled('new_password')
            ? $request->string('new_password')->toString()
            : $this->generatePassword();

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'must_change_password' => true,
            'login_fail_count' => 0,
            'locked_at' => null,
            'status' => $user->status === 3 ? 1 : $user->status,
        ])->save();

        $this->writeAuditLog(
            'admin_user_password_reset',
            $operator,
            'reset-password',
            1,
            null,
            'user',
            (string) $user->id,
            $user->name,
            null,
            ['must_change_password' => true]
        );

        return $this->success(null, '密码重置成功，用户下次登录须修改密码');
    }

    private function syncProjects(int $userId, array $projectIds): void
    {
        DB::table('user_projects')->where('user_id', $userId)->delete();

        if (empty($projectIds)) {
            return;
        }

        DB::table('user_projects')->insert(
            collect($projectIds)
                ->unique()
                ->map(fn (string $projectId): array => [
                    'user_id' => $userId,
                    'project_id' => $projectId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
                ->all()
        );
    }

    private function fetchProjectIds(int $userId): array
    {
        return DB::table('user_projects')
            ->where('user_id', $userId)
            ->orderBy('id')
            ->pluck('project_id')
            ->all();
    }

    private function isLastSystemAdmin(User $user): bool
    {
        if (!$user->roles->contains(fn ($role) => $role->code === 'system_admin')) {
            return false;
        }

        $activeAdmins = User::query()
            ->where('status', 1)
            ->whereHas('roles', fn ($builder) => $builder->where('roles.code', 'system_admin'))
            ->count();

        return $activeAdmins <= 1;
    }

    private function generatePassword(): string
    {
        return 'Abc' . random_int(10000, 99999);
    }
}
