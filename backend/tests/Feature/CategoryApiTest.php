<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Modules\Shops\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_categories()
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug']
                ]
            ]);
    }

    public function test_categories_are_ordered()
    {
        $response = $this->getJson('/api/categories');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals($data, collect($data)->sortBy('order')->values()->toArray());
    }
}