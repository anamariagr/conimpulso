<?php

namespace App\Modules\API;

use Illuminate\Support\ServiceProvider;

class APIServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }

    public function boot(): void
    {
        //
    }
}