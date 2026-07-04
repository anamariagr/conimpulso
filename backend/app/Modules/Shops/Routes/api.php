<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Shops\Http\Controllers\Api\ShopController;
use App\Modules\Shops\Http\Controllers\Api\CategoryController;

// Public routes
Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/featured', [ShopController::class, 'featured']);
Route::get('/shops/categories', [ShopController::class, 'categories']);
Route::get('/shops/{slug}', [ShopController::class, 'show']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Shop owner routes
    Route::prefix('my')->group(function () {
        Route::post('/shops', [ShopController::class, 'store']);
        Route::put('/shops/{id}', [ShopController::class, 'update']);
        Route::delete('/shops/{id}', [ShopController::class, 'destroy']);
    });

    // Reviews
    Route::post('/shops/{shopId}/reviews', [ShopController::class, 'createReview']);

    // Admin routes
    Route::middleware('role:super_admin,admin,moderator')->prefix('admin')->group(function () {
        Route::get('/shops', [ShopController::class, 'adminIndex']);
        Route::put('/shops/{id}/approve', [ShopController::class, 'approve']);
        Route::put('/shops/{id}/reject', [ShopController::class, 'reject']);
        Route::put('/shops/{id}/suspend', [ShopController::class, 'suspend']);
        Route::put('/shops/{id}/featured', [ShopController::class, 'toggleFeatured']);
        Route::put('/shops/{id}/verified', [ShopController::class, 'toggleVerified']);
        Route::get('/shops/{id}/benefits', [ShopController::class, 'benefits']);
        Route::put('/shops/{id}/benefits/{featureKey}/toggle', [ShopController::class, 'toggleBenefit']);

        // Categories management
        Route::get('/categories', [CategoryController::class, 'adminIndex']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });
});