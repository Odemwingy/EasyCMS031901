<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('username', 50)->unique()->after('id');
            $table->tinyInteger('user_type')->default(1)->comment('1 内部员工 2 企业客户')->after('password');
            $table->string('org_id', 64)->nullable()->after('user_type');
            $table->tinyInteger('status')->default(1)->comment('1 启用 2 停用 3 锁定 4 未激活')->after('org_id');
            $table->boolean('must_change_password')->default(true)->after('status');
            $table->unsignedTinyInteger('login_fail_count')->default(0)->after('must_change_password');
            $table->timestamp('locked_at')->nullable()->after('login_fail_count');
            $table->timestamp('last_login_at')->nullable()->after('locked_at');
            $table->unsignedBigInteger('created_by')->nullable()->after('remember_token');
            $table->text('remark')->nullable()->after('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'username',
                'user_type',
                'org_id',
                'status',
                'must_change_password',
                'login_fail_count',
                'locked_at',
                'last_login_at',
                'created_by',
                'remark',
            ]);
        });
    }
};
