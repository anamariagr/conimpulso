<?php

namespace App\Modules\Logistics\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PickupRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_id',
        'carrier',
        'scheduled_date',
        'status',
        'pickup_address',
        'contact_phone',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }
}
