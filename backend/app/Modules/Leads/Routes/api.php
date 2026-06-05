<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Leads\Http\Controllers\Api\LeadsController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/leads', [LeadsController::class, 'index']);
    Route::get('/leads/my', [LeadsController::class, 'myLeads']);
    Route::get('/leads/stats', [LeadsController::class, 'stats']);
    Route::get('/leads/{id}', [LeadsController::class, 'show']);
    Route::put('/leads/{id}', [LeadsController::class, 'update']);
    Route::post('/leads/{id}/assign', [LeadsController::class, 'assign']);
    Route::post('/leads/{id}/note', [LeadsController::class, 'addNote']);
});

Route::post('/leads', [LeadsController::class, 'store'])->middleware('throttle:5,1');