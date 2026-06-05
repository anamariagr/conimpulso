<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('erp_connections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('erp_type'); // sap, odoo, netsuite, custom
            $table->string('api_endpoint');
            $table->string('api_key');
            $table->text('api_secret'); // encrypted
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('last_sync_at')->nullable();
            $table->string('sync_status')->default('never');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['erp_type', 'is_active']);
        });

        Schema::create('erp_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connection_id')->constrained('erp_connections')->onDelete('cascade');
            $table->string('entity_type'); // products, orders, inventory
            $table->string('direction'); // import, export
            $table->integer('records_count')->default(0);
            $table->string('status'); // pending, running, success, failed
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->timestamps();

            $table->index(['connection_id', 'status']);
            $table->index(['entity_type', 'direction']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('erp_sync_logs');
        Schema::dropIfExists('erp_connections');
    }
};