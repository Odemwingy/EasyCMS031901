<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Menu;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminApiContractTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_login_returns_expires_at_and_request_id_header(): void
    {
        $response = $this
            ->withHeader('X-Request-ID', 'req-test-login')
            ->postJson('/api/v1/auth/login', [
                'username' => 'admin',
                'password' => 'Abc12345',
            ]);

        $response
            ->assertOk()
            ->assertHeader('X-Request-ID', 'req-test-login')
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.user.username', 'admin')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'expires_at',
                    'user' => [
                        'id',
                        'username',
                        'name',
                        'user_type',
                        'user_type_label',
                        'org_id',
                        'status',
                        'status_label',
                        'must_change_password',
                        'roles',
                    ],
                ],
            ]);
    }

    public function test_login_with_wrong_password_returns_business_error(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 1005)
            ->assertJsonPath('message', '用户名或密码错误，请重新输入');
    }

    public function test_logout_writes_audit_log(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $token = $admin->createToken('test-logout')->plainTextToken;

        $response = $this
            ->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', null);

        $this->assertDatabaseHas('audit_logs', [
            'log_type' => 'admin_logout',
            'operator_id' => $admin->id,
            'object_type' => 'user',
            'object_id' => (string) $admin->id,
            'result' => 1,
        ]);
    }

    public function test_expired_locked_user_is_auto_unlocked_and_logged_on_login(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $admin->forceFill([
            'status' => 3,
            'login_fail_count' => 5,
            'locked_at' => now()->subMinutes(31),
        ])->save();

        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'Abc12345',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('code', 0);

        $admin->refresh();

        $this->assertSame(1, $admin->status);
        $this->assertSame(0, $admin->login_fail_count);
        $this->assertNull($admin->locked_at);

        $this->assertDatabaseHas('audit_logs', [
            'log_type' => 'admin_user_unlock',
            'operator_id' => $admin->id,
            'object_type' => 'user',
            'object_id' => (string) $admin->id,
            'result' => 1,
        ]);
    }

    public function test_system_role_cannot_be_deleted(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);
        $systemRole = Role::query()->where('code', 'system_admin')->firstOrFail();

        $response = $this->deleteJson("/api/v1/admin/roles/{$systemRole->id}");

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 1005);
    }

    public function test_validation_exception_uses_standard_api_contract(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/users', []);

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 1001)
            ->assertJsonPath('message', '参数校验失败')
            ->assertJsonStructure([
                'data' => [
                    'errors',
                ],
            ]);
    }

    public function test_unauthenticated_request_uses_standard_api_contract(): void
    {
        $response = $this->getJson('/api/v1/admin/users');

        $response
            ->assertStatus(401)
            ->assertJsonPath('code', 1002)
            ->assertJsonPath('message', '未登录或 token 失效');
    }

    public function test_forbidden_request_uses_standard_api_contract(): void
    {
        $user = User::factory()->create([
            'username' => 'no_permission_user',
            'email' => 'no-permission@easycms.local',
            'status' => 1,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/users');

        $response
            ->assertStatus(403)
            ->assertJsonPath('code', 1003)
            ->assertJsonPath('message', '无权限');
    }

    public function test_model_not_found_uses_standard_api_contract(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/users/999999');

        $response
            ->assertStatus(404)
            ->assertJsonPath('code', 1004)
            ->assertJsonPath('message', '资源不存在');
    }

    public function test_menu_status_update_cascades_to_children_and_returns_affected_count(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);
        $parent = Menu::query()->where('permission', 'admin:users:list')->firstOrFail();
        $child = Menu::query()->where('permission', 'admin:users:create')->firstOrFail();

        $response = $this->patchJson("/api/v1/admin/menus/{$parent->id}/status", [
            'status' => 2,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.affected_count', 5);

        $this->assertSame(2, $parent->fresh()->status);
        $this->assertSame(2, $child->fresh()->status);
    }

    public function test_assign_permissions_button_belongs_to_roles_menu(): void
    {
        $rolesMenu = Menu::query()->where('permission', 'admin:roles:list')->firstOrFail();
        $assignPermissionsButton = Menu::query()->where('permission', 'admin:roles:assign-permissions')->firstOrFail();

        $this->assertSame($rolesMenu->id, $assignPermissionsButton->parent_id);
    }

    public function test_role_detail_returns_active_and_disabled_user_counts(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $role = Role::query()->create([
            'name' => 'role_detail_stats',
            'code' => 'role_detail_stats',
            'description' => 'stats test',
            'data_scope' => 'all',
            'status' => 1,
            'created_by' => $admin->id,
        ]);

        $activeUser = User::factory()->create([
            'username' => 'role_stats_active',
            'email' => 'role-stats-active@easycms.local',
            'status' => 1,
        ]);
        $disabledUser = User::factory()->create([
            'username' => 'role_stats_disabled',
            'email' => 'role-stats-disabled@easycms.local',
            'status' => 2,
        ]);
        $lockedUser = User::factory()->create([
            'username' => 'role_stats_locked',
            'email' => 'role-stats-locked@easycms.local',
            'status' => 3,
        ]);
        $inactiveUser = User::factory()->create([
            'username' => 'role_stats_inactive',
            'email' => 'role-stats-inactive@easycms.local',
            'status' => 4,
        ]);

        $role->users()->sync([
            $activeUser->id,
            $disabledUser->id,
            $lockedUser->id,
            $inactiveUser->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson("/api/v1/admin/roles/{$role->id}");

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.user_count', 4)
            ->assertJsonPath('data.active_user_count', 1)
            ->assertJsonPath('data.disabled_user_count', 1);
    }

    public function test_audit_log_detail_contains_request_id_and_source_page(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this
            ->withHeader('X-Request-ID', 'req-test-audit')
            ->withHeader('Referer', 'http://localhost:5175/menus')
            ->postJson('/api/v1/admin/menus', [
                'parent_id' => Menu::query()->where('permission', 'admin:dashboard:view')->value('id'),
                'type' => 2,
                'name' => 'Temp Menu',
                'permission' => 'admin:menus:test-temp',
                'route_path' => '/admin/temp-menu',
                'component' => 'features/menus/TempMenuPage',
                'icon' => 'Shield',
                'sort' => 999,
                'status' => 1,
                'remark' => 'test',
            ]);

        $response->assertOk();

        $menuId = $response->json('data.id');
        $logId = AuditLog::query()
            ->where('object_type', 'menu')
            ->where('object_id', (string) $menuId)
            ->latest('id')
            ->value('id');

        $detail = $this->getJson("/api/v1/admin/audit-logs/{$logId}");

        $detail
            ->assertOk()
            ->assertJsonPath('data.request_id', 'req-test-audit')
            ->assertJsonPath('data.source_page', '/menus');
    }

    public function test_reset_password_returns_null_data(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $targetUser = User::factory()->create([
            'username' => 'reset_target',
            'name' => 'Reset Target',
            'email' => 'reset-target@easycms.local',
            'status' => 1,
        ]);
        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/admin/users/{$targetUser->id}/reset-password", [
            'new_password' => 'Reset12345',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data', null);
    }

    public function test_update_user_can_omit_status_and_preserve_original_value(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $role = Role::query()->where('code', 'system_admin')->firstOrFail();
        $targetUser = User::factory()->create([
            'username' => 'update_target',
            'name' => 'Update Target',
            'email' => 'update-target@easycms.local',
            'user_type' => 1,
            'org_id' => 'org_north_region',
            'status' => 2,
        ]);
        $targetUser->roles()->sync([$role->id]);
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/v1/admin/users/{$targetUser->id}", [
            'name' => 'Updated Target',
            'user_type' => 2,
            'org_id' => 'org_south_region',
            'role_ids' => [$role->id],
            'project_ids' => ['project-alpha'],
            'remark' => 'updated without status',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.name', 'Updated Target')
            ->assertJsonPath('data.status', 2);

        $targetUser->refresh();

        $this->assertSame(2, $targetUser->status);
        $this->assertSame(2, $targetUser->user_type);
        $this->assertSame('org_south_region', $targetUser->org_id);
    }

    public function test_user_search_by_username_returns_matching_user_without_server_error(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/users?keyword=admin');

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.list.0.username', 'admin');
    }

    public function test_role_disable_is_blocked_when_active_users_exist(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        $role = Role::query()->create([
            'name' => '测试角色',
            'code' => 'contract_test_role',
            'description' => 'test',
            'data_scope' => 'all',
            'status' => 1,
            'created_by' => $admin->id,
        ]);
        $activeUser = User::factory()->create([
            'username' => 'role_active_user',
            'name' => 'Role Active User',
            'email' => 'role-active-user@easycms.local',
            'status' => 1,
        ]);
        $activeUser->roles()->sync([$role->id]);
        Sanctum::actingAs($admin);

        $response = $this->patchJson("/api/v1/admin/roles/{$role->id}/status", [
            'status' => 2,
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 1005);

        $this->assertDatabaseHas('audit_logs', [
            'log_type' => 'admin_role_status_change',
            'object_type' => 'role',
            'object_id' => (string) $role->id,
            'result' => 2,
        ]);
    }

    public function test_change_password_hashes_new_password(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/auth/change-password', [
            'old_password' => 'Abc12345',
            'new_password' => 'NewPass123',
            'new_password_confirmation' => 'NewPass123',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('code', 0)
            ->assertJsonPath('message', '密码修改成功')
            ->assertJsonPath('data', null);

        $this->assertTrue(Hash::check('NewPass123', $admin->fresh()->password));
    }
}
