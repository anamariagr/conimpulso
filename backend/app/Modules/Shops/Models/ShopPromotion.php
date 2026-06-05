<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Model;

class ShopPromotion extends Model
{
    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'type',
        'discount_value',
        'min_purchase',
        'max_discount',
        'start_date',
        'end_date',
        'is_active',
        'usage_limit',
        'usage_count',
        'conditions',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'min_purchase' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
            'conditions' => 'array',
        ];
    }

    public const TYPE_PERCENTAGE = 'percentage';
    public const TYPE_FIXED = 'fixed';
    public const TYPE_BUY_GET = 'buy_get';
    public const TYPE_FREE_SHIPPING = 'free_shipping';

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }
}