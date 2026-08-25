<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductOrder;
use App\Services\ProductOrderService;
use App\Services\SiteSettings;
use App\Services\WompiService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class ProductOrderController extends Controller
{
    // Accepts either a cart-style `items: [{product_id, quantity}, ...]` array, or the
    // legacy single `product_id` + `quantity` pair used by the product detail page.
    private function parseLineItems(Request $request): array|JsonResponse
    {
        if ($request->has('items')) {
            $validator = Validator::make($request->all(), [
                'items' => ['required', 'array', 'min:1'],
                'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
                'items.*.quantity' => ['required', 'integer', 'min:1'],
            ]);

            if ($validator->fails()) {
                return $this->errorResponse('Validation failed', 422, $validator->errors());
            }

            return $request->input('items');
        }

        $validator = Validator::make($request->all(), [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        return [['product_id' => $request->product_id, 'quantity' => $request->quantity]];
    }

    public function wompiInit(Request $request): JsonResponse
    {
        if (!SiteSettings::get('wompi_enabled')) {
            return $this->errorResponse('Wompi no está habilitado', 422);
        }

        $lineItems = $this->parseLineItems($request);
        if ($lineItems instanceof JsonResponse) {
            return $lineItems;
        }

        $extraValidator = Validator::make($request->all(), [
            'contact_phone' => ['nullable', 'string', 'max:30'],
            'delivery_address' => ['nullable', 'string', 'max:500'],
        ]);

        if ($extraValidator->fails()) {
            return $this->errorResponse('Validation failed', 422, $extraValidator->errors());
        }

        $reference = 'PO-' . now()->format('YmdHis') . '-' . Str::random(6);
        $total = 0;
        $user = $request->user();
        $isCart = count($lineItems) > 1;

        foreach ($lineItems as $item) {
            $product = Product::with('shop')->findOrFail($item['product_id']);

            if (!$product->price) {
                return $this->errorResponse("El producto \"{$product->name}\" no tiene un precio definido", 422);
            }

            $unitPrice = $product->unitPriceForQuantity($item['quantity']);
            $lineTotal = round($unitPrice * $item['quantity'], 2);
            $total += $lineTotal;

            ProductOrder::create([
                'buyer_id' => $user->id,
                'product_id' => $product->id,
                'shop_id' => $product->shop_id,
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
                'total_amount' => $lineTotal,
                'payment_method' => 'wompi',
                'reference' => $reference,
                'contact_phone' => $request->contact_phone,
                'delivery_address' => $request->delivery_address,
                'status' => 'pending',
            ]);
        }

        $redirectPath = $isCart
            ? '/dashboard/messages?tab=sent&wompi=1'
            : "/products/{$product->slug}?wompi=1";

        $redirectUrl = rtrim(env('FRONTEND_URL', config('app.url')), '/') . $redirectPath;

        $params = WompiService::checkoutParams($reference, $total, $redirectUrl);

        return $this->successResponse([
            'checkout_url' => 'https://checkout.wompi.co/p/',
            'params' => $params,
        ], 'Checkout de Wompi iniciado');
    }

    public function wompiStatus(Request $request, string $transactionId): JsonResponse
    {
        $data = WompiService::fetchTransaction($transactionId);

        if (!$data) {
            return $this->errorResponse('No se pudo consultar la transacción con Wompi', 502);
        }

        $reference = $data['reference'] ?? null;

        $orders = ProductOrder::with('product')
            ->where('reference', $reference)
            ->where('buyer_id', $request->user()->id)
            ->get();

        if ($orders->isEmpty()) {
            return $this->errorResponse('Orden no encontrada', 404);
        }

        ProductOrderService::resolveGroupFromWompi($reference, $data['status'] ?? '', $transactionId);

        return $this->successResponse($orders->fresh());
    }

    public function codStore(Request $request): JsonResponse
    {
        $lineItems = $this->parseLineItems($request);
        if ($lineItems instanceof JsonResponse) {
            return $lineItems;
        }

        $extraValidator = Validator::make($request->all(), [
            'full_name' => ['required', 'string', 'max:255'],
            'document_id' => ['required', 'string', 'max:30'],
            'contact_phone' => ['required', 'string', 'max:30'],
            'delivery_address' => ['required', 'string', 'max:500'],
        ]);

        if ($extraValidator->fails()) {
            return $this->errorResponse('Validation failed', 422, $extraValidator->errors());
        }

        $user = $request->user();

        // Save whatever was missing on the profile so the next purchase pre-fills automatically.
        $user->fill([
            'document_id' => $user->document_id ?: $request->document_id,
            'address' => $user->address ?: $request->delivery_address,
            'phone' => $user->phone ?: $request->contact_phone,
        ])->save();

        $reference = 'COD-' . now()->format('YmdHis') . '-' . Str::random(6);
        $orders = new Collection();

        foreach ($lineItems as $item) {
            $product = Product::with('shop')->findOrFail($item['product_id']);

            if (!$product->price) {
                return $this->errorResponse("El producto \"{$product->name}\" no tiene un precio definido", 422);
            }

            $unitPrice = $product->unitPriceForQuantity($item['quantity']);

            $orders->push(ProductOrder::create([
                'buyer_id' => $user->id,
                'full_name' => $request->full_name,
                'product_id' => $product->id,
                'shop_id' => $product->shop_id,
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
                'total_amount' => round($unitPrice * $item['quantity'], 2),
                'payment_method' => 'cod',
                'reference' => $reference,
                'contact_phone' => $request->contact_phone,
                'delivery_address' => $request->delivery_address,
                'document_id' => $request->document_id,
                'status' => 'pending_admin_review',
            ]));
        }

        // Stays in 'pending_admin_review' until an admin charges the platform commission —
        // only then is it confirmed and vendor/buyer notified (see adminProcess below).
        return $this->successResponse($orders->fresh(), 'Pedido registrado y en revisión. Te avisamos por correo apenas se confirme.', 201);
    }

    public function adminPendingCount(): JsonResponse
    {
        $count = ProductOrder::where('status', 'pending_admin_review')->count();
        return $this->successResponse(['count' => $count]);
    }

    // Buyer: my own orders (Wompi, pago en casa, cuadrado con el vendedor)
    public function myOrders(Request $request): JsonResponse
    {
        $query = ProductOrder::with(['product', 'shop'])
            ->where('buyer_id', $request->user()->id)
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    // Vendor: incoming orders for products in shops they own (Wompi, pago en casa, cuadrado con el vendedor)
    // Orders still awaiting the admin's commission review are never surfaced here.
    public function vendorOrders(Request $request): JsonResponse
    {
        $shopIds = \App\Modules\Shops\Models\Shop::where('user_id', $request->user()->id)->pluck('id');

        $query = ProductOrder::with(['buyer', 'product', 'shop'])
            ->whereIn('shop_id', $shopIds)
            ->where('status', '!=', 'pending_admin_review')
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    // Admin: unified list of orders (Wompi, pago en casa, cuadrado con el vendedor)
    public function adminIndex(Request $request): JsonResponse
    {
        $query = ProductOrder::with(['buyer', 'product', 'shop'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $orders = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    // Admin: charge the platform commission on a 'pending_admin_review' order (cod or
    // vendor_arranged) and release it — this is what finally notifies vendor/buyer.
    // Groups sibling rows sharing the same checkout reference (a COD cart) so the whole
    // group is released and charged together.
    public function adminProcess(Request $request, int $id): JsonResponse
    {
        $order = ProductOrder::findOrFail($id);

        if ($order->status !== 'pending_admin_review') {
            return $this->errorResponse('Esta solicitud ya fue procesada', 422);
        }

        $validator = Validator::make($request->all(), [
            'commission_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $rate = $request->filled('commission_rate')
            ? (float) $request->commission_rate
            : (float) SiteSettings::get('product_order_commission_rate', 5);

        $group = ProductOrder::where('reference', $order->reference)
            ->where('status', 'pending_admin_review')
            ->get();

        ProductOrderService::releaseFromAdminReview($group, $rate);

        return $this->successResponse($order->fresh(), 'Solicitud procesada: comisión cobrada y enviada al vendedor');
    }

    public function adminUpdateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => ['required', 'in:pending,confirmed,ordered_producer,shipped,delivered,failed,cancelled'],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $order = ProductOrder::findOrFail($id);
        ProductOrderService::updateStatus($order, $request->status);

        return $this->successResponse($order->fresh(), 'Estado actualizado');
    }
}
