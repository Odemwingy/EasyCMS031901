<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->tinyInteger('type')->comment('1 目录 2 菜单项 3 按钮');
            $table->string('name', 50);
            $table->string('permission', 100)->unique();
            $table->string('route_path', 200)->nullable();
            $table->string('component', 200)->nullable();
            $table->string('icon', 50)->nullable();
            $table->integer('sort')->default(100);
            $table->tinyInteger('status')->default(1)->comment('1 启用 2 停用');
            $table->text('remark')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('parent_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
