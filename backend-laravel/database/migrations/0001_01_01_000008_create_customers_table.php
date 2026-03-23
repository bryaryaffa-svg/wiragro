<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('full_name')->nullable();
            $table->string('phone', 30)->nullable()->unique();
            $table->string('email')->nullable()->unique();
            $table->string('auth_provider', 30)->default('guest')->index();
            $table->string('google_sub')->nullable()->unique();
            $table->string('member_tier', 50)->nullable();
            $table->boolean('whatsapp_verified')->default(false);
            $table->boolean('is_guest')->default(true)->index();
            $table->timestamp('last_order_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
