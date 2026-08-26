<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->timestamp('asked_vendor_at')->nullable()->after('commission_amount');
            $table->timestamp('vendor_confirmed_at')->nullable()->after('asked_vendor_at');
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['asked_vendor_at', 'vendor_confirmed_at']);
        });
    }
};
