<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_risk_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->integer('score')->default(0);
            $table->enum('risk_level', ['minimal', 'low', 'medium', 'high', 'critical'])->default('minimal');
            $table->json('flags')->nullable();
            $table->timestamp('assessed_at')->nullable();
            $table->timestamps();

            $table->index(['risk_level', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_risk_scores');
    }
};