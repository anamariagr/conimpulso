<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->enum('media_type', ['image', 'video', 'gif'])->default('image');
            $table->string('media_url');
            $table->string('mobile_media_url')->nullable();
            $table->string('link_url')->nullable();
            $table->string('link_text')->nullable();
            $table->enum('position', ['hero', 'sidebar', 'between_sections', 'popup'])->default('hero');
            $table->string('slot')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('order')->default(0);
            $table->enum('target_audience', ['all', 'vendors', 'buyers'])->default('all');
            $table->unsignedBigInteger('clicks_count')->default(0);
            $table->unsignedBigInteger('impressions_count')->default(0);
            $table->timestamps();

            $table->index(['position', 'is_active']);
            $table->index(['starts_at', 'expires_at']);
        });

        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->enum('type', [
                'hero', 'featured_products', 'categories', 'stores',
                'slider', 'cards_grid', 'banner', 'testimonials', 'newsletter', 'custom_html'
            ]);
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->json('configuration')->nullable();
            $table->json('items')->nullable();
            $table->enum('layout', ['grid', 'slider', 'list', 'masonry'])->default('grid');
            $table->integer('columns')->default(4);
            $table->boolean('is_active')->default(false);
            $table->integer('order')->default(0);
            $table->string('background_color')->default('#ffffff');
            $table->integer('padding_top')->default(16);
            $table->integer('padding_bottom')->default(16);
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });

        Schema::create('homepage_layouts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->json('sections_order')->nullable();
            $table->json('settings')->nullable();
            $table->json('header_config')->nullable();
            $table->json('footer_config')->nullable();
            $table->timestamps();

            $table->index(['is_default']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_layouts');
        Schema::dropIfExists('homepage_sections');
        Schema::dropIfExists('homepage_banners');
    }
};