<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('b2b_inquiries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete()->cascadeOnUpdate();
            $table->string('store_code', 50)->nullable();
            $table->string('buyer_type', 40)->index();
            $table->string('business_name', 160)->nullable();
            $table->string('contact_name', 120);
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->string('commodity_focus', 120)->nullable();
            $table->string('bundle_slug', 120)->nullable();
            $table->string('campaign_slug', 120)->nullable();
            $table->string('monthly_volume', 120)->nullable();
            $table->string('fulfillment_type', 40)->nullable();
            $table->string('preferred_follow_up', 40)->default('whatsapp');
            $table->string('budget_hint', 120)->nullable();
            $table->text('need_summary');
            $table->text('notes')->nullable();
            $table->string('source_page', 255)->nullable();
            $table->string('status', 30)->default('new')->index();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamp('quoted_at')->nullable();
            $table->text('internal_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('b2b_inquiries');
    }
};
