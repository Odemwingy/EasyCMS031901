<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\InteractsWithAuditLogs;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CopyRoleRequest;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRolePermissionsRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Http\Requests\Admin\UpdateRoleStatusRequest;
use App\Http\Resources\Admin\RoleDetailResource;
use App\Http\Resources\Admin\RoleListResource;
use App\Models\Menu;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    use InteractsWithAuditLogs;

    public function index(Request $request): JsonResponse
    {
        $query = Role::query()
            ->withCount('users')
            ->orderBy('is_system_preset', 'desc')
            ->orderBy('id');

        if ($keyword = $request->string('keyword')->toString()) {
            $query->where(function ($builder) use ($keyword): void {
                $builder->where('name', 'like', "%{$keyword}%")
                    ->orWhere('code', 'like', "%{$keyword}%");
            });
        }

        if ($status = $request->integer('status')) {
            $query->where('status', $status);
        }

        $page = max($request->integer('page', 1), 1);
        $size = $request->integer('per_page', 20);
        $roles = $query->paginate($size, ['*'], 'page', $page);

        return $this->success([
            'total' => $roles->total(),
            'per_page' => $roles->perPage(),
            'current_page' => $roles->currentPage(),
            'last_page' => $roles->lastPage(),
            'list' => RoleListResource::collection($roles->getCollection()),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $role = Role::query()
            ->withCount('users')
            ->with([
                'menus' => fn ($query) => $query->with('parent')->orderBy('sort')->orderBy('id'),
                'users' => fn ($query) => $query->orderBy('user_roles.created_at'),
            ])
            ->findOrFail($id);

        if ($role->code === 'system_admin') {
            $allMenus = Menu::query()
                ->with('parent')
                ->where('status', 1)
                ->orderBy('sort')
                ->orderBy('id')
                ->get();

            $role->setRelation('menus', $allMenus);
        }

        return $this->success(RoleDetailResource::make($role));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();

        $role = Role::query()->create([
            'name' => $request->string('name')->toString(),
            'code' => $request->string('code')->toString(),
            'description' => $request->input('description'),
            'data_scope' => 'all',
            'status' => $request->integer('status'),
            'created_by' => $operator->id,
        ]);

        $this->writeAuditLog(
            'admin_role_create',
            $operator,
            'create',
            1,
            null,
            'role',
            (string) $role->id,
            $role->name,
            null,
            RoleListResource::make($role->loadCount('users'))->resolve()
        );

        return $this->success([
            'id' => $role->id,
            'name' => $role->name,
            'code' => $role->code,
            'status' => $role->status,
            'created_at' => optional($role->created_at)?->toIso8601String(),
        ], '角色创建成功');
    }

    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $role = Role::query()->withCount('users')->findOrFail($id);
        $before = RoleListResource::make($role)->resolve();

        $role->update([
            'name' => $request->string('name')->toString(),
            'description' => $request->input('description'),
            'status' => $request->integer('status'),
        ]);

        $updatedRole = $role->fresh()->loadCount('users');

        $this->writeAuditLog(
            'admin_role_update',
            $operator,
            'edit',
            1,
            null,
            'role',
            (string) $role->id,
            $role->name,
            $before,
            RoleListResource::make($updatedRole)->resolve()
        );

        return $this->success(RoleDetailResource::make($updatedRole->load([
            'menus' => fn ($query) => $query->with('parent')->orderBy('sort')->orderBy('id'),
            'users' => fn ($query) => $query->orderBy('user_roles.created_at'),
        ])), '角色信息已更新');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $role = Role::query()->withCount('users')->findOrFail($id);

        if ($role->is_system_preset) {
            $message = '系统预置角色不可删除';

            $this->writeAuditLog(
                'admin_role_delete',
                $operator,
                'delete',
                2,
                $message,
                'role',
                (string) $role->id,
                $role->name
            );

            return $this->businessError($message);
        }

        if ($role->users_count > 0) {
            $message = '该角色下存在用户，请先解绑后再删除';

            $this->writeAuditLog(
                'admin_role_delete',
                $operator,
                'delete',
                2,
                $message,
                'role',
                (string) $role->id,
                $role->name
            );

            return $this->businessError($message);
        }

        $before = RoleListResource::make($role)->resolve();
        $role->delete();

        $this->writeAuditLog(
            'admin_role_delete',
            $operator,
            'delete',
            1,
            null,
            'role',
            (string) $role->id,
            $role->name,
            $before,
            null
        );

        return $this->success(null, '角色已删除');
    }

    public function copy(CopyRoleRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $sourceRole = Role::query()->with('menus')->findOrFail($id);

        $role = DB::transaction(function () use ($request, $sourceRole, $operator): Role {
            $role = Role::query()->create([
                'name' => $request->string('name')->toString(),
                'code' => $request->string('code')->toString(),
                'description' => $sourceRole->description,
                'data_scope' => $sourceRole->data_scope,
                'status' => 1,
                'created_by' => $operator->id,
            ]);

            $role->menus()->sync($sourceRole->menus->pluck('id')->all());

            return $role;
        });

        $this->writeAuditLog(
            'admin_role_copy',
            $operator,
            'copy',
            1,
            null,
            'role',
            (string) $role->id,
            $role->name,
            ['source_role_id' => $sourceRole->id, 'source_role_name' => $sourceRole->name],
            ['id' => $role->id, 'name' => $role->name, 'code' => $role->code]
        );

        return $this->success([
            'id' => $role->id,
            'name' => $role->name,
            'code' => $role->code,
            'status' => $role->status,
            'created_at' => optional($role->created_at)?->toIso8601String(),
        ], '角色创建成功');
    }

    public function updateStatus(UpdateRoleStatusRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $role = Role::query()->findOrFail($id);
        $targetStatus = $request->integer('status');

        if ($role->code === 'system_admin' && $targetStatus === 2) {
            $message = '系统管理员角色不允许停用';

            $this->writeAuditLog(
                'admin_role_status_change',
                $operator,
                'toggle-status',
                2,
                $message,
                'role',
                (string) $role->id,
                $role->name,
                ['status' => $role->status],
                ['status' => $targetStatus]
            );

            return $this->businessError($message);
        }

        if ($targetStatus === 2) {
            $activeUserCount = $role->users()
                ->where('users.status', 1)
                ->count();

            if ($activeUserCount > 0) {
                $message = "该角色下存在 {$activeUserCount} 个启用用户，请先解绑或停用相关用户后再停用";

                $this->writeAuditLog(
                    'admin_role_status_change',
                    $operator,
                    'toggle-status',
                    2,
                    $message,
                    'role',
                    (string) $role->id,
                    $role->name,
                    ['status' => $role->status],
                    ['status' => $targetStatus]
                );

                return $this->businessError($message);
            }
        }

        $beforeStatus = $role->status;
        $role->update(['status' => $targetStatus]);

        $this->writeAuditLog(
            'admin_role_status_change',
            $operator,
            'toggle-status',
            1,
            null,
            'role',
            (string) $role->id,
            $role->name,
            ['status' => $beforeStatus],
            ['status' => $targetStatus]
        );

        return $this->success(null, $targetStatus === 1 ? '角色已启用' : '角色已停用');
    }

    public function permissions(int $id): JsonResponse
    {
        $role = Role::query()
            ->with(['menus' => fn ($query) => $query->select('menus.id', 'menus.permission', 'menus.type')])
            ->findOrFail($id);

        $permissions = $role->code === 'system_admin'
            ? Menu::query()
                ->where('status', 1)
                ->where('type', 3)
                ->pluck('permission')
                ->filter()
                ->values()
                ->all()
            : $role->menus
                ->where('type', 3)
                ->pluck('permission')
                ->filter()
                ->values()
                ->all();

        return $this->success([
            'role_id' => $role->id,
            'permissions' => $permissions,
        ]);
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $role = Role::query()->with('menus:id,permission')->findOrFail($id);

        if ($role->code === 'system_admin') {
            $message = '系统管理员为内置超级角色，权限不可编辑';

            $this->writeAuditLog(
                'admin_role_permissions_update',
                $operator,
                'assign-permissions',
                2,
                $message,
                'role',
                (string) $role->id,
                $role->name
            );

            return $this->businessError($message);
        }

        $permissions = collect($request->input('permissions', []))->unique()->values();
        $menus = Menu::query()
            ->whereIn('permission', $permissions)
            ->get(['id', 'parent_id', 'permission']);
        $menuIds = $menus->pluck('id')->all();
        $ancestorIds = [];

        foreach ($menus as $menu) {
            $currentParentId = $menu->parent_id;

            while ($currentParentId) {
                $ancestorIds[] = $currentParentId;
                $currentParentId = Menu::query()->whereKey($currentParentId)->value('parent_id');
            }
        }

        $menuIds = collect($menuIds)
            ->merge($ancestorIds)
            ->unique()
            ->values()
            ->all();
        $beforePermissions = $role->menus->pluck('permission')->filter()->values()->all();

        $role->menus()->sync($menuIds);

        $this->writeAuditLog(
            'admin_role_permissions_update',
            $operator,
            'assign-permissions',
            1,
            null,
            'role',
            (string) $role->id,
            $role->name,
            ['permissions' => $beforePermissions],
            ['permissions' => $permissions->all()]
        );

        return $this->success(null, '权限配置已保存');
    }
}
