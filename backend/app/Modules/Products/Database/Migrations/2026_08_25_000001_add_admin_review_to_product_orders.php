<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE product_orders MODIFY COLUMN status " .
            "ENUM('pending_admin_review','pending','confirmed','ordered_producer','shipped','delivered','failed','cancelled') " .
            "NOT NULL DEFAULT 'pending'"
        );

        Schema::table('product_orders', function (Blueprint $table) {
            $table->decimal('commission_rate', 5, 2)->nullable()->after('status');
            $table->decimal('commission_amount', 12, 2)->nullable()->after('commission_rate');
        });
    }

    public function down(): void
    {
        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn(['commission_rate', 'commission_amount']);
        });

        DB::table('product_orders')->where('status', 'pending_admin_review')->update(['status' => 'pending']);

        DB::statement(
            "ALTER TABLE product_orders MODIFY COLUMN status " .
            "ENUM('pending','confirmed','ordered_producer','shipped','delivered','failed','cancelled') " .
            "NOT NULL DEFAULT 'pending'"
        );
    }
};
