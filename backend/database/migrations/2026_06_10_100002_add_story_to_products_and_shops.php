<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('story')->nullable()->after('attributes');
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->json('story')->nullable()->after('history');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('story');
        });
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn('story');
        });
    }
};
