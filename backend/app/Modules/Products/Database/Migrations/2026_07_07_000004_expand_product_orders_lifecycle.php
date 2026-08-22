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
            "ENUM('pending','confirmed','ordered_producer','shipped','delivered','failed','cancelled') " .
            "NOT NULL DEFAULT 'pending'"
        );

        Schema::table('product_orders', function (Blueprint $table) {
            $table->text('message')->nullable()->after('document_id');
        });

        DB::table('product_orders')->where('status', 'paid')->update(['status' => 'confirmed']);
    }

    public function down(): void
    {
        DB::table('product_orders')->where('status', 'confirmed')->update(['status' => 'paid']);
        DB::table('product_orders')->whereIn('status', ['ordered_producer', 'shipped', 'delivered'])->update(['status' => 'paid']);

        DB::statement(
            "ALTER TABLE product_orders MODIFY COLUMN status " .
            "ENUM('pending','paid','failed','cancelled') " .
            "NOT NULL DEFAULT 'pending'"
        );

        Schema::table('product_orders', function (Blueprint $table) {
            $table->dropColumn('message');
        });
    }
};
