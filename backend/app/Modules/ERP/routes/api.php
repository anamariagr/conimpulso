<?php

use Illuminate\Support\Facades\Route;
use App\Modules\ERP\Http\Controllers\Api\ERPController;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/erp/connections', [ERPController::class, 'connections']);
    Route::post('/erp/connections', [ERPController::class, 'createConnection']);
    Route::get('/erp/connections/{id}/test', [ERPController::class, 'testConnection']);
    Route::post('/erp/connections/{id}/sync', [ERPController::class, 'syncData']);
    Route::get('/erp/connections/{id}/logs', [ERPController::class, 'syncLogs']);
    Route::get('/erp/available', [ERPController::class, 'availableERPs']);
});