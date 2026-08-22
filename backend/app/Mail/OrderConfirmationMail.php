<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $orders;

    public function __construct(Collection $orders)
    {
        $this->orders = $orders->each(fn ($order) => $order->loadMissing(['product', 'shop']));
    }

    public function build(): self
    {
        $first = $this->orders->first();
        $subject = $this->orders->count() > 1
            ? '¡Tu compra fue exitosa! - ' . $this->orders->count() . ' productos'
            : '¡Tu compra fue exitosa! - ' . $first->product->name;

        return $this->subject($subject)
            ->view('emails.order-confirmation')
            ->with([
                'orders' => $this->orders,
                'total' => $this->orders->sum('total_amount'),
                'reference' => $first->reference ?? $first->id,
                'paymentMethod' => $first->payment_method,
            ]);
    }
}
