<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Messages\Http\Controllers\Api\MessagesController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messages/inbox', [MessagesController::class, 'inbox']);
    Route::get('/messages/sent', [MessagesController::class, 'sent']);
    Route::get('/messages/unread-count', [MessagesController::class, 'unreadCount']);
    Route::get('/messages/{id}', [MessagesController::class, 'show']);
    Route::post('/messages/{id}/read', [MessagesController::class, 'markAsRead']);
    Route::post('/messages/read-all', [MessagesController::class, 'markAllAsRead']);
    Route::post('/messages', [MessagesController::class, 'store']);
    Route::delete('/messages/{id}', [MessagesController::class, 'destroy']);
});