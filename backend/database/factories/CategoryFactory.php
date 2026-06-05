<?php

namespace Database\Factories;

use App\Modules\Shops\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'slug' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'icon' => 'category',
            'order' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }
}