<?php

namespace App\Modules\Advisors\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvisorContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'advisor_id',
        'shop_id',
        'type',
        'commission_rate',
        'status',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate' => 'float',
            'start_date' => 'date',
            'end_date' => 'date',
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

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
