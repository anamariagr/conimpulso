<?php

use Illuminate\Support\Facades\Route;
use App\Modules\B2B\Http\Controllers\Api\B2BController;

Route::middleware('auth:sanctum')->group(function () {
    // Business Profiles
    Route::get('/b2b/profiles', [B2BController::class, 'profilesIndex']);
    Route::get('/b2b/my-profile', [B2BController::class, 'myBusinessProfile']);
    Route::post('/b2b/profiles', [B2BController::class, 'createBusinessProfile']);
    Route::put('/b2b/profiles/{id}', [B2BController::class, 'updateBusinessProfile']);

    // B2B Connections
    Route::get('/b2b/connections', [B2BController::class, 'connectionsIndex']);
    Route::get('/b2b/connections/pending', [B2BController::class, 'pendingConnections']);
    Route::post('/b2b/connections', [B2BController::class, 'sendConnectionRequest']);
    Route::post('/b2b/connections/{id}/respond', [B2BController::class, 'respondToConnection']);

    // Supplier Requests
    Route::get('/b2b/supplier-requests', [B2BController::class, 'supplierRequestsIndex']);
    Route::post('/b2b/supplier-requests', [B2BController::class, 'createSupplierRequest']);
    Route::post('/b2b/supplier-requests/{requestId}/quote', [B2BController::class, 'submitQuote']);

    // Negotiations
    Route::get('/b2b/negotiations', [B2BController::class, 'negotiationsIndex']);
    Route::post('/b2b/negotiations', [B2BController::class, 'createNegotiation']);
    Route::get('/b2b/negotiations/{negotiationId}/messages', [B2BController::class, 'negotiationMessages']);
    Route::post('/b2b/negotiations/{negotiationId}/messages', [B2BController::class, 'sendNegotiationMessage']);
    Route::post('/b2b/negotiations/{negotiationId}/agree', [B2BController::class, 'agreeNegotiation']);
});