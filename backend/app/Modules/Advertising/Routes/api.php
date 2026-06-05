<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Advertising\Http\Controllers\Api\AdvertisingController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/advertising/campaigns', [AdvertisingController::class, 'campaignsIndex']);
    Route::post('/advertising/campaigns', [AdvertisingController::class, 'createCampaign']);
    Route::put('/advertising/campaigns/{id}', [AdvertisingController::class, 'updateCampaign']);
    Route::get('/advertising/campaigns/{id}/stats', [AdvertisingController::class, 'campaignStats']);
    Route::post('/advertising/campaigns/{campaignId}/ads', [AdvertisingController::class, 'createAd']);
    Route::get('/advertising/ads', [AdvertisingController::class, 'myAds']);
});

Route::get('/advertising/featured', [AdvertisingController::class, 'featuredProducts']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/advertising/campaigns', [AdvertisingController::class, 'adminCampaigns']);
    Route::post('/admin/advertising/campaigns/{id}/approve', [AdvertisingController::class, 'approveCampaign']);
    Route::post('/admin/advertising/campaigns/{id}/pause', [AdvertisingController::class, 'pauseCampaign']);
});