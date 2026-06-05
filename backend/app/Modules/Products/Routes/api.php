<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Products\Http\Controllers\Api\ProductController;

// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Shop owner routes
    Route::prefix('my')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Variants
        Route::post('/products/{productId}/variants', [ProductController::class, 'addVariant']);
        Route::put('/products/{productId}/variants/{variantId}', [ProductController::class, 'updateVariant']);
        Route::delete('/products/{productId}/variants/{variantId}', [ProductController::class, 'deleteVariant']);
    });

    // Reviews
    Route::post('/products/{productId}/reviews', [ProductController::class, 'createReview']);

    // Admin routes
    Route::middleware('role:super_admin,admin,moderator')->prefix('admin')->group(function () {
        Route::get('/products', [ProductController::class, 'adminIndex']);
        Route::put('/products/{id}/featured', [ProductController::class, 'toggleFeatured']);
    });
});