<?php

namespace Database\Factories;

use App\Modules\Shops\Models\Shop;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShopFactory extends Factory
{
    protected $model = Shop::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Modules\Auth\Models\User::factory(),
            'name' => fake()->company(),
            'slug' => fake()->unique()->slug(2),
            'description' => fake()->paragraph(),
            'city' => fake()->city(),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'status' => 'active',
            'is_verified' => fake()->boolean(70),
        ];
    }
}