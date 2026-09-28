<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Auth\Models\User;
use App\Modules\Products\Models\Product;
use App\Modules\Shops\Models\Shop;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductInventoryApiTest extends TestCase
{
    use RefreshDatabase;

    private function vendorWithProduct(): array
    {
        $user = User::factory()->create();
        $shop = Shop::factory()->create(['user_id' => $user->id]);
        $product = Product::factory()->create(['shop_id' => $shop->id]);
        $token = $user->createToken('test')->plainTextToken;

        return [$user, $shop, $product, $token];
    }

    private function auth(string $token): array
    {
        return ['Authorization' => "Bearer $token"];
    }

    public function test_vendor_can_create_supplies_and_time_entries()
    {
        [, , $product, $token] = $this->vendorWithProduct();

        $supply = $this->withHeaders($this->auth($token))
            ->postJson("/api/products/{$product->id}/supplies", [
                'name' => 'Tela de algodón',
                'quantity' => 2,
                'unit' => 'metros',
                'unit_cost' => 50,
            ]);

        $supply->assertStatus(201)
            ->assertJsonFragment(['name' => 'Tela de algodón'])
            ->assertJsonPath('data.total_cost', '100.00');

        $entry = $this->withHeaders($this->auth($token))
            ->postJson("/api/products/{$product->id}/time-entries", [
                'description' => 'Costura',
                'minutes' => 60,
                'hourly_rate' => 50,
            ]);

        $entry->assertStatus(201)
            ->assertJsonFragment(['description' => 'Costura'])
            ->assertJsonPath('data.total_cost', '50.00');

        $suppliesIndex = $this->withHeaders($this->auth($token))
            ->getJson("/api/products/{$product->id}/supplies");
        $suppliesIndex->assertStatus(200)->assertJsonCount(1, 'data');

        $entriesIndex = $this->withHeaders($this->auth($token))
            ->getJson("/api/products/{$product->id}/time-entries");
        $entriesIndex->assertStatus(200)->assertJsonCount(1, 'data');
    }

    public function test_cost_summary_returns_correct_suggested_price()
    {
        [, , $product, $token] = $this->vendorWithProduct();

        $this->withHeaders($this->auth($token))
            ->postJson("/api/products/{$product->id}/supplies", [
                'name' => 'Material',
                'quantity' => 1,
                'unit_cost' => 100,
            ])->assertStatus(201);

        $this->withHeaders($this->auth($token))
            ->postJson("/api/products/{$product->id}/time-entries", [
                'description' => 'Mano de obra',
                'minutes' => 60,
                'hourly_rate' => 50,
            ])->assertStatus(201);

        $response = $this->withHeaders($this->auth($token))
            ->getJson("/api/products/{$product->id}/cost-summary");

        // supplies 100 + time 50 = 150, margen 30% -> 195
        $response->assertStatus(200)
            ->assertJsonPath('data.supplies_total', 100.0)
            ->assertJsonPath('data.time_total', 50.0)
            ->assertJsonPath('data.total_cost', 150.0)
            ->assertJsonPath('data.profit_margin', 30.0)
            ->assertJsonPath('data.suggested_price', 195.0);
    }

    public function test_other_user_cannot_add_supply_to_foreign_product()
    {
        [, , $product] = $this->vendorWithProduct();

        $otherUser = User::factory()->create();
        Shop::factory()->create(['user_id' => $otherUser->id]);
        $otherToken = $otherUser->createToken('test')->plainTextToken;

        $response = $this->withHeaders($this->auth($otherToken))
            ->postJson("/api/products/{$product->id}/supplies", [
                'name' => 'Intruso',
                'quantity' => 1,
                'unit_cost' => 10,
            ]);

        $response->assertStatus(404);
    }
}
