<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('messaging_enabled')->default(true)->after('status');
            $table->text('messaging_disabled_reason')->nullable()->after('messaging_enabled');
            $table->timestamp('messaging_disabled_at')->nullable()->after('messaging_disabled_reason');
            $table->foreignId('messaging_disabled_by')->nullable()->after('messaging_disabled_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['messaging_disabled_by']);
            $table->dropColumn(['messaging_enabled', 'messaging_disabled_reason', 'messaging_disabled_at', 'messaging_disabled_by']);
        });
    }
};
