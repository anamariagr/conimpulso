<?php

namespace Database\Factories;

use App\Modules\Wallet\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    protected $model = Wallet::class;

    public function definition(): array
    {
        return [
            'user_id' => \App\Modules\Auth\Models\User::factory(),
            'balance' => fake()->randomFloat(2, 0, 10000),
            'currency' => 'COP',
            'is_active' => true,
        ];
    }
}