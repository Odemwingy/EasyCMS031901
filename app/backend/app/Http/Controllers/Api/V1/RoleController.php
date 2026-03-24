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

        return $this->success(['id' => $role->id]);
    }

    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $role = Role::query()->findOrFail($id);
        $before = RoleListResource::make($role->loadCount('users'))->resolve();

        if ($role->is_system_preset) {
            return $this->businessError('系统预置角色暂不支持编辑基础信息');
        }

        $role->update([
            'name' => $request->string('name')->toString(),
            'code' => $request->string('code')->toString(),
            'description' => $request->input('description'),
            'status' => $request->integer('status'),
        ]);

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
            RoleListResource::make($role->fresh()->loadCount('users'))->resolve()
        );

        return $this->success(['id' => $role->id]);
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

        return $this->success(['id' => $role->id]);
    }

    public function updateStatus(UpdateRoleStatusRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $role = Role::query()->findOrFail($id);
        $targetStatus = $request->integer('status');

        if ($role->code === 'system_admin' && $targetStatus === 2) {
            return $this->businessError('系统管理员角色不允许停用');
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

        return $this->success([], $targetStatus === 1 ? '角色已启用' : '角色已停用');
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
            return $this->businessError('系统管理员为内置超级角色，权限不可编辑');
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

        return $this->success();
    }
}
