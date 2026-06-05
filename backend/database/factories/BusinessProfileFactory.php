<?php

namespace Database\Factories;

use App\Modules\B2B\Models\BusinessProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class BusinessProfileFactory extends Factory
{
    protected $model = BusinessProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Modules\Auth\Models\User::factory(),
            'company_name' => fake()->company(),
            'business_type' => fake()->randomElement(['manufacturer', 'distributor', 'wholesaler']),
            'nit' => fake()->unique()->numerify('##########'),
            'description' => fake()->paragraph(),
            'verification_status' => fake()->randomElement(['pending', 'verified', 'rejected']),
            'is_active' => true,
        ];
    }
}