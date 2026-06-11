<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('homepage_banners', function (Blueprint $table) {
            $table->string('vendor_title')->nullable()->after('subtitle');
            $table->text('vendor_description')->nullable()->after('vendor_title');
            $table->string('buyer_title')->nullable()->after('vendor_description');
            $table->text('buyer_description')->nullable()->after('buyer_title');
        });
    }

    public function down(): void
    {
        Schema::table('homepage_banners', function (Blueprint $table) {
            $table->dropColumn(['vendor_title', 'vendor_description', 'buyer_title', 'buyer_description']);
        });
    }
};
