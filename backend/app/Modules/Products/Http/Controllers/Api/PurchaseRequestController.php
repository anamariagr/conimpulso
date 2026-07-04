<?php

namespace App\Modules\Products\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Modules\Messages\Models\Message;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\PurchaseRequest;
use App\Modules\Shops\Models\ShopBenefit;
use App\Services\SiteSettings;
use App\Services\WhatsAppNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PurchaseRequestController extends Controller
{
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

        $pr = PurchaseRequest::create([
            'buyer_id'      => $request->user()->id,
            'product_id'    => $product->id,
            'shop_id'       => $product->shop_id,
            'message'       => $request->message,
            'contact_phone' => $request->contact_phone,
            'quantity'      => $request->quantity ?? 1,
        ]);

        $pr->load(['buyer', 'product', 'shop']);

        $this->notifyWhatsApp($pr);

        $message = $this->sendInterestMessage($pr);

        $pr->setAttribute('message_id', $message?->id);
        $pr->setAttribute('vendor_id', $pr->shop->user_id);

        return $this->successResponse($pr, 'Solicitud enviada. El equipo se pondrá en contacto contigo pronto.', 201);
    }

    private function sendInterestMessage(PurchaseRequest $pr): ?Message
    {
        $vendorId = $pr->shop->user_id;

        // Nothing to message if the shop has no owner, or the buyer is somehow the owner.
        if (!$vendorId || $vendorId === $pr->buyer_id) {
            return null;
        }

        $body = "Estoy interesado en el producto \"{$pr->product->name}\".\n"
            . "Cantidad: {$pr->quantity}.\n\n"
            . $pr->message;

        if ($pr->contact_phone) {
            $body .= "\n\nTeléfono de contacto: {$pr->contact_phone}";
        }

        return Message::create([
            'sender_id' => $pr->buyer_id,
            'receiver_id' => $vendorId,
            'subject' => 'Interés en: ' . $pr->product->name,
            'body' => $body,
        ]);
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

    private function notifyWhatsApp(PurchaseRequest $pr): void
    {
        $text = "🛒 *Nueva solicitud de compra* en ConImpulso\n\n"
            . "📦 Producto: {$pr->product->name}\n"
            . "🏪 Tienda: {$pr->shop->name}\n"
            . "👤 Comprador: {$pr->buyer->name} ({$pr->buyer->email})\n"
            . "📞 Teléfono: " . ($pr->contact_phone ?: 'No indicado') . "\n"
            . "🔢 Cantidad: {$pr->quantity}\n"
            . "💬 Mensaje: {$pr->message}";

        // Admin always gets notified, no exceptions.
        WhatsAppNotifier::send(SiteSettings::get('whatsapp_phone'), $text);

        // Vendor gets notified only if the shop has this benefit enabled, and only about their own product.
        if ($pr->shop->hasBenefit(ShopBenefit::BUYER_WHATSAPP_NOTIFICATIONS) && $pr->shop->phone) {
            WhatsAppNotifier::send($pr->shop->phone, $text);
        }
    }
}
