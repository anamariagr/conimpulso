<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class QuoteRequestController extends Controller
{
    // Buyer: crear solicitud de cotización
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $product = Product::with('shop')->findOrFail($request->product_id);

        $qr = QuoteRequest::create([
            'buyer_id'   => $request->user()->id,
            'product_id' => $product->id,
            'shop_id'    => $product->shop_id,
            'quantity'   => $request->quantity,
        ]);

        $qr->load(['buyer', 'product', 'shop']);

        return $this->successResponse($qr, 'Solicitud de cotización enviada al vendedor.', 201);
    }

    // Buyer: ver sus solicitudes enviadas
    public function buyerIndex(Request $request): JsonResponse
    {
        $items = QuoteRequest::with(['product', 'shop'])
            ->where('buyer_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse($items);
    }

    // Dueño de tienda: ver cotizaciones de sus tiendas
    public function shopIndex(Request $request): JsonResponse
    {
        $shopIds = $request->user()->shops()->pluck('id');

        $query = QuoteRequest::with(['buyer', 'product', 'shop'])
            ->whereIn('shop_id', $shopIds)
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $this->successResponse($query->get());
    }

    // Dueño de tienda: responder con precio unitario (total se calcula)
    public function shopRespond(Request $request, int $id): JsonResponse
    {
        $shopIds = $request->user()->shops()->pluck('id');

        $qr = QuoteRequest::whereIn('shop_id', $shopIds)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'unit_price' => ['required', 'numeric', 'min:0'],
            'status'     => ['required', 'in:quoted,rejected'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $unitPrice  = (float) $request->unit_price;
        $totalPrice = $request->status === 'quoted' ? $unitPrice * $qr->quantity : null;

        $qr->update([
            'status'      => $request->status,
            'unit_price'  => $request->status === 'quoted' ? $unitPrice : null,
            'total_price' => $totalPrice,
        ]);

        return $this->successResponse($qr->fresh(['buyer', 'product', 'shop']), 'Cotización respondida.');
    }
}
