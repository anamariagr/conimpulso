<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'order_id',
        'rating',
        'comment',
        'images',
        'is_visible',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'rating' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
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