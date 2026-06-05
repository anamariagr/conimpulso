<?php

namespace App\Modules\B2B\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Business profiles for B2B
        Schema::create('business_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('nit', 20)->unique();
            $table->text('description')->nullable();
            $table->text('production_capacity')->nullable();
            $table->json('certifications')->nullable();
            $table->json('documents')->nullable(); // Legal documents
            $table->enum('business_type', ['manufacturer', 'distributor', 'importer', 'exporter', 'service_provider'])->default('manufacturer');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index('business_type');
            $table->index('verification_status');
        });

        // B2B Connections
        Schema::create('b2b_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('initiator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'blocked'])->default('pending');
            $table->enum('type', ['connection', 'supplier', 'distributor', 'partnership'])->default('connection');
            $table->text('message')->nullable();
            $table->json('requirements')->nullable();
            $table->json('terms')->nullable(); // Agreed terms
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->unique(['initiator_id', 'target_id']);
            $table->index(['initiator_id', 'status']);
            $table->index(['target_id', 'status']);
        });

        // Supplier requests
        Schema::create('supplier_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->json('requirements')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['open', 'quoted', 'awarded', 'closed', 'cancelled'])->default('open');
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->date('deadline')->nullable();
            $table->foreignId('awarded_to')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });

        // Quotes for supplier requests
        Schema::create('supplier_quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('supplier_requests')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('b2b_connection_id')->nullable()->constrained()->onDelete('set null');
            $table->text('proposal');
            $table->decimal('price', 12, 2);
            $table->integer('lead_time_days')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['submitted', 'accepted', 'rejected'])->default('submitted');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('request_id');
            $table->index('user_id');
        });

        // Negotiations room
        Schema::create('negotiations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('initiator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('related_product_id')->nullable();
            $table->foreignId('related_service_id')->nullable();
            $table->foreignId('b2b_connection_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'active', 'agreed', 'cancelled'])->default('draft');
            $table->json('initial_offer')->nullable();
            $table->json('final_terms')->nullable();
            $table->timestamp('agreed_at')->nullable();
            $table->timestamps();

            $table->index(['initiator_id', 'status']);
            $table->index(['target_id', 'status']);
        });

        // Negotiation messages
        Schema::create('negotiation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negotiation_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->json('offer_data')->nullable(); // Specific offer details
            $table->enum('type', ['message', 'offer', 'counter_offer', 'document', 'system'])->default('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index('negotiation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('negotiation_messages');
        Schema::dropIfExists('negotiations');
        Schema::dropIfExists('supplier_quotes');
        Schema::dropIfExists('supplier_requests');
        Schema::dropIfExists('b2b_connections');
        Schema::dropIfExists('business_profiles');
    }
};