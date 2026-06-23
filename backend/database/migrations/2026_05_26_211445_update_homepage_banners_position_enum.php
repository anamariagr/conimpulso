<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('homepage_banners')) {
            DB::statement("ALTER TABLE homepage_banners MODIFY COLUMN position ENUM('hero', 'floating_left', 'floating_right', 'sidebar', 'between_sections', 'popup') DEFAULT 'hero'");
        }
    }

    public function down(): void
    {
        // Revert to original enum
        DB::statement("ALTER TABLE homepage_banners MODIFY COLUMN position ENUM('hero', 'sidebar', 'between_sections', 'popup') DEFAULT 'hero'");
    }
};
