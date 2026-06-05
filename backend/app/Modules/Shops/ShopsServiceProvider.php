<?php

namespace App\Modules\Shops;

use Illuminate\Support\ServiceProvider;

class ShopsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->publishes([
            __DIR__ . '/Config/config.php' => config_path('modules/shops.php'),
        ], 'shops-config');
    }
}