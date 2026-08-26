<?php

namespace App\Services;

use App\Mail\OrderConfirmationMail;
use App\Modules\Messages\Models\Message;
use App\Modules\Products\Models\ProductOrder;
use App\Modules\Shops\Models\ShopBenefit;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProductOrderService
{
    // A "reference" groups one or more ProductOrder rows created from a single checkout
    // (one product from the product page, or several from the cart) sharing one payment.
    public static function resolveGroupFromWompi(string $reference, string $wompiStatus, string $transactionId): void
    {
        $orders = ProductOrder::where('reference', $reference)->where('status', 'pending')->get();

        if ($orders->isEmpty()) {
            return;
        }

        $orders->each(fn (ProductOrder $order) => $order->update(['wompi_transaction_id' => $transactionId]));

        if ($wompiStatus === 'APPROVED') {
            self::confirmGroup($orders, 'wompi');
        } elseif (in_array($wompiStatus, ['DECLINED', 'VOIDED', 'ERROR'], true)) {
            $orders->each(fn (ProductOrder $order) => $order->update(['status' => 'failed']));
        }
    }

    public static function confirmCodOrder(ProductOrder $order): void
    {
        self::confirmGroup(new Collection([$order]), 'cod');
    }

    public static function confirmCodGroup(Collection $orders): void
    {
        self::confirmGroup($orders, 'cod');
    }

    // Called by the admin after charging the platform commission on a 'pending_admin_review'
    // order (cod or vendor_arranged) — only now do vendor/buyer get notified.
    public static function releaseFromAdminReview(Collection $orders, float $commissionRate): void
    {
        $orders = $orders->filter(fn (ProductOrder $order) => $order->status === 'pending_admin_review');

        if ($orders->isEmpty()) {
            return;
        }

        $orders->each(function (ProductOrder $order) use ($commissionRate) {
            $order->update([
                'commission_rate' => $commissionRate,
                'commission_amount' => round($order->total_amount * $commissionRate / 100, 2),
            ]);
        });

        $context = $orders->first()->payment_method;

        if ($context === 'cod') {
            self::confirmGroup($orders, 'cod');
            return;
        }

        $orders->each(function (ProductOrder $order) {
            $order->update(['status' => 'pending']);
            self::notifyVendor($order->fresh(), 'vendor_arranged');
        });
    }

    // Admin asks the vendor, before charging any commission, whether they can take a
    // 'pending_admin_review' order — only product/quantity is shared, never the buyer's
    // contact info or message, so the vendor can't bypass the platform at this stage.
    public static function askVendor(ProductOrder $order): ?Message
    {
        $order->loadMissing(['buyer', 'product', 'shop']);
        $order->update(['asked_vendor_at' => now()]);

        $text = "📦 *Nueva solicitud de pedido* en ConImpulso\n\n"
            . "Producto: {$order->product->name}\n"
            . "Cantidad: {$order->quantity}\n\n"
            . "¿Puedes tomar este pedido? Ingresa a tu panel de pedidos para confirmar.";

        $vendorId = $order->shop->user_id;
        $message = null;

        if ($vendorId && $vendorId !== $order->buyer_id) {
            $message = Message::create([
                'sender_id' => $order->buyer_id,
                'receiver_id' => $vendorId,
                'subject' => 'Nueva solicitud de pedido: ' . $order->product->name,
                'body' => $text,
            ]);
        }

        if ($order->shop->hasBenefit(ShopBenefit::BUYER_WHATSAPP_NOTIFICATIONS) && $order->shop->phone) {
            WhatsAppNotifier::send($order->shop->phone, $text);
        }

        return $message;
    }

    protected static function confirmGroup(Collection $orders, string $context): void
    {
        $orders = $orders->filter(fn (ProductOrder $order) => in_array($order->status, ['pending', 'confirmed', 'pending_admin_review'], true));

        if ($orders->isEmpty()) {
            return;
        }

        $orders->each(function (ProductOrder $order) {
            if ($order->status !== 'confirmed') {
                $order->update(['status' => 'confirmed', 'paid_at' => now()]);
            }
        });

        $orders = $orders->map(fn (ProductOrder $order) => $order->fresh());

        $orders->each(fn (ProductOrder $order) => self::notifyVendor($order, $context));
        self::notifyBuyer($orders);
    }

    public static function updateStatus(ProductOrder $order, string $status): void
    {
        $order->update(['status' => $status]);
    }

    protected static function notifyVendor(ProductOrder $order, string $context): ?Message
    {
        $order->loadMissing(['buyer', 'product', 'shop']);

        $closing = match ($context) {
            'wompi' => 'El cliente ya pagó a través de la plataforma. Prepara los productos — coordinamos contigo el envío.',
            'cod' => 'El cliente pagará en efectivo cuando reciba el pedido. Prepara los productos y coordinamos contigo la entrega.',
            default => 'El cliente quiere coordinar el pago directamente contigo. Ponte en contacto para acordar precio y forma de pago.',
        };

        $text = "🛒 *Nuevo pedido* en ConImpulso\n\n"
            . "📦 Producto: {$order->product->name}\n"
            . "🔢 Cantidad: {$order->quantity}\n"
            . "👤 Cliente: " . ($order->full_name ?: $order->buyer->name) . " ({$order->buyer->email})\n"
            . ($order->contact_phone ? "📞 Teléfono: {$order->contact_phone}\n" : '')
            . ($order->delivery_address ? "📍 Dirección de entrega: {$order->delivery_address}\n" : '')
            . ($order->message ? "💬 Mensaje del cliente: {$order->message}\n" : '')
            . "\n{$closing}";

        $vendorId = $order->shop->user_id;
        $message = null;

        if ($vendorId && $vendorId !== $order->buyer_id) {
            $message = Message::create([
                'sender_id' => $order->buyer_id,
                'receiver_id' => $vendorId,
                'subject' => 'Nuevo pedido: ' . $order->product->name,
                'body' => $text,
            ]);
        }

        WhatsAppNotifier::send(SiteSettings::get('whatsapp_phone'), $text);

        if ($order->shop->hasBenefit(ShopBenefit::BUYER_WHATSAPP_NOTIFICATIONS) && $order->shop->phone) {
            WhatsAppNotifier::send($order->shop->phone, $text);
        }

        return $message;
    }

    protected static function notifyBuyer(Collection $orders): void
    {
        $orders->each(fn (ProductOrder $order) => $order->loadMissing(['buyer', 'product']));
        $buyer = $orders->first()->buyer;

        try {
            Mail::to($buyer->email)->send(new OrderConfirmationMail($orders));
        } catch (\Throwable $e) {
            Log::warning('Order confirmation email failed: ' . $e->getMessage());
        }
    }
}
