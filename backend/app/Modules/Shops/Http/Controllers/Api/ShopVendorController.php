<?php

namespace App\Modules\Shops\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Shops\Models\Shop;
use App\Modules\Shops\Models\ShopRevenue;
use App\Modules\Shops\Models\ShopPromotion;
use App\Modules\Shops\Models\ShopNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopVendorController extends ApiController
{
    public function dashboardStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $stats = [
            'total_sales' => $shop->orders()->count(),
            'total_revenue' => $shop->orders()->sum('total'),
            'pending_orders' => $shop->orders()->where('status', 'pending')->count(),
            'total_products' => $shop->products()->count(),
            'total_views' => $shop->views ?? 0,
            'total_followers' => $shop->followers ?? 0,
            'avg_rating' => $shop->rating ?? 0,
            'total_leads' => $shop->leads()->count(),
            'unread_messages' => $shop->messages()->where('recipient_id', $user->id)->where('is_read', false)->count(),
            'unread_notifications' => ShopNotification::where('shop_id', $shop->id)->unread()->count(),
        ];

        return response()->json(['data' => $stats]);
    }

    public function revenueStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $period = $request->input('period', 'monthly');
        $startDate = match ($period) {
            'daily' => now()->startOfDay(),
            'weekly' => now()->startOfWeek(),
            'monthly' => now()->startOfMonth(),
            'yearly' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $revenues = ShopRevenue::where('shop_id', $shop->id)
            ->where('period_start', '>=', $startDate)
            ->orderBy('period_start')
            ->get();

        $totalRevenue = $revenues->sum('total_revenue');
        $totalOrders = $revenues->sum('total_orders');
        $totalCommission = $revenues->sum('total_commission');
        $netRevenue = $totalRevenue - $totalCommission;

        return response()->json([
            'data' => [
                'period' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => now()->toDateString(),
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_commission' => $totalCommission,
                'net_revenue' => $netRevenue,
                'breakdown' => $revenues,
            ],
        ]);
    }

    public function salesChart(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $days = $request->input('days', 30);
        $startDate = now()->subDays($days)->startOfDay();

        $dailySales = [];
        for ($i = 0; $i < $days; $i++) {
            $date = now()->subDays($i)->startOfDay();
            $nextDate = $date->copy()->addDay();

            $count = $shop->orders()
                ->whereBetween('created_at', [$date, $nextDate])
                ->count();

            $revenue = $shop->orders()
                ->whereBetween('created_at', [$date, $nextDate])
                ->sum('total');

            $dailySales[] = [
                'date' => $date->format('Y-m-d'),
                'orders' => $count,
                'revenue' => $revenue,
            ];
        }

        return response()->json([
            'data' => array_reverse($dailySales),
        ]);
    }

    public function topProducts(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $limit = $request->input('limit', 10);

        $products = $shop->products()
            ->withCount(['orderItems as total_sold' => function ($query) {
                $query->select(\Illuminate\Support\Facades\DB::raw('SUM(quantity)'));
            }])
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get(['id', 'name', 'price', 'image']);

        return response()->json([
            'data' => $products,
        ]);
    }

    public function promotions(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $promotions = ShopPromotion::where('shop_id', $shop->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($promotions);
    }

    public function createPromotion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:percentage,fixed,buy_get,free_shipping',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'usage_limit' => 'nullable|integer|min:1',
            'conditions' => 'nullable|array',
        ]);

        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $promotion = ShopPromotion::create([
            'shop_id' => $shop->id,
            ...$validated,
            'is_active' => true,
        ]);

        return response()->json([
            'data' => $promotion,
            'message' => 'Promoción creada exitosamente',
        ], 201);
    }

    public function updatePromotion(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $promotion = ShopPromotion::where('shop_id', $shop->id)
            ->where('id', $id)
            ->first();

        if (!$promotion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'end_date' => 'sometimes|date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        $promotion->update($validated);

        return response()->json([
            'data' => $promotion,
            'message' => 'Promoción actualizada',
        ]);
    }

    public function deletePromotion(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $promotion = ShopPromotion::where('shop_id', $shop->id)
            ->where('id', $id)
            ->first();

        if (!$promotion) {
            return response()->json(['message' => 'Promoción no encontrada'], 404);
        }

        $promotion->delete();

        return response()->json([
            'message' => 'Promoción eliminada',
        ]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $notifications = ShopNotification::where('shop_id', $shop->id)
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($notifications);
    }

    public function markNotificationRead(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        $notification = ShopNotification::where('shop_id', $shop->id)
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notificación no encontrada'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notificación marcada como leída']);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda aún'], 404);
        }

        ShopNotification::where('shop_id', $shop->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }

    public function unreadNotificationCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['data' => ['count' => 0]]);
        }

        $count = ShopNotification::where('shop_id', $shop->id)
            ->unread()
            ->count();

        return response()->json(['data' => ['count' => $count]]);
    }
}