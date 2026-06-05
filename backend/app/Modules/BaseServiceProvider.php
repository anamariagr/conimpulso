<?php

namespace App\Modules;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;

abstract class BaseServiceProvider extends ServiceProvider
{
    protected string $moduleName;
    protected string $modulePath;

    public function __construct($app)
    {
        parent::__construct($app);
        $this->moduleName = $this->getModuleName();
        $this->modulePath = base_path('app/Modules/' . $this->moduleName);
    }

    abstract protected function getModuleName(): string;

    public function register(): void
    {
        $this->registerMigrations();
        $this->registerRoutes();
        $this->registerConfig();
        $this->registerResources();
    }

    protected function registerMigrations(): void
    {
        $migrationsPath = $this->modulePath . '/Database/Migrations';

        if (File::isDirectory($migrationsPath)) {
            $this->loadMigrationsFrom($migrationsPath);
        }
    }

    protected function registerRoutes(): void
    {
        $routesPath = $this->modulePath . '/Routes/api.php';

        if (File::exists($routesPath)) {
            $this->loadRoutesFrom($routesPath);
        }
    }

    protected function registerConfig(): void
    {
        $configPath = $this->modulePath . '/Config/config.php';

        if (File::exists($configPath)) {
            $this->mergeConfigFrom($configPath, $this->moduleNameLower());
        }
    }

    protected function registerResources(): void
    {
        $resourcesPath = $this->modulePath . '/Http/Resources';

        if (File::isDirectory($resourcesPath)) {
            $this->loadJsonTranslationsFrom($this->modulePath . '/Resources/lang');
        }
    }

    protected function moduleNameLower(): string
    {
        return strtolower($this->moduleName);
    }

    public function boot(): void
    {
        $this->publishes([
            $this->modulePath . '/Database/Seeders' => database_path('seeders'),
        ], $this->moduleNameLower() . '-seeders');
    }
}