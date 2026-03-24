<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 50);
            $table->string('code', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->string('data_scope', 20)->default('all');
            $table->boolean('is_system_preset')->default(false);
            $table->boolean('is_readonly')->default(false);
            $table->tinyInteger('status')->default(1)->comment('1 启用 2 停用');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
