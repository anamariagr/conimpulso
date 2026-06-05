<?php

namespace App\Modules\Advisors\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvisorCommission extends Model
{
    use HasFactory;

    protected $fillable = [
        'advisor_id',
        'shop_id',
        'lead_id',
        'amount',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function advisor()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'advisor_id');
    }

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }
}
