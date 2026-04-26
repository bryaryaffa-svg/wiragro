<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('b2b_inquiries', function (Blueprint $table): void {
            $table->string('commodity_slug', 120)->nullable()->after('commodity_focus');
            $table->string('product_slug', 120)->nullable()->after('campaign_slug');
            $table->string('product_name', 200)->nullable()->after('product_slug');
        });
    }

    public function down(): void
    {
        Schema::table('b2b_inquiries', function (Blueprint $table): void {
            $table->dropColumn([
                'commodity_slug',
                'product_slug',
                'product_name',
            ]);
        });
    }
};
