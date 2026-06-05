<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Advisors\Models\AdvisorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdvisorApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_my_profile()
    {
        $user = User::factory()->create();
        AdvisorProfile::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/advisors/my-profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'level', 'user_id']
            ]);
    }

    public function test_authenticated_user_can_list_commissions()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/advisors/commissions');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_list_leads()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/advisors/leads');

        $response->assertStatus(200);
    }

    public function test_advisor_requires_authentication()
    {
        $response = $this->getJson('/api/advisors/my-profile');

        $response->assertStatus(401);
    }
}