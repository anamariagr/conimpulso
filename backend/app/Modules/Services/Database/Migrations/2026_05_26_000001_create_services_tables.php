<?php

namespace App\Modules\Services\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('requirements')->nullable();
            $table->json('images')->nullable();
            $table->json('portfolio')->nullable(); // Array of work samples
            $table->decimal('base_price', 12, 2)->default(0);
            $table->enum('price_type', ['fixed', 'hourly', 'quote'])->default('quote');
            $table->decimal('min_price', 12, 2)->nullable();
            $table->decimal('max_price', 12, 2)->nullable();
            $table->integer('duration_days')->nullable();
            $table->string('coverage_area')->nullable(); // City, region, country
            $table->json('attributes')->nullable();
            $table->json('tags')->nullable();
            $table->enum('status', ['draft', 'active', 'inactive'])->default('draft');
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('bookings_count')->default(0);
            $table->unsignedBigInteger('rating_sum')->default(0);
            $table->unsignedBigInteger('rating_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('allow_quotation')->default(true);
            $table->boolean('allow_custom_request')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('status');
            $table->index('shop_id');
            $table->index('is_featured');
            $table->index('base_price');
            $table->index('created_at');
        });

        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['service_id', 'category_id']);
        });

        Schema::create('service_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('booking_id')->nullable(); // No FK - bookings module not yet created
            $table->tinyInteger('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            $table->index('service_id');
            $table->index('user_id');
        });

        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone')->nullable();
            $table->text('description');
            $table->json('attachments')->nullable();
            $table->enum('status', ['pending', 'quoted', 'accepted', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->decimal('quoted_price', 12, 2)->nullable();
            $table->text('quote_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index('service_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
        Schema::dropIfExists('service_reviews');
        Schema::dropIfExists('service_categories');
        Schema::dropIfExists('services');
    }
};