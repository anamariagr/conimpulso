<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Advertising\Models\AdCampaign;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdvertisingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_list_campaigns()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/advertising/campaigns');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_campaign()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/advertising/campaigns', [
                'name' => 'Test Campaign',
                'budget' => 1000.00,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Campaign']);
    }

    public function test_campaign_requires_authentication()
    {
        $response = $this->getJson('/api/advertising/campaigns');

        $response->assertStatus(401);
    }
}