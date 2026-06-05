<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_revenues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->enum('period', ['daily', 'weekly', 'monthly', 'yearly']);
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('total_sales')->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0);
            $table->decimal('total_commission', 12, 2)->default(0);
            $table->decimal('net_revenue', 12, 2)->default(0);
            $table->json('top_products')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'period', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_revenues');
    }
};