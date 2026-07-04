<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Model;

class ShopBenefit extends Model
{
    public const BUYER_WHATSAPP_NOTIFICATIONS = 'buyer_whatsapp_notifications';

    protected $fillable = [
        'shop_id',
        'feature_key',
        'is_active',
        'source',
        'granted_by',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function grantedBy()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'granted_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }
}
