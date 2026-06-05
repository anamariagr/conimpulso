<?php

namespace App\Modules\Logistics\Database\Migrations;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('set null');
            $table->string('origin_city');
            $table->string('origin_department');
            $table->string('destination_city');
            $table->string('destination_department');
            $table->decimal('weight', 10, 2)->default(1);
            $table->json('dimensions')->nullable();
            $table->decimal('declared_value', 12, 2)->nullable();
            $table->string('carrier')->nullable();
            $table->string('service_type')->nullable();
            $table->decimal('price', 12, 2);
            $table->integer('delivery_days')->default(1);
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();

            $table->index(['origin_city', 'destination_city']);
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('set null');
            $table->string('order_id')->nullable();
            $table->foreignId('shipping_quote_id')->nullable()->constrained()->onDelete('set null');
            $table->string('tracking_number')->nullable()->unique();
            $table->string('carrier')->nullable();
            $table->string('service_type')->nullable();
            $table->enum('status', ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'cancelled'])->default('created');
            $table->json('origin_address')->nullable();
            $table->json('destination_address')->nullable();
            $table->string('sender_name')->nullable();
            $table->string('receiver_name')->nullable();
            $table->decimal('weight', 10, 2)->default(1);
            $table->json('dimensions')->nullable();
            $table->decimal('declared_value', 12, 2)->nullable();
            $table->decimal('shipping_cost', 12, 2)->nullable();
            $table->date('estimated_delivery')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('tracking_number');
            $table->index('status');
            $table->index(['user_id', 'status']);
        });

        Schema::create('tracking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipment_id')->constrained()->onDelete('cascade');
            $table->string('status');
            $table->text('description');
            $table->string('location')->nullable();
            $table->timestamp('event_timestamp');
            $table->timestamps();

            $table->index(['shipment_id', 'event_timestamp']);
        });

        Schema::create('pickup_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('shop_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('shipment_id')->nullable()->constrained()->onDelete('set null');
            $table->date('scheduled_date');
            $table->json('address');
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->enum('status', ['pending', 'scheduled', 'picked_up', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->string('pickup_proof')->nullable();
            $table->timestamps();

            $table->index(['shop_id', 'status']);
            $table->index('scheduled_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_requests');
        Schema::dropIfExists('tracking_events');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('shipping_quotes');
    }
};