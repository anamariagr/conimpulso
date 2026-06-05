<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Logistics\Http\Controllers\Api\LogisticsController;
use App\Modules\Logistics\Http\Controllers\Api\LogisticsAdditionalController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/logistics/quotes', [LogisticsController::class, 'getQuote']);
    Route::get('/logistics/shipments', [LogisticsController::class, 'myShipments']);
    Route::post('/logistics/shipments', [LogisticsController::class, 'createShipment']);
    Route::get('/logistics/shipments/{trackingNumber}/track', [LogisticsController::class, 'trackShipment']);
    Route::get('/logistics/pickups', [LogisticsController::class, 'myPickupRequests']);
    Route::post('/logistics/pickups', [LogisticsController::class, 'createPickupRequest']);

    // Additional services
    Route::get('/logistics/services', [LogisticsAdditionalController::class, 'getServices']);
    Route::post('/logistics/insurance/calculate', [LogisticsAdditionalController::class, 'calculateInsurance']);
    Route::post('/logistics/packaging/calculate', [LogisticsAdditionalController::class, 'calculatePackaging']);
    Route::post('/logistics/security-bag/calculate', [LogisticsAdditionalController::class, 'calculateSecurityBag']);
    Route::post('/logistics/whatsapp/notify', [LogisticsAdditionalController::class, 'sendNotification']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/logistics/shipments/{id}/status', [LogisticsController::class, 'updateShipmentStatus']);
    Route::get('/admin/logistics/shipments', [LogisticsController::class, 'adminShipments']);
    Route::get('/admin/logistics/pending-pickups', [LogisticsController::class, 'adminPendingPickups']);
    Route::post('/admin/logistics/pickups/{id}/assign', [LogisticsController::class, 'assignPickup']);
});