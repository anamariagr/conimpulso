<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->string('feature_key');
            $table->boolean('is_active')->default(false);
            $table->enum('source', ['manual', 'subscription'])->default('manual');
            $table->foreignId('granted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['shop_id', 'feature_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_benefits');
    }
};
