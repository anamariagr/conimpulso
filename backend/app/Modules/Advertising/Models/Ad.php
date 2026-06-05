<?php

namespace App\Modules\Advertising\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'product_id',
        'shop_id',
        'type',
        'title',
        'description',
        'image_url',
        'target_url',
        'status',
        'bid_amount',
        'impressions',
        'clicks',
    ];

    protected function casts(): array
    {
        return [
            'bid_amount' => 'decimal:2',
            'impressions' => 'integer',
            'clicks' => 'integer',
        ];
    }

    public function campaign()
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function product()
    {
        return $this->belongsTo(\App\Modules\Products\Models\Product::class);
    }

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }
}
