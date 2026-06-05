<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Shops\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AIApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_trending_products()
    {
        $response = $this->getJson('/api/ai/recommendations/trending');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'price']
                ]
            ]);
    }

    public function test_can_get_category_suggestions()
    {
        $response = $this->getJson('/api/ai/categories/suggest?name=Electronics&description=Tech products');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'suggestions' => [
                    '*' => ['name', 'confidence']
                ]
            ]);
    }

    public function test_can_moderate_content()
    {
        $response = $this->postJson('/api/ai/moderate', [
            'content' => 'This is a test product description',
            'type' => 'product',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'is_appropriate',
                'flags',
                'confidence'
            ]);
    }
}