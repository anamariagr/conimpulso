<?php

namespace Database\Factories;

use App\Modules\Leads\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeadFactory extends Factory
{
    protected $model = Lead::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Modules\Auth\Models\User::factory(),
            'name' => fake()->name(),
            'email' => fake()->email(),
            'phone' => fake()->phoneNumber(),
            'source' => fake()->randomElement(['website', 'referral', 'campaign', 'direct']),
            'status' => fake()->randomElement(['new', 'contacted', 'qualified', 'converted']),
            'notes' => fake()->paragraph(),
        ];
    }
}