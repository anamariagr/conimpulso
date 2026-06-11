<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Modules\Auth\AuthServiceProvider;
use App\Modules\Shops\ShopsServiceProvider;
use App\Modules\Products\ProductsServiceProvider;
use App\Modules\Services\ServicesServiceProvider;
use App\Modules\B2B\B2BServiceProvider;
use App\Modules\Leads\LeadsServiceProvider;
use App\Modules\Messages\MessagesServiceProvider;
use App\Modules\Advisors\AdvisorsServiceProvider;
use App\Modules\Wallet\WalletServiceProvider;
use App\Modules\Logistics\LogisticsServiceProvider;
use App\Modules\Advertising\AdvertisingServiceProvider;
use App\Modules\AI\AIServiceProvider;
use App\Modules\API\APIServiceProvider;
use App\Modules\Membership\MembershipServiceProvider;
use App\Modules\ERP\ERPServiceProvider;
use App\Modules\Homepage\HomepageServiceProvider;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        AuthServiceProvider::class,
        ShopsServiceProvider::class,
        ProductsServiceProvider::class,
        ServicesServiceProvider::class,
        B2BServiceProvider::class,
        LeadsServiceProvider::class,
        MessagesServiceProvider::class,
        AdvisorsServiceProvider::class,
        WalletServiceProvider::class,
        LogisticsServiceProvider::class,
        AdvertisingServiceProvider::class,
        AIServiceProvider::class,
        APIServiceProvider::class,
        MembershipServiceProvider::class,
        ERPServiceProvider::class,
        HomepageServiceProvider::class,
    ])
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function ($request) {
            return $request->is('api/*') || $request->expectsJson();
        });
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();
