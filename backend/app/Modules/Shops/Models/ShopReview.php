<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'user_id',
        'order_id',
        'rating',
        'comment',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}