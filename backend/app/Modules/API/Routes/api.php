<?php

use Illuminate\Support\Facades\Route;
use App\Modules\API\Http\Controllers\Api\APIController;

Route::prefix('v1')->group(function () {
    // Public API documentation
    Route::get('/info', [APIController::class, 'info']);

    // Products API (public)
    Route::get('/products', [APIController::class, 'products']);
    Route::get('/products/{id}', [APIController::class, 'productDetail']);

    // Shops API (public)
    Route::get('/shops', [APIController::class, 'shops']);
    Route::get('/shops/{slug}', [APIController::class, 'shopDetail']);

    // Categories API (public)
    Route::get('/categories', [APIController::class, 'categories']);
});

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Authenticated API access
    Route::get('/user', [APIController::class, 'user']);
});

// API Keys management
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/api-keys', [APIController::class, 'myApiKeys']);
    Route::post('/api-keys', [APIController::class, 'createApiKey']);
    Route::delete('/api-keys/{id}', [APIController::class, 'deleteApiKey']);
    Route::get('/api-keys/{id}/stats', [APIController::class, 'apiKeyStats']);
});

// Webhooks
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/webhooks', [APIController::class, 'myWebhooks']);
    Route::post('/webhooks', [APIController::class, 'registerWebhook']);
    Route::delete('/webhooks/{id}', [APIController::class, 'deleteWebhook']);
    Route::post('/webhooks/{id}/test', [APIController::class, 'testWebhook']);
});