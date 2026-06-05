<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Homepage\Http\Controllers\Api\HomepageController;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // Banners
    Route::get('/homepage/banners', [HomepageController::class, 'banners']);
    Route::post('/homepage/banners', [HomepageController::class, 'createBanner']);
    Route::put('/homepage/banners/{id}', [HomepageController::class, 'updateBanner']);
    Route::delete('/homepage/banners/{id}', [HomepageController::class, 'deleteBanner']);

    // Sections
    Route::get('/homepage/sections', [HomepageController::class, 'sections']);
    Route::post('/homepage/sections', [HomepageController::class, 'createSection']);
    Route::put('/homepage/sections/{id}', [HomepageController::class, 'updateSection']);
    Route::post('/homepage/sections/reorder', [HomepageController::class, 'reorderSections']);
    Route::delete('/homepage/sections/{id}', [HomepageController::class, 'deleteSection']);

    // Layout
    Route::get('/homepage/layout', [HomepageController::class, 'layout']);
    Route::put('/homepage/layout', [HomepageController::class, 'updateLayout']);
    Route::put('/homepage/layout/sections', [HomepageController::class, 'updateLayoutSections']);

    // Available types
    Route::get('/homepage/available-types', [HomepageController::class, 'availableTypes']);
});

// Public routes for homepage content
Route::get('/homepage/active', [HomepageController::class, 'activeLayout']);
Route::get('/homepage/banners/active', [HomepageController::class, 'activeBanners']);
Route::get('/homepage/sections/active', [HomepageController::class, 'activeSections']);