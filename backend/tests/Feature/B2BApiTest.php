<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\B2B\Models\BusinessProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class B2BApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_business_profiles()
    {
        $response = $this->getJson('/api/b2b/profiles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'company_name', 'business_type']
                ]
            ]);
    }

    public function test_authenticated_user_can_create_business_profile()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/b2b/profiles', [
                'company_name' => 'Test Company',
                'business_type' => 'manufacturer',
                'nit' => '123456789',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['company_name' => 'Test Company']);
    }

    public function test_authenticated_user_can_get_my_business_profile()
    {
        $user = User::factory()->create();
        BusinessProfile::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/b2b/my-profile');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_list_connections()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/b2b/connections');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_send_connection_request()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        BusinessProfile::factory()->create(['user_id' => $user2->id, 'verification_status' => 'verified']);
        $token = $user1->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/b2b/connections', [
                'target_id' => $user2->id,
                'type' => 'business',
                'message' => 'Interested in partnership',
            ]);

        $response->assertStatus(201);
    }
}