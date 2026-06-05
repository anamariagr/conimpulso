<?php

namespace App\Modules\AI;

use Illuminate\Support\ServiceProvider;

class AIServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
        $this->app->singleton(
            \App\Modules\AI\Services\AIContentModerationService::class,
            function () {
                return new \App\Modules\AI\Services\AIContentModerationService();
            }
        );

        $this->app->singleton(
            \App\Modules\AI\Services\ProductRecommendationService::class,
            function () {
                return new \App\Modules\AI\Services\ProductRecommendationService();
            }
        );

        $this->app->singleton(
            \App\Modules\AI\Services\CategorySuggestionService::class,
            function () {
                return new \App\Modules\AI\Services\CategorySuggestionService();
            }
        );
    }
}