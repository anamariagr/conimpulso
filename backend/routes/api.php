<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Http\Controllers\Api\AuthController;
use App\Modules\Auth\Http\Controllers\Api\PasswordResetController;
use App\Modules\Shops\Http\Controllers\Api\ShopController;
use App\Modules\Shops\Http\Controllers\Api\CategoryController;
use App\Modules\Products\Http\Controllers\Api\ProductController;
use App\Modules\Services\Http\Controllers\Api\ServiceController;
use App\Modules\B2B\Http\Controllers\Api\B2BController;
use App\Modules\Leads\Http\Controllers\Api\LeadsController;
use App\Modules\Messages\Http\Controllers\Api\MessagesController;
use App\Modules\Advisors\Http\Controllers\Api\AdvisorsController;
use App\Modules\Wallet\Http\Controllers\Api\WalletController;
use App\Modules\Logistics\Http\Controllers\Api\LogisticsController;
use App\Modules\Advertising\Http\Controllers\Api\AdvertisingController;
use App\Modules\AI\Http\Controllers\Api\AIController;
use App\Modules\API\Http\Controllers\Api\APIController;
use App\Http\Controllers\Api\MediaUploadController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/password/reset-link', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/password/reset', [PasswordResetController::class, 'reset']);
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->middleware(['signed']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/email/resend', [AuthController::class, 'resendVerification']);
    });
});

// Public routes
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{slug}', [ShopController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);

