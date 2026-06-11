<?php

namespace App\Modules\Auth;

use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
        $this->loadRoutesFrom(__DIR__ . '/Routes/admin-users.php');
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__ . '/Config/config.php' => config_path('modules/auth.php'),
        ], 'auth-config');
    }
}