<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class ProductOrder extends Model
{
    protected $fillable = [
        'buyer_id',
        'full_name',
        'product_id',
        'shop_id',
        'quantity',
        'unit_price',
        'total_amount',
        'payment_method',
        'reference',
        'wompi_transaction_id',
        'contact_phone',
        'delivery_address',
        'document_id',
        'message',
        'status',
        'commission_rate',
        'commission_amount',
        'asked_vendor_at',
        'vendor_confirmed_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'commission_rate' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'quantity' => 'integer',
            'asked_vendor_at' => 'datetime',
            'vendor_confirmed_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function buyer()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'buyer_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }
}
