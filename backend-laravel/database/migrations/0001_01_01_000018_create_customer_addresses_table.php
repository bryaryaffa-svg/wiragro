<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customer_addresses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->string('label', 60);
            $table->string('recipient_name');
            $table->string('recipient_phone', 30);
            $table->text('address_line');
            $table->string('district')->nullable();
            $table->string('city');
            $table->string('province');
            $table->string('postal_code', 20)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_default')->default(false)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_addresses');
    }
};
