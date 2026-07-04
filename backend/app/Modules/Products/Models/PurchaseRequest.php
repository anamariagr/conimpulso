<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    protected $fillable = [
        'buyer_id', 'product_id', 'shop_id',
        'message', 'contact_phone', 'quantity',
        'status', 'admin_notes',
    ];

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
