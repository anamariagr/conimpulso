<?php

namespace App\Modules\Advertising\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ad_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->enum('type', ['banner', 'product', 'featured', 'search'])->default('banner');
            $table->enum('status', ['active', 'paused', 'ended', 'draft'])->default('draft');
            $table->decimal('budget', 12, 2);
            $table->decimal('daily_budget', 12, 2)->nullable();
            $table->decimal('spent', 12, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('targeting')->nullable();
            $table->bigInteger('impressions')->default(0);
            $table->bigInteger('clicks')->default(0);
            $table->bigInteger('conversions')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('type');
        });

        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained('ad_campaigns')->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['banner', 'product', 'sponsored'])->default('banner');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->string('target_url')->nullable();
            $table->enum('status', ['active', 'paused', 'ended'])->default('active');
            $table->decimal('bid_amount', 10, 2)->default(0.10);
            $table->bigInteger('impressions')->default(0);
            $table->bigInteger('clicks')->default(0);
            $table->timestamps();

            $table->index(['campaign_id', 'status']);
            $table->index('type');
        });

        Schema::create('ad_impressions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');

            $table->index(['ad_id', 'created_at']);
        });

        Schema::create('ad_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at');

            $table->index(['ad_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_clicks');
        Schema::dropIfExists('ad_impressions');
        Schema::dropIfExists('ads');
        Schema::dropIfExists('ad_campaigns');
    }
};