<?php

namespace App\Modules\Logistics\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'tracking_number',
        'carrier',
        'status',
        'origin_address',
        'destination_address',
        'weight',
        'dimensions',
        'estimated_delivery',
        'actual_delivery',
        'cost',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'float',
            'dimensions' => 'array',
            'cost' => 'decimal:2',
            'estimated_delivery' => 'datetime',
            'actual_delivery' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function trackingEvents()
    {
        return $this->hasMany(TrackingEvent::class, 'shipment_id');
    }
}
