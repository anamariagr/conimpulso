<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Wallet\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WalletApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_wallet()
    {
        $user = User::factory()->create();
        Wallet::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/wallet');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'balance', 'currency']
            ]);
    }

    public function test_wallet_requires_authentication()
    {
        $response = $this->getJson('/api/wallet');

        $response->assertStatus(401);
    }
}