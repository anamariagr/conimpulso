<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_negotiations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->decimal('proposed_budget', 12, 2)->nullable();
            $table->date('proposed_deadline')->nullable();
            $table->boolean('is_accepted')->default(false);
            $table->timestamps();

            $table->index(['custom_order_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_negotiations');
    }
};