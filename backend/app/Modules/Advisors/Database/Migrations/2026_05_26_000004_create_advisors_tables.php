<?php

namespace App\Modules\Advisors\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advisor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->integer('experience_years')->default(0);
            $table->json('skills')->nullable();
            $table->json('categories')->nullable();
            $table->json('references')->nullable();
            $table->string('id_document')->nullable();
            $table->string('address_proof')->nullable();
            $table->boolean('phone_verified')->default(false);
            $table->boolean('background_check')->default(false);
            $table->enum('level', ['bronze', 'silver', 'gold', 'platinum'])->default('bronze');
            $table->json('badges')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('user_id');
            $table->index('level');
        });

        Schema::create('advisor_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->decimal('commission_rate', 5, 2);
            $table->json('products')->nullable();
            $table->json('categories')->nullable();
            $table->json('target_clients')->nullable();
            $table->json('objectives')->nullable();
            $table->json('terms')->nullable();
            $table->enum('status', ['pending', 'active', 'ended', 'cancelled'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index(['advisor_id', 'status']);
            $table->index(['shop_id', 'status']);
        });

        Schema::create('advisor_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('shop_response')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['advisor_id', 'status']);
            $table->index(['shop_id', 'status']);
        });

        Schema::create('advisor_leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shop_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone')->nullable();
            $table->string('client_company')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['pending', 'contacted', 'qualified', 'converted', 'lost'])->default('pending');
            $table->decimal('sale_amount', 12, 2)->nullable();
            $table->decimal('commission_earned', 12, 2)->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();

            $table->index(['advisor_id', 'status']);
            $table->index(['shop_id', 'status']);
        });

        Schema::create('advisor_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('advisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('advisor_lead_id')->nullable()->constrained('advisor_leads')->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->enum('type', ['sale', 'lead', 'bonus'])->default('sale');
            $table->enum('status', ['pending', 'approved', 'paid'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['advisor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advisor_commissions');
        Schema::dropIfExists('advisor_leads');
        Schema::dropIfExists('advisor_applications');
        Schema::dropIfExists('advisor_contracts');
        Schema::dropIfExists('advisor_profiles');
    }
};