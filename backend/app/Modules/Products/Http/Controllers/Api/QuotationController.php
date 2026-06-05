<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Products\Models\Quotation;
use App\Modules\Products\Models\QuotationMessage;
use App\Modules\Products\Models\CustomOrder;
use App\Modules\Products\Models\OrderNegotiation;
use App\Modules\Products\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuotationController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->input('status');

        $query = Quotation::with(['product', 'shop'])
            ->where('user_id', $user->id);

        if ($status) {
            $query->where('status', $status);
        }

        $quotations = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($quotations);
    }

    public function shopQuotations(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = $user->shops()->first();

        if (!$shop) {
            return response()->json(['message' => 'No tienes tienda'], 404);
        }

        $status = $request->input('status');

        $query = Quotation::with(['product', 'user'])
            ->where('shop_id', $shop->id);

        if ($status) {
            $query->where('status', $status);
        }

        $quotations = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($quotations);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'message' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();
        $product = Product::find($validated['product_id']);

        $quotation = Quotation::create([
            'product_id' => $validated['product_id'],
            'shop_id' => $product->shop_id,
            'user_id' => $user->id,
            'quantity' => $validated['quantity'],
            'message' => $validated['message'] ?? null,
            'status' => Quotation::STATUS_PENDING,
        ]);

        return response()->json([
            'data' => $quotation,
            'message' => 'Cotización enviada exitosamente',
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $quotation = Quotation::with(['product', 'shop', 'user', 'messages.user'])
            ->find($id);

        if (!$quotation) {
            return response()->json(['message' => 'Cotización no encontrada'], 404);
        }

        return response()->json(['data' => $quotation]);
    }

    public function sendProposal(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'unit_price' => 'required|numeric|min:0',
            'message' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();
        $shop = $user->shops()->first();

        $quotation = Quotation::where('id', $id)
            ->where('shop_id', $shop->id)
            ->first();

        if (!$quotation) {
            return response()->json(['message' => 'Cotización no encontrada'], 404);
        }

        $quotation->update([
            'unit_price' => $validated['unit_price'],
            'total_price' => $validated['unit_price'] * $quotation->quantity,
            'status' => Quotation::STATUS_PROPOSAL_SENT,
        ]);

        if (!empty($validated['message'])) {
            QuotationMessage::create([
                'quotation_id' => $quotation->id,
                'user_id' => $user->id,
                'content' => $validated['message'],
            ]);
        }

        return response()->json([
            'data' => $quotation,
            'message' => 'Propuesta enviada',
        ]);
    }

    public function acceptProposal(int $id): JsonResponse
    {
        $quotation = Quotation::find($id);

        if (!$quotation) {
            return response()->json(['message' => 'Cotización no encontrada'], 404);
        }

        $quotation->accept();

        return response()->json([
            'data' => $quotation,
            'message' => 'Propuesta aceptada',
        ]);
    }

    public function rejectProposal(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $quotation = Quotation::find($id);

        if (!$quotation) {
            return response()->json(['message' => 'Cotización no encontrada'], 404);
        }

        $quotation->reject($validated['reason'] ?? null);

        return response()->json([
            'data' => $quotation,
            'message' => 'Propuesta rechazada',
        ]);
    }

    public function addMessage(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'attachment' => 'nullable|file|max:5120',
        ]);

        $user = $request->user();

        $quotation = Quotation::find($id);

        if (!$quotation) {
            return response()->json(['message' => 'Cotización no encontrada'], 404);
        }

        $attachmentPath = null;
        if (!empty($validated['attachment'])) {
            $attachmentPath = $validated['attachment']->store('quotations', 'public');
        }

        $message = QuotationMessage::create([
            'quotation_id' => $quotation->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
            'attachment_path' => $attachmentPath,
        ]);

        return response()->json([
            'data' => $message,
            'message' => 'Mensaje enviado',
        ], 201);
    }

    public function quotationHistory(Request $request): JsonResponse
    {
        $user = $request->user();

        $quotations = Quotation::with(['product', 'shop'])
            ->where('user_id', $user->id)
            ->whereIn('status', [Quotation::STATUS_ACCEPTED, Quotation::STATUS_REJECTED, Quotation::STATUS_EXPIRED])
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json($quotations);
    }
}