<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Advisors\Http\Controllers\Api\AdvisorsController;

Route::middleware('auth:sanctum')->group(function () {
    // Advisor Profiles
    Route::get('/advisors/profiles', [AdvisorsController::class, 'profilesIndex']);
    Route::get('/advisors/my-profile', [AdvisorsController::class, 'myProfile']);
    Route::post('/advisors/profiles', [AdvisorsController::class, 'createProfile']);
    Route::put('/advisors/profiles/{id}', [AdvisorsController::class, 'updateProfile']);

    // Opportunities
    Route::get('/advisors/opportunities', [AdvisorsController::class, 'opportunitiesIndex']);
    Route::post('/advisors/opportunities', [AdvisorsController::class, 'createOpportunity']);

    // Applications
    Route::post('/advisors/apply', [AdvisorsController::class, 'applyToShop']);
    Route::get('/advisors/my-applications', [AdvisorsController::class, 'myApplications']);

    // Shop: View and respond to applications
    Route::get('/advisors/shop-applications', [AdvisorsController::class, 'shopApplications']);
    Route::post('/advisors/applications/{id}/respond', [AdvisorsController::class, 'respondToApplication']);

    // Leads
    Route::get('/advisors/leads', [AdvisorsController::class, 'myLeads']);
    Route::post('/advisors/leads', [AdvisorsController::class, 'createLead']);
    Route::put('/advisors/leads/{id}/status', [AdvisorsController::class, 'updateLeadStatus']);

    // Commissions
    Route::get('/advisors/commissions', [AdvisorsController::class, 'myCommissions']);
    Route::get('/advisors/commissions/stats', [AdvisorsController::class, 'commissionStats']);
});