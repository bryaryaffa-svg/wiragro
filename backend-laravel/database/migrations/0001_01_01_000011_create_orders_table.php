<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('order_number', 50)->unique();
            $table->foreignUuid('cart_id')->nullable()->constrained('carts')->nullOnDelete()->cascadeOnUpdate();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete()->cascadeOnUpdate();
            $table->string('store_code', 50)->index();
            $table->string('checkout_type', 30)->default('guest');
            $table->string('status', 50)->default('MENUNGGU_PEMBAYARAN')->index();
            $table->string('payment_status', 50)->default('PENDING')->index();
            $table->string('fulfillment_status', 50)->default('BELUM_DIPROSES')->index();
            $table->string('payment_method', 50);
            $table->string('shipping_method', 30);
            $table->string('pickup_store_code', 50)->nullable();
            $table->string('customer_full_name');
            $table->string('customer_phone', 30)->index();
            $table->string('customer_email')->nullable();
            $table->json('address_snapshot')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_total', 15, 2)->default(0);
            $table->decimal('shipping_total', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->timestamp('auto_cancel_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
