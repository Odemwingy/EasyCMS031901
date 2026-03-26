<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\V1\Concerns\InteractsWithAuditLogs;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Http\Requests\Admin\UpdateMenuStatusRequest;
use App\Http\Resources\Admin\MenuDetailResource;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    use InteractsWithAuditLogs;

    public function tree(Request $request): JsonResponse
    {
        $query = Menu::query()->orderBy('sort')->orderBy('id');

        if (!$request->boolean('include_disabled')) {
            $query->where('status', 1);
        }

        $groupedMenus = $query->get()->groupBy('parent_id');

        return $this->success($this->buildTree($groupedMenus, null));
    }

    public function store(StoreMenuRequest $request): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();

        $menu = Menu::query()->create([
            'parent_id' => $request->input('parent_id'),
            'type' => $request->integer('type'),
            'name' => $request->string('name')->toString(),
            'permission' => $request->string('permission')->toString(),
            'route_path' => $request->input('route_path'),
            'component' => $request->input('component'),
            'icon' => $request->input('icon'),
            'sort' => $request->integer('sort', 100),
            'status' => $request->integer('status'),
            'remark' => $request->input('remark'),
            'created_by' => $operator->id,
        ]);

        $this->writeAuditLog(
            'admin_menu_create',
            $operator,
            'create',
            1,
            null,
            'menu',
            (string) $menu->id,
            $menu->name,
            null,
            MenuDetailResource::make($menu->load('parent'))->resolve()
        );

        return $this->success([
            'id' => $menu->id,
            'name' => $menu->name,
            'permission' => $menu->permission,
            'created_at' => optional($menu->created_at)?->toIso8601String(),
        ], '菜单创建成功');
    }

    public function update(UpdateMenuRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $menu = Menu::query()->with('parent')->findOrFail($id);
        $before = MenuDetailResource::make($menu)->resolve();

        if ($this->isDescendantParent($menu->id, $request->input('parent_id'))) {
            $message = '上级菜单不能选择当前节点或其子节点';

            $this->writeAuditLog(
                'admin_menu_update',
                $operator,
                'edit',
                2,
                $message,
                'menu',
                (string) $menu->id,
                $menu->name,
                $before,
                null
            );

            return $this->businessError($message);
        }

        $menu->update([
            'parent_id' => $request->input('parent_id'),
            'name' => $request->string('name')->toString(),
            'route_path' => $request->input('route_path'),
            'component' => $request->input('component'),
            'icon' => $request->input('icon'),
            'sort' => $request->integer('sort', 100),
            'status' => $request->integer('status'),
            'remark' => $request->input('remark'),
        ]);

        $updatedMenu = $menu->fresh()->load('parent');

        $this->writeAuditLog(
            'admin_menu_update',
            $operator,
            'edit',
            1,
            null,
            'menu',
            (string) $menu->id,
            $menu->name,
            $before,
            MenuDetailResource::make($updatedMenu)->resolve()
        );

        return $this->success(MenuDetailResource::make($updatedMenu), '菜单信息已更新');
    }

    public function updateStatus(UpdateMenuStatusRequest $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $menu = Menu::query()->findOrFail($id);
        $beforeStatus = $menu->status;
        $targetStatus = $request->integer('status');
        $targetIds = $this->collectDescendantIds($menu->id);

        $affectedCount = Menu::query()
            ->whereIn('id', $targetIds)
            ->update(['status' => $targetStatus, 'updated_at' => now()]);

        $this->writeAuditLog(
            'admin_menu_status_change',
            $operator,
            'toggle-status',
            1,
            null,
            'menu',
            (string) $menu->id,
            $menu->name,
            ['status' => $beforeStatus],
            ['status' => $targetStatus, 'affected_count' => $affectedCount]
        );

        return $this->success([
            'affected_count' => $affectedCount,
        ], $targetStatus === 1 ? '菜单已启用' : '菜单已停用');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var User $operator */
        $operator = $request->user();
        $menu = Menu::query()->withCount(['children', 'roles'])->findOrFail($id);

        if ($menu->children_count > 0) {
            $message = '当前菜单下存在子节点，不能直接删除';

            $this->writeAuditLog(
                'admin_menu_delete',
                $operator,
                'delete',
                2,
                $message,
                'menu',
                (string) $menu->id,
                $menu->name
            );

            return $this->businessError($message);
        }

        if ($menu->roles_count > 0) {
            $message = '当前菜单已被角色绑定，不能直接删除';

            $this->writeAuditLog(
                'admin_menu_delete',
                $operator,
                'delete',
                2,
                $message,
                'menu',
                (string) $menu->id,
                $menu->name
            );

            return $this->businessError($message);
        }

        $before = MenuDetailResource::make($menu->load('parent'))->resolve();
        $menu->delete();

        $this->writeAuditLog(
            'admin_menu_delete',
            $operator,
            'delete',
            1,
            null,
            'menu',
            (string) $menu->id,
            $menu->name,
            $before,
            null
        );

        return $this->success(null, '菜单已删除');
    }

    private function buildTree($groupedMenus, ?int $parentId): array
    {
        return $groupedMenus
            ->get($parentId, collect())
            ->map(function (Menu $menu) use ($groupedMenus): array {
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
                    'status_label' => $menu->status === 1 ? '启用' : '停用',
                    'remark' => $menu->remark,
                    'created_at' => optional($menu->created_at)?->toIso8601String(),
                    'updated_at' => optional($menu->updated_at)?->toIso8601String(),
                    'children' => $this->buildTree($groupedMenus, $menu->id),
                ];
            })
            ->values()
            ->all();
    }

    private function isDescendantParent(int $menuId, ?int $parentId): bool
    {
        if (!$parentId) {
            return false;
        }

        if ($menuId === $parentId) {
            return true;
        }

        $currentParentId = Menu::query()->whereKey($parentId)->value('parent_id');

        while ($currentParentId) {
            if ((int) $currentParentId === $menuId) {
                return true;
            }

            $currentParentId = Menu::query()->whereKey($currentParentId)->value('parent_id');
        }

        return false;
    }

    private function collectDescendantIds(int $menuId): array
    {
        $allMenus = Menu::query()->get(['id', 'parent_id']);
        $childrenByParent = $allMenus->groupBy('parent_id');
        $ids = [];
        $stack = [$menuId];

        while ($stack !== []) {
            $currentId = array_pop($stack);
            $ids[] = $currentId;

            foreach ($childrenByParent->get($currentId, collect()) as $childMenu) {
                $stack[] = $childMenu->id;
            }
        }

        return array_values(array_unique($ids));
    }
}
