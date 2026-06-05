<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Services\Http\Controllers\Api\ServiceController;

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('my')->group(function () {
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{id}', [ServiceController::class, 'update']);
        Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
    });

    Route::post('/services/{serviceId}/request', [ServiceController::class, 'requestService']);

    Route::middleware('role:super_admin,admin,moderator')->prefix('admin')->group(function () {
        Route::get('/services', [ServiceController::class, 'adminIndex']);
    });
});