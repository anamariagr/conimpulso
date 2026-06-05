<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Membership\Http\Controllers\Api\MembershipController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/membership/plans', [MembershipController::class, 'plans']);
    Route::get('/membership/my-subscription', [MembershipController::class, 'mySubscription']);
    Route::post('/membership/subscribe', [MembershipController::class, 'subscribe']);
    Route::post('/membership/cancel', [MembershipController::class, 'cancel']);
    Route::get('/membership/benefits', [MembershipController::class, 'benefits']);
});

Route::get('/plans', [MembershipController::class, 'plans']);