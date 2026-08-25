<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductOrder;
use App\Modules\Products\Models\PurchaseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class PurchaseRequestController extends Controller
{
    // "Cuadrar pago con el vendedor" — creates a vendor_arranged ProductOrder (unified
    // with Wompi/COD orders in the admin panel) instead of the legacy PurchaseRequest.
    // Stays in 'pending_admin_review' until an admin charges the platform commission —
    // only then is the vendor notified (see ProductOrderController::adminProcess).
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'product_id'    => ['required', 'integer', 'exists:products,id'],
            'message'       => ['required', 'string', 'max:2000'],
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'quantity'      => ['nullable', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $product = Product::with('shop')->findOrFail($request->product_id);
        $quantity = $request->quantity ?? 1;
        $unitPrice = $product->price ? $product->unitPriceForQuantity($quantity) : 0.0;

        $order = ProductOrder::create([
            'buyer_id' => $request->user()->id,
            'product_id' => $product->id,
            'shop_id' => $product->shop_id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_amount' => round($unitPrice * $quantity, 2),
            'payment_method' => 'vendor_arranged',
            'reference' => 'VA-' . now()->format('YmdHis') . '-' . Str::random(6),
            'contact_phone' => $request->contact_phone,
            'message' => $request->message,
            'status' => 'pending_admin_review',
        ]);

        $order->load(['buyer', 'product', 'shop']);
        $order->setAttribute('vendor_id', $order->shop->user_id);

        return $this->successResponse($order, 'Solicitud enviada y en revisión. Te avisaremos apenas el vendedor pueda contactarte.', 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $query = PurchaseRequest::with(['buyer', 'product', 'shop'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $items = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $items->items(),
            'meta'    => [
                'total'        => $items->total(),
                'current_page' => $items->currentPage(),
                'last_page'    => $items->lastPage(),
            ],
        ]);
    }

    public function adminPendingCount(): JsonResponse
    {
        $count = PurchaseRequest::where('status', 'pending')->count();
        return $this->successResponse(['count' => $count]);
    }

    public function adminUpdate(Request $request, int $id): JsonResponse
    {
        $pr = PurchaseRequest::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status'      => ['required', 'in:pending,contacted,closed'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $pr->update($validator->validated());

        return $this->successResponse($pr, 'Solicitud actualizada');
    }
}
