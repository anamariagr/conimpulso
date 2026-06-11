<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('cover_image')->nullable();
            $table->enum('type', ['product', 'shop', 'article'])->default('article');
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('related_type')->nullable(); // 'product' | 'shop'
            $table->enum('status', ['published', 'draft', 'archived'])->default('published');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
