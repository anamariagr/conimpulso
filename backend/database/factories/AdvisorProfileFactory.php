<?php

namespace Database\Factories;

use App\Modules\Advisors\Models\AdvisorProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdvisorProfileFactory extends Factory
{
    protected $model = AdvisorProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Modules\Auth\Models\User::factory(),
            'level' => fake()->randomElement(['bronze', 'silver', 'gold', 'platinum']),
            'bio' => fake()->paragraph(),
            'specialties' => json_encode(fake()->words(3)),
            'status' => fake()->randomElement(['active', 'inactive', 'suspended']),
            'total_earned' => fake()->randomFloat(2, 0, 50000),
            'pending_commission' => fake()->randomFloat(2, 0, 5000),
        ];
    }
}