// Shop vendor dashboard (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/vendor/shop/stats', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'dashboardStats']);
    Route::get('/vendor/shop/revenue', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'revenueStats']);
    Route::get('/vendor/shop/sales-chart', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'salesChart']);
    Route::get('/vendor/shop/top-products', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'topProducts']);
    Route::get('/vendor/shop/promotions', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'promotions']);
    Route::post('/vendor/shop/promotions', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'createPromotion']);
    Route::put('/vendor/shop/promotions/{id}', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'updatePromotion']);
    Route::delete('/vendor/shop/promotions/{id}', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'deletePromotion']);
    Route::get('/vendor/shop/notifications', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'notifications']);
    Route::post('/vendor/shop/notifications/{id}/read', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'markNotificationRead']);
    Route::post('/vendor/shop/notifications/read-all', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'markAllNotificationsRead']);
    Route::get('/vendor/shop/notifications/count', [App\Modules\Shops\Http\Controllers\Api\ShopVendorController::class, 'unreadNotificationCount']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User settings and profile
    Route::get('/user/settings', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'showProfile']);
    Route::put('/user/settings', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'updateProfile']);
    Route::post('/user/verification', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'identityVerificationRequest']);
    Route::get('/user/verification-status', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'getVerificationStatus']);
    Route::get('/user/activity', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'activityHistory']);
    Route::get('/user/notifications/preferences', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'notificationPreferences']);
    Route::put('/user/notifications/preferences', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'updateNotificationPreferences']);
    Route::get('/user/privacy', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'privacySettings']);
    Route::put('/user/privacy', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'updatePrivacySettings']);
    Route::get('/user/sessions', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'activeSessions']);
    Route::delete('/user/sessions/{sessionId}', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'terminateSession']);
    Route::delete('/user/sessions', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'terminateAllSessions']);
    Route::get('/user/export', [App\Modules\Auth\Http\Controllers\Api\UserSettingsController::class, 'exportData']);

    // User import (admin only)
    Route::post('/users/import/template', [App\Modules\Auth\Http\Controllers\Api\UserImportController::class, 'downloadTemplate']);
    Route::post('/users/import', [App\Modules\Auth\Http\Controllers\Api\UserImportController::class, 'import']);

    // User

    // Shops
    Route::get('/my/shop', [ShopController::class, 'myShop']);
    Route::post('/shops', [ShopController::class, 'store']);
    Route::put('/shops/{id}', [ShopController::class, 'update']);
    Route::delete('/shops/{id}', [ShopController::class, 'destroy']);

    // Categories
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Products
    Route::get('/my/products', [ProductController::class, 'myProducts']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Quotations
    Route::get('/quotations', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'index']);
    Route::post('/quotations', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'store']);
    Route::get('/quotations/{id}', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'show']);
    Route::post('/quotations/{id}/proposal', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'sendProposal']);
    Route::post('/quotations/{id}/accept', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'acceptProposal']);
    Route::post('/quotations/{id}/reject', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'rejectProposal']);
    Route::post('/quotations/{id}/message', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'addMessage']);
    Route::get('/quotations/{id}/history', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'quotationHistory']);

    // Shop quotations
    Route::get('/vendor/quotations', [App\Modules\Products\Http\Controllers\Api\QuotationController::class, 'shopQuotations']);

    // Custom orders
    Route::get('/custom-orders', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'index']);
    Route::post('/custom-orders', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'store']);
    Route::get('/custom-orders/{id}', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'show']);
    Route::put('/custom-orders/{id}/requirements', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'updateRequirements']);
    Route::post('/custom-orders/{id}/negotiate', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'startNegotiation']);
    Route::post('/custom-orders/{id}/accept-negotiation', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'acceptNegotiation']);
    Route::post('/custom-orders/{id}/contract', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'sendContract']);
    Route::post('/custom-orders/{id}/production', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'updateProductionStatus']);
    Route::post('/custom-orders/{id}/complete', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'complete']);

    // Shop custom orders
    Route::get('/vendor/custom-orders', [App\Modules\Products\Http\Controllers\Api\CustomOrderController::class, 'shopOrders']);

    // Services
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    // Media Upload
    Route::post('/media/upload', [MediaUploadController::class, 'upload']);
    Route::delete('/media/delete', [MediaUploadController::class, 'delete']);

    // B2B
    Route::get('/b2b/profiles', [B2BController::class, 'profilesIndex']);
    Route::get('/b2b/my-profile', [B2BController::class, 'myBusinessProfile']);
    Route::post('/b2b/profiles', [B2BController::class, 'createBusinessProfile']);
    Route::put('/b2b/profiles/{id}', [B2BController::class, 'updateBusinessProfile']);
    Route::get('/b2b/connections', [B2BController::class, 'connectionsIndex']);
    Route::get('/b2b/connections/pending', [B2BController::class, 'pendingConnections']);
    Route::post('/b2b/connections', [B2BController::class, 'sendConnectionRequest']);
    Route::post('/b2b/connections/{id}/respond', [B2BController::class, 'respondToConnection']);
    Route::get('/b2b/supplier-requests', [B2BController::class, 'supplierRequestsIndex']);
    Route::post('/b2b/supplier-requests', [B2BController::class, 'createSupplierRequest']);
    Route::post('/b2b/supplier-requests/{requestId}/quote', [B2BController::class, 'submitQuote']);
    Route::get('/b2b/negotiations', [B2BController::class, 'negotiationsIndex']);
    Route::post('/b2b/negotiations', [B2BController::class, 'createNegotiation']);
    Route::get('/b2b/negotiations/{negotiationId}/messages', [B2BController::class, 'negotiationMessages']);
    Route::post('/b2b/negotiations/{negotiationId}/messages', [B2BController::class, 'sendNegotiationMessage']);
    Route::post('/b2b/negotiations/{negotiationId}/agree', [B2BController::class, 'agreeNegotiation']);

    // Leads
    Route::get('/leads', [LeadsController::class, 'index']);
    Route::get('/leads/my', [LeadsController::class, 'myLeads']);
    Route::get('/leads/stats', [LeadsController::class, 'stats']);
    Route::get('/leads/{id}', [LeadsController::class, 'show']);
    Route::put('/leads/{id}', [LeadsController::class, 'update']);
    Route::post('/leads/{id}/assign', [LeadsController::class, 'assign']);
    Route::post('/leads/{id}/note', [LeadsController::class, 'addNote']);
    Route::post('/leads', [LeadsController::class, 'store']);

    // Messages
    Route::get('/messages/inbox', [MessagesController::class, 'inbox']);
    Route::get('/messages/sent', [MessagesController::class, 'sent']);
    Route::get('/messages/unread-count', [MessagesController::class, 'unreadCount']);
    Route::get('/messages/{id}', [MessagesController::class, 'show']);
    Route::post('/messages/{id}/read', [MessagesController::class, 'markAsRead']);
    Route::post('/messages/read-all', [MessagesController::class, 'markAllAsRead']);
    Route::post('/messages', [MessagesController::class, 'store']);
    Route::delete('/messages/{id}', [MessagesController::class, 'destroy']);

    // Contact Protection (Messaging)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/protected-messages', [App\Modules\Messages\Http\Controllers\Api\ProtectedMessagesController::class, 'store']);
        Route::get('/contacts/blocked', [App\Modules\Messages\Http\Controllers\Api\ProtectedMessagesController::class, 'blockedContacts']);
        Route::post('/contacts/block', [App\Modules\Messages\Http\Controllers\Api\ProtectedMessagesController::class, 'blockContact']);
        Route::delete('/contacts/block/{userId}', [App\Modules\Messages\Http\Controllers\Api\ProtectedMessagesController::class, 'unblockContact']);
    });

    // Advisors
    Route::get('/advisors/profiles', [AdvisorsController::class, 'profilesIndex']);
    Route::get('/advisors/my-profile', [AdvisorsController::class, 'myProfile']);
    Route::post('/advisors/profiles', [AdvisorsController::class, 'createProfile']);
    Route::put('/advisors/profiles/{id}', [AdvisorsController::class, 'updateProfile']);
    Route::get('/advisors/opportunities', [AdvisorsController::class, 'opportunitiesIndex']);
    Route::post('/advisors/opportunities', [AdvisorsController::class, 'createOpportunity']);
    Route::post('/advisors/apply', [AdvisorsController::class, 'applyToShop']);
    Route::get('/advisors/my-applications', [AdvisorsController::class, 'myApplications']);
    Route::get('/advisors/shop-applications', [AdvisorsController::class, 'shopApplications']);
    Route::post('/advisors/applications/{id}/respond', [AdvisorsController::class, 'respondToApplication']);
    Route::get('/advisors/leads', [AdvisorsController::class, 'myLeads']);
    Route::post('/advisors/leads', [AdvisorsController::class, 'createLead']);
    Route::put('/advisors/leads/{id}/status', [AdvisorsController::class, 'updateLeadStatus']);
    Route::get('/advisors/commissions', [AdvisorsController::class, 'myCommissions']);
    Route::get('/advisors/commissions/stats', [AdvisorsController::class, 'commissionStats']);

    // Wallet
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::get('/wallet/stats', [WalletController::class, 'stats']);
    Route::post('/wallet/top-up', [WalletController::class, 'topUpRequest']);
    Route::get('/wallet/top-ups', [WalletController::class, 'myTopUps']);
    Route::post('/wallet/debit', [WalletController::class, 'debit']);
    Route::post('/wallet/credit', [WalletController::class, 'credit']);

    // Logistics
    Route::get('/logistics/quotes', [LogisticsController::class, 'getQuote']);
    Route::get('/logistics/shipments', [LogisticsController::class, 'myShipments']);
    Route::post('/logistics/shipments', [LogisticsController::class, 'createShipment']);
    Route::get('/logistics/shipments/{trackingNumber}/track', [LogisticsController::class, 'trackShipment']);
    Route::get('/logistics/pickups', [LogisticsController::class, 'myPickupRequests']);
    Route::post('/logistics/pickups', [LogisticsController::class, 'createPickupRequest']);

    // Advertising
    Route::get('/advertising/campaigns', [AdvertisingController::class, 'campaignsIndex']);
    Route::post('/advertising/campaigns', [AdvertisingController::class, 'createCampaign']);
    Route::put('/advertising/campaigns/{id}', [AdvertisingController::class, 'updateCampaign']);
    Route::get('/advertising/campaigns/{id}/stats', [AdvertisingController::class, 'campaignStats']);
    Route::post('/advertising/campaigns/{campaignId}/ads', [AdvertisingController::class, 'createAd']);
    Route::get('/advertising/ads', [AdvertisingController::class, 'myAds']);

    // AI
    Route::post('/ai/moderate', [AIController::class, 'moderateContent']);
    Route::post('/ai/analyze-user', [AIController::class, 'analyzeUser']);
    Route::get('/ai/recommendations/similar/{productId}', [AIController::class, 'similarProducts']);
    Route::get('/ai/recommendations/related/{productId}', [AIController::class, 'relatedProducts']);
    Route::get('/ai/recommendations/trending', [AIController::class, 'trendingProducts']);
    Route::get('/ai/recommendations/personalized', [AIController::class, 'personalizedRecommendations']);
    Route::post('/ai/suggest-category', [AIController::class, 'suggestCategory']);
    Route::get('/ai/categories/suggest', [AIController::class, 'publicSuggestCategory']);

    // API v1
    Route::prefix('v1')->group(function () {
        Route::get('/info', [APIController::class, 'info']);
        Route::get('/products', [APIController::class, 'products']);
        Route::get('/products/{id}', [APIController::class, 'productDetail']);
        Route::get('/shops', [APIController::class, 'shops']);
        Route::get('/shops/{slug}', [APIController::class, 'shopDetail']);
        Route::get('/categories', [APIController::class, 'categories']);
        Route::get('/user', [APIController::class, 'user']);
    });

    // API Keys
    Route::get('/api-keys', [APIController::class, 'myApiKeys']);
    Route::post('/api-keys', [APIController::class, 'createApiKey']);
    Route::delete('/api-keys/{id}', [APIController::class, 'deleteApiKey']);
    Route::get('/api-keys/{id}/stats', [APIController::class, 'apiKeyStats']);

    // Webhooks
    Route::get('/webhooks', [APIController::class, 'myWebhooks']);
    Route::post('/webhooks', [APIController::class, 'registerWebhook']);
    Route::delete('/webhooks/{id}', [APIController::class, 'deleteWebhook']);
    Route::post('/webhooks/{id}/test', [APIController::class, 'testWebhook']);
});

