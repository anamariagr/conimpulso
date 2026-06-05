<?php

namespace App\Modules\Logistics\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingQuote extends Model
{
    use HasFactory;

    protected $fillable = [
        'origin',
        'destination',
        'weight',
        'dimensions',
        'carrier',
        'price',
        'currency',
        'estimated_days',
        'valid_until',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'float',
            'dimensions' => 'array',
            'price' => 'decimal:2',
            'estimated_days' => 'integer',
            'valid_until' => 'datetime',
        ];
    }
}
