<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Wallet\Http\Controllers\Api\WalletController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/wallet', [WalletController::class, 'index']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::get('/wallet/stats', [WalletController::class, 'stats']);
    Route::post('/wallet/top-up', [WalletController::class, 'topUpRequest']);
    Route::get('/wallet/top-ups', [WalletController::class, 'myTopUps']);
    Route::post('/wallet/debit', [WalletController::class, 'debit']);
    Route::post('/wallet/credit', [WalletController::class, 'credit']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/wallet/pending-topups', [WalletController::class, 'pendingTopUps']);
    Route::post('/admin/wallet/topups/{id}/approve', [WalletController::class, 'approveTopUp']);
    Route::get('/admin/wallet/users', [WalletController::class, 'adminListUsers']);
    Route::post('/admin/wallet/users/{userId}/credit', [WalletController::class, 'adminCredit']);
    Route::post('/admin/wallet/users/{userId}/debit', [WalletController::class, 'adminDebit']);
});