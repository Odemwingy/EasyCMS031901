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

    public function test_system_role_cannot_be_deleted(): void
    {
        $admin = User::query()->where('username', 'admin')->firstOrFail();
        Sanctum::actingAs($admin);
        $systemRole = Role::query()->where('code', 'system_admin')->firstOrFail();

        $response = $this->deleteJson("/api/v1/admin/roles/{$systemRole->id}");

        $response
            ->assertStatus(422)
            ->assertJsonPath('code', 1005)
            ->assertJsonPath('message', '系统预置角色不可删除');
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
            ->assertJsonPath('message', '菜单已停用')
            ->assertJsonPath('data.affected_count', 5);

        $this->assertSame(2, $parent->fresh()->status);
        $this->assertSame(2, $child->fresh()->status);
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

        $response->assertOk()->assertJsonPath('message', '菜单创建成功');

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

    public function test_reset_password_returns_null_data_and_message(): void
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
            ->assertJsonPath('message', '密码重置成功，用户下次登录须修改密码')
            ->assertJsonPath('data', null);
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
            ->assertJsonPath('code', 1005)
            ->assertJsonPath('message', '该角色下存在 1 个启用用户，请先解绑或停用相关用户后再停用');

        $this->assertDatabaseHas('audit_logs', [
            'log_type' => 'admin_role_status_change',
            'object_type' => 'role',
            'object_id' => (string) $role->id,
            'result' => 2,
            'fail_reason' => '该角色下存在 1 个启用用户，请先解绑或停用相关用户后再停用',
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
