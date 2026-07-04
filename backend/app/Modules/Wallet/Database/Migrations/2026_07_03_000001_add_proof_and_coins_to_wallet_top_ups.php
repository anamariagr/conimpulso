<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallet_top_ups', function (Blueprint $table) {
            $table->string('payment_proof_url')->nullable()->after('payment_reference');
            $table->decimal('coins_credited', 12, 2)->nullable()->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('wallet_top_ups', function (Blueprint $table) {
            $table->dropColumn(['payment_proof_url', 'coins_credited']);
        });
    }
};
