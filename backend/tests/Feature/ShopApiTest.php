<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Shops\Models\Shop;
use App\Modules\Shops\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ShopApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_shops()
    {
        $response = $this->getJson('/api/shops');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'city']
                ]
            ]);
    }

    public function test_can_show_shop_by_slug()
    {
        $shop = Shop::factory()->create(['slug' => 'test-shop']);

        $response = $this->getJson('/api/shops/test-shop');

        $response->assertStatus(200)
            ->assertJsonFragment(['slug' => 'test-shop']);
    }

    public function test_authenticated_user_can_create_shop()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/shops', [
                'name' => 'My Test Shop',
                'slug' => 'my-test-shop',
                'description' => 'A test shop',
                'city' => 'Bogota',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'My Test Shop']);
    }
}