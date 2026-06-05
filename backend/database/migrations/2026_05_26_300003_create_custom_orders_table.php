<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set_null');
            $table->enum('status', ['draft', 'negotiation', 'contract_sent', 'accepted', 'in_production', 'completed', 'cancelled'])->default('draft');
            $table->json('requirements');
            $table->decimal('budget', 12, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->text('negotiation_notes')->nullable();
            $table->string('contract_path')->nullable();
            $table->string('production_status')->nullable();
            $table->date('delivery_date')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_orders');
    }
};