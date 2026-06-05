<?php

namespace App\Modules\Shops\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('history')->nullable();
            $table->string('logo')->nullable();
            $table->string('banner')->nullable();
            $table->string('video')->nullable();
            $table->json('gallery')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->default('Colombia');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('schedule')->nullable(); // {"mon": {"open": "09:00", "close": "18:00"}, ...}
            $table->json('social_media')->nullable(); // {"facebook": "...", "instagram": "...", ...}
            $table->json('certifications')->nullable();
            $table->json('payment_methods')->nullable(); // ["cash", "transfer", "card"]
            $table->json('shipping_methods')->nullable(); // ["local", "courier", "logistics"]
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'pending', 'active', 'suspended', 'rejected'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('followers')->default(0);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('status');
            $table->index('city');
            $table->index(['deleted_at', 'status']);
            $table->index('is_verified');
            $table->index('is_featured');
        });

        Schema::create('shop_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['shop_id', 'category_id']);
        });

        Schema::create('shop_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->string('tag', 50);
            $table->timestamps();

            $table->index(['shop_id', 'tag']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_tags');
        Schema::dropIfExists('shop_categories');
        Schema::dropIfExists('shops');
    }
};