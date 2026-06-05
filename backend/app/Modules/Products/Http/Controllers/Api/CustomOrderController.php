<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Products\Models\CustomOrder;
use App\Modules\Products\Models\OrderNegotiation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomOrderController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = CustomOrder::with(['shop', 'product'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($orders);
    }

    public function shopOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda'], 404);
        }

        $orders = CustomOrder::with(['user', 'product'])
            ->where('shop_id', $shop->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($orders);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'product_id' => 'nullable|exists:products,id',
            'requirements' => 'required|array',
            'budget' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date|after:today',
            'message' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();

        $order = CustomOrder::create([
            'shop_id' => $validated['shop_id'],
            'user_id' => $user->id,
            'product_id' => $validated['product_id'] ?? null,
            'requirements' => $validated['requirements'],
            'budget' => $validated['budget'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'status' => CustomOrder::STATUS_DRAFT,
        ]);

        if (!empty($validated['message'])) {
            OrderNegotiation::create([
                'custom_order_id' => $order->id,
                'user_id' => $user->id,
                'content' => $validated['message'],
            ]);
        }

        return response()->json([
            'data' => $order,
            'message' => 'Pedido personalizado creado',
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $order = CustomOrder::with(['shop', 'user', 'product', 'negotiations.user'])
            ->find($id);

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        return response()->json(['data' => $order]);
    }

    public function updateRequirements(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'requirements' => 'sometimes|array',
            'budget' => 'sometimes|nullable|numeric|min:0',
            'deadline' => 'sometimes|nullable|date|after:today',
        ]);

        $user = $request->user();
        $shop = $user->shops()->first();

        $order = CustomOrder::where('id', $id)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $order->update($validated);

        return response()->json([
            'data' => $order,
            'message' => 'Requisitos actualizados',
        ]);
    }

    public function startNegotiation(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'proposed_budget' => 'nullable|numeric|min:0',
            'proposed_deadline' => 'nullable|date|after:today',
            'message' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        $shop = $user->shops()->first();

        $order = CustomOrder::where('id', $id)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $negotiation = OrderNegotiation::create([
            'custom_order_id' => $order->id,
            'user_id' => $user->id,
            'content' => $validated['message'],
            'proposed_budget' => $validated['proposed_budget'] ?? null,
            'proposed_deadline' => $validated['proposed_deadline'] ?? null,
        ]);

        $order->update(['status' => CustomOrder::STATUS_NEGOTIATION]);

        return response()->json([
            'data' => $negotiation,
            'message' => 'Negociación iniciada',
        ], 201);
    }

    public function acceptNegotiation(int $id): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        $negotiation = OrderNegotiation::find($id);

        if (!$negotiation) {
            return response()->json(['message' => 'Negociación no encontrada'], 404);
        }

        $order = $negotiation->customOrder;

        if ($order->shop_id !== $shop->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $negotiation->update(['is_accepted' => true]);

        $order->update([
            'status' => CustomOrder::STATUS_ACCEPTED,
            'budget' => $negotiation->proposed_budget ?? $order->budget,
            'deadline' => $negotiation->proposed_deadline ?? $order->deadline,
        ]);

        return response()->json([
            'data' => $order,
            'message' => 'Negociación aceptada, pedido confirmado',
        ]);
    }

    public function sendContract(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'contract' => 'required|file|max:10240',
        ]);

        $user = $request->user();
        $shop = $user->shops()->first();

        $order = CustomOrder::where('id', $id)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $contractPath = $validated['contract']->store('contracts', 'public');

        $order->update([
            'contract_path' => $contractPath,
            'status' => CustomOrder::STATUS_CONTRACT_SENT,
        ]);

        return response()->json([
            'data' => $order,
            'message' => 'Contrato enviado para aprobación',
        ]);
    }

    public function updateProductionStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'production_status' => 'required|string|max:255',
            'delivery_date' => 'nullable|date',
        ]);

        $user = $request->user();
        $shop = $user->shops()->first();

        $order = CustomOrder::where('id', $id)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $order->update([
            'production_status' => $validated['production_status'],
            'delivery_date' => $validated['delivery_date'] ?? null,
            'status' => CustomOrder::STATUS_IN_PRODUCTION,
        ]);

        return response()->json([
            'data' => $order,
            'message' => 'Estado de producción actualizado',
        ]);
    }

    public function complete(int $id): JsonResponse
    {
        $order = CustomOrder::find($id);

        if (!$order) {
            return response()->json(['message' => 'Pedido no encontrado'], 404);
        }

        $order->update([
            'status' => CustomOrder::STATUS_COMPLETED,
            'delivery_date' => now(),
        ]);

        return response()->json([
            'data' => $order,
            'message' => 'Pedido marcado como completado',
        ]);
    }
}