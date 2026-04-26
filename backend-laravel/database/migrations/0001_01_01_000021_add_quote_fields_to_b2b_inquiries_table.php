<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('b2b_inquiries', function (Blueprint $table): void {
            $table->string('inquiry_number', 40)->nullable()->unique()->after('customer_id');
            $table->json('requested_items')->nullable()->after('need_summary');
            $table->json('quote_items')->nullable()->after('requested_items');
            $table->decimal('estimate_subtotal', 14, 2)->nullable()->after('quote_items');
            $table->decimal('estimate_shipping', 14, 2)->nullable()->after('estimate_subtotal');
            $table->decimal('estimate_total', 14, 2)->nullable()->after('estimate_shipping');
            $table->text('sales_note')->nullable()->after('quoted_at');
        });
    }

    public function down(): void
    {
        Schema::table('b2b_inquiries', function (Blueprint $table): void {
            $table->dropUnique(['inquiry_number']);
            $table->dropColumn([
                'inquiry_number',
                'requested_items',
                'quote_items',
                'estimate_subtotal',
                'estimate_shipping',
                'estimate_total',
                'sales_note',
            ]);
        });
    }
};
