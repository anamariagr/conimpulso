<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Model;

class ShopRevenue extends Model
{
    protected $fillable = [
        'shop_id',
        'period',
        'period_start',
        'period_end',
        'total_sales',
        'total_orders',
        'total_revenue',
        'total_commission',
        'net_revenue',
        'top_products',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'total_revenue' => 'decimal:2',
            'total_commission' => 'decimal:2',
            'net_revenue' => 'decimal:2',
            'top_products' => 'array',
        ];
    }

    public const PERIOD_DAILY = 'daily';
    public const PERIOD_WEEKLY = 'weekly';
    public const PERIOD_MONTHLY = 'monthly';
    public const PERIOD_YEARLY = 'yearly';

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}