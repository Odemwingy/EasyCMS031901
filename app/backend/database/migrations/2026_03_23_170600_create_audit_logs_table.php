<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('log_type', 50);
            $table->unsignedBigInteger('operator_id')->nullable();
            $table->string('operator_name', 50)->nullable();
            $table->string('action', 50);
            $table->string('object_type', 50)->nullable();
            $table->string('object_id', 64)->nullable();
            $table->string('object_name', 100)->nullable();
            $table->json('before_value')->nullable();
            $table->json('after_value')->nullable();
            $table->tinyInteger('result')->default(1)->comment('1 成功 2 失败');
            $table->string('fail_reason', 255)->nullable();
            $table->string('source_page', 200)->nullable();
            $table->string('request_id', 64)->nullable();
            $table->string('project_id', 64)->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();

            $table->index(['log_type', 'created_at']);
            $table->index('operator_id');
            $table->index('object_type');
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
