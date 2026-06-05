<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class CustomOrder extends Model
{
    protected $fillable = [
        'shop_id',
        'user_id',
        'product_id',
        'status',
        'requirements',
        'budget',
        'deadline',
        'negotiation_notes',
        'contract_path',
        'production_status',
        'delivery_date',
    ];

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'budget' => 'decimal:2',
            'deadline' => 'date',
            'delivery_date' => 'date',
        ];
    }

    public const STATUS_DRAFT = 'draft';
    public const STATUS_NEGOTIATION = 'negotiation';
    public const STATUS_CONTRACT_SENT = 'contract_sent';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_IN_PRODUCTION = 'in_production';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function negotiations()
    {
        return $this->hasMany(OrderNegotiation::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_CANCELLED]);
    }
}