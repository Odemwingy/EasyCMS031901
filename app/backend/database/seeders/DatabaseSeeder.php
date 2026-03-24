<?php

namespace Database\Seeders;

use App\Models\Menu;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $adminRole = Role::query()->updateOrCreate(
                ['code' => 'system_admin'],
                [
                    'name' => '系统管理员',
                    'description' => '拥有后台管理一期全部权限',
                    'data_scope' => 'all',
                    'is_system_preset' => true,
                    'is_readonly' => false,
                    'status' => 1,
                ]
            );

            $menuGroups = [
                [
                    'parent_id' => null,
                    'type' => 1,
                    'name' => '后台管理',
                    'permission' => 'admin:dashboard:view',
                    'route_path' => null,
                    'component' => null,
                    'icon' => 'Shield',
                    'sort' => 1,
                ],
                [
                    'parent_permission' => 'admin:dashboard:view',
                    'type' => 2,
                    'name' => '用户管理',
                    'permission' => 'admin:users:list',
                    'route_path' => '/admin/users',
                    'component' => 'features/users/UserListPage',
                    'icon' => 'Users',
                    'sort' => 10,
                ],
                [
                    'parent_permission' => 'admin:users:list',
                    'type' => 3,
                    'name' => '新建用户',
                    'permission' => 'admin:users:create',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 11,
                ],
                [
                    'parent_permission' => 'admin:users:list',
                    'type' => 3,
                    'name' => '编辑用户',
                    'permission' => 'admin:users:update',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 12,
                ],
                [
                    'parent_permission' => 'admin:users:list',
                    'type' => 3,
                    'name' => '切换用户状态',
                    'permission' => 'admin:users:change-status',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 13,
                ],
                [
                    'parent_permission' => 'admin:dashboard:view',
                    'type' => 2,
                    'name' => '角色管理',
                    'permission' => 'admin:roles:list',
                    'route_path' => '/admin/roles',
                    'component' => 'features/roles/RoleListPage',
                    'icon' => 'ShieldCheck',
                    'sort' => 20,
                ],
                [
                    'parent_permission' => 'admin:roles:list',
                    'type' => 3,
                    'name' => '新建角色',
                    'permission' => 'admin:roles:create',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 21,
                ],
                [
                    'parent_permission' => 'admin:roles:list',
                    'type' => 3,
                    'name' => '复制角色',
                    'permission' => 'admin:roles:copy',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 22,
                ],
                [
                    'parent_permission' => 'admin:roles:list',
                    'type' => 3,
                    'name' => '编辑角色',
                    'permission' => 'admin:roles:update',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 23,
                ],
                [
                    'parent_permission' => 'admin:roles:list',
                    'type' => 3,
                    'name' => '切换角色状态',
                    'permission' => 'admin:roles:change-status',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 24,
                ],
                [
                    'parent_permission' => 'admin:dashboard:view',
                    'type' => 2,
                    'name' => '菜单管理',
                    'permission' => 'admin:menus:list',
                    'route_path' => '/admin/menus',
                    'component' => 'features/menus/MenuPage',
                    'icon' => 'MenuSquare',
                    'sort' => 30,
                ],
                [
                    'parent_permission' => 'admin:menus:list',
                    'type' => 3,
                    'name' => '新建菜单',
                    'permission' => 'admin:menus:create',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 31,
                ],
                [
                    'parent_permission' => 'admin:menus:list',
                    'type' => 3,
                    'name' => '编辑菜单',
                    'permission' => 'admin:menus:update',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 32,
                ],
                [
                    'parent_permission' => 'admin:menus:list',
                    'type' => 3,
                    'name' => '切换菜单状态',
                    'permission' => 'admin:menus:change-status',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 33,
                ],
                [
                    'parent_permission' => 'admin:menus:list',
                    'type' => 3,
                    'name' => '删除菜单',
                    'permission' => 'admin:menus:delete',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 34,
                ],
                [
                    'parent_permission' => 'admin:menus:list',
                    'type' => 3,
                    'name' => '配置角色权限',
                    'permission' => 'admin:roles:assign-permissions',
                    'route_path' => null,
                    'component' => null,
                    'icon' => null,
                    'sort' => 35,
                ],
                [
                    'parent_permission' => 'admin:dashboard:view',
                    'type' => 2,
                    'name' => '审计日志',
                    'permission' => 'admin:audit-logs:list',
                    'route_path' => '/admin/audit-logs',
                    'component' => 'features/audit-logs/AuditLogPage',
                    'icon' => 'FileClock',
                    'sort' => 40,
                ],
            ];

            $createdMenus = collect();

            foreach ($menuGroups as $menuData) {
                $parentId = null;

                if (isset($menuData['parent_permission'])) {
                    $parentId = $createdMenus
                        ->firstWhere('permission', $menuData['parent_permission'])
                        ?->id;
                }

                unset($menuData['parent_permission']);

                $createdMenus->push(Menu::query()->updateOrCreate(
                    ['permission' => $menuData['permission']],
                    array_merge($menuData, [
                        'parent_id' => $parentId,
                        'status' => 1,
                        'remark' => null,
                    ])
                ));
            }

            $adminRole->menus()->sync($createdMenus->pluck('id')->all());

            $adminUser = User::query()->updateOrCreate(
                ['username' => 'admin'],
                [
                    'name' => '系统管理员',
                    'email' => 'admin@easycms.local',
                    'password' => Hash::make('Abc12345'),
                    'user_type' => 1,
                    'org_id' => 'org_001',
                    'status' => 1,
                    'must_change_password' => false,
                    'login_fail_count' => 0,
                    'locked_at' => null,
                    'last_login_at' => null,
                    'remark' => '阶段一本地初始化账号',
                ]
            );

            $adminUser->roles()->sync([$adminRole->id]);
        });

        // 本地默认账号：admin / Abc12345
    }
}
