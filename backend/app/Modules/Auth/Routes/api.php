<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Http\Controllers\Api\AuthController;
use App\Modules\Auth\Http\Controllers\Api\PasswordResetController;

Route::prefix('auth')->group(function () {
    // Public routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth'); // 10 per minute

    // Password reset
    Route::post('/password/reset-link', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/password/reset', [PasswordResetController::class, 'reset']);

    // Email verification
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed'])
        ->name('verification.verify');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth management
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
    });
});