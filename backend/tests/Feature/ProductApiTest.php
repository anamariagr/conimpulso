<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Products\Models\Product;
use App\Modules\Shops\Models\Shop;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products()
    {
        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'price', 'description']
                ]
            ]);
    }

    public function test_can_create_product()
    {
        $user = User::factory()->create();
        $shop = Shop::factory()->create(['user_id' => $user->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/products', [
                'name' => 'Test Product',
                'description' => 'Test description',
                'price' => 99.99,
                'shop_id' => $shop->id,
                'category_id' => 1,
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Test Product']);
    }

    public function test_can_show_product()
    {
        $product = Product::factory()->create(['name' => 'Test Product']);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Test Product']);
    }
}