// Public API
Route::get('/advertising/featured', [AdvertisingController::class, 'featuredProducts']);

// Homepage Module Routes (Admin - no auth for testing)
Route::prefix('admin')->group(function () {
    Route::get('/homepage/banners', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'banners']);
    Route::post('/homepage/banners', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'createBanner']);
    Route::put('/homepage/banners/{id}', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'updateBanner']);
    Route::delete('/homepage/banners/{id}', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'deleteBanner']);

    Route::get('/homepage/sections', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'sections']);
    Route::post('/homepage/sections', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'createSection']);
    Route::put('/homepage/sections/{id}', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'updateSection']);
    Route::post('/homepage/sections/reorder', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'reorderSections']);
    Route::delete('/homepage/sections/{id}', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'deleteSection']);

    Route::get('/homepage/layout', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'layout']);
    Route::put('/homepage/layout', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'updateLayout']);
    Route::put('/homepage/layout/sections', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'updateLayoutSections']);

    Route::get('/homepage/available-types', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'availableTypes']);
});

Route::get('/homepage/active', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'activeLayout']);
Route::get('/homepage/banners/active', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'activeBanners']);
Route::get('/homepage/sections/active', [App\Modules\Homepage\Http\Controllers\Api\HomepageController::class, 'activeSections']);