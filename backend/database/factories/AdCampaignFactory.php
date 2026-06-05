<?php

namespace Database\Factories;

use App\Modules\Advertising\Models\AdCampaign;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdCampaignFactory extends Factory
{
    protected $model = AdCampaign::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Modules\Auth\Models\User::factory(),
            'name' => fake()->words(3, true) . ' Campaign',
            'budget' => fake()->randomFloat(2, 100, 10000),
            'daily_budget' => fake()->randomFloat(2, 10, 500),
            'status' => fake()->randomElement(['active', 'paused', 'completed']),
            'start_date' => now(),
            'end_date' => now()->addDays(30),
        ];
    }
}