<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Http\Controllers\Api\AdminUserController;

Route::middleware('auth:sanctum')->prefix('admin/users')->group(function () {
    Route::get('/', [AdminUserController::class, 'index']);
    Route::get('/messaging-stats', [AdminUserController::class, 'messagingStats']);
    Route::get('/{id}', [AdminUserController::class, 'show']);
    Route::put('/{id}', [AdminUserController::class, 'update']);
    Route::post('/{id}/enable-messaging', [AdminUserController::class, 'enableMessaging']);
    Route::post('/{id}/disable-messaging', [AdminUserController::class, 'disableMessaging']);
});
