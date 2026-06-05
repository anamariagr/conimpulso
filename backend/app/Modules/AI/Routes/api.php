<?php

use Illuminate\Support\Facades\Route;
use App\Modules\AI\Http\Controllers\Api\AIController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/ai/moderate', [AIController::class, 'moderateContent']);
    Route::post('/ai/analyze-user', [AIController::class, 'analyzeUser']);
    Route::get('/ai/recommendations/similar/{productId}', [AIController::class, 'similarProducts']);
    Route::get('/ai/recommendations/related/{productId}', [AIController::class, 'relatedProducts']);
    Route::get('/ai/recommendations/trending', [AIController::class, 'trendingProducts']);
    Route::get('/ai/recommendations/personalized', [AIController::class, 'personalizedRecommendations']);
    Route::post('/ai/suggest-category', [AIController::class, 'suggestCategory']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/ai/flagged-content', [AIController::class, 'flaggedContent']);
    Route::get('/admin/ai/user-risk-scores', [AIController::class, 'userRiskScores']);
    Route::post('/admin/ai/content/{id}/review', [AIController::class, 'reviewFlaggedContent']);
});

Route::get('/ai/categories/suggest', [AIController::class, 'publicSuggestCategory']);