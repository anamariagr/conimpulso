<?php

namespace App\Modules\Admin\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Admin\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $notifications = AdminNotification::orderByDesc('created_at')->paginate(30);

        return response()->json($notifications);
    }

    public function markRead(int $id): JsonResponse
    {
        $notification = AdminNotification::find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notificación marcada como leída']);
    }

    public function markAllRead(): JsonResponse
    {
        AdminNotification::where('is_read', false)->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }

    public function unreadCount(): JsonResponse
    {
        $count = AdminNotification::unread()->count();

        return response()->json(['data' => ['count' => $count]]);
    }
}
