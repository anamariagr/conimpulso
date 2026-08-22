<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallet_top_ups', function (Blueprint $table) {
            $table->string('reference')->nullable()->unique()->after('payment_proof_url');
            $table->string('wompi_transaction_id')->nullable()->after('reference');
        });
    }

    public function down(): void
    {
        Schema::table('wallet_top_ups', function (Blueprint $table) {
            $table->dropColumn(['reference', 'wompi_transaction_id']);
        });
    }
};
