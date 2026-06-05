<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Leads\Models\Lead;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LeadApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_leads()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/leads');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_lead()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/leads', [
                'name' => 'Test Lead',
                'email' => 'lead@example.com',
                'phone' => '1234567890',
                'source' => 'website',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Lead']);
    }

    public function test_lead_requires_authentication()
    {
        $response = $this->postJson('/api/leads', [
            'name' => 'Test Lead',
            'email' => 'lead@example.com',
        ]);

        $response->assertStatus(401);
    }
}