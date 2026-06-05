<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('privacy_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('show_email')->default(false);
            $table->boolean('show_phone')->default(false);
            $table->boolean('show_location')->default(true);
            $table->boolean('show_business_info')->default(true);
            $table->boolean('allow_messages_from_non_contacts')->default(true);
            $table->boolean('allow_search_indexing')->default(false);
            $table->enum('show_profile_to', ['all', 'contacts', 'nobody'])->default('all');
            $table->boolean('show_activity_status')->default(true);
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('privacy_settings');
    }
};