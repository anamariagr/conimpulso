<?php

namespace App\Modules\Products\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('images')->nullable(); // Array of image URLs
            $table->json('videos')->nullable(); // Array of video URLs
            $table->decimal('price', 12, 2)->default(0);
            $table->decimal('price_wholesale', 12, 2)->nullable();
            $table->integer('minimum_quantity')->default(1);
            $table->integer('minimum_wholesale_quantity')->default(10);
            $table->json('volume_discounts')->nullable(); // [{"quantity": 10, "discount": 5}]
            $table->integer('stock')->default(0);
            $table->string('sku')->nullable()->unique();
            $table->enum('status', ['draft', 'active', 'inactive', 'out_of_stock'])->default('draft');
            $table->integer('fabrication_time')->nullable(); // Days
            $table->decimal('weight', 8, 2)->nullable(); // In kg
            $table->json('dimensions')->nullable(); // {"length": 10, "width": 5, "height": 3}
            $table->json('attributes')->nullable(); // Custom attributes like color, size
            $table->json('tags')->nullable();
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('sales_count')->default(0);
            $table->unsignedBigInteger('rating_sum')->default(0);
            $table->unsignedBigInteger('rating_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('allow_quotation')->default(false); // Allow request for quote
            $table->boolean('allow_custom_order')->default(false); // Allow custom orders
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('status');
            $table->index('shop_id');
            $table->index(['deleted_at', 'status']);
            $table->index('is_featured');
            $table->index('price');
            $table->index('created_at');
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Rojo / Grande"
            $table->string('sku')->nullable()->unique();
            $table->decimal('price_modifier', 8, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->json('attributes')->nullable(); // {"color": "red", "size": "large"}
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('product_id');
        });

        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['product_id', 'category_id']);
        });

        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('order_id')->nullable(); // No FK - orders module not yet created
            $table->tinyInteger('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index('product_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};