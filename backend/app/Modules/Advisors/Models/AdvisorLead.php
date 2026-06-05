<?php

namespace App\Modules\Advisors\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvisorLead extends Model
{
    use HasFactory;

    protected $fillable = [
        'advisor_id',
        'shop_id',
        'client_name',
        'client_email',
        'client_phone',
        'product_interest',
        'status',
        'converted_at',
    ];

    protected function casts(): array
    {
        return [
            'converted_at' => 'datetime',
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
