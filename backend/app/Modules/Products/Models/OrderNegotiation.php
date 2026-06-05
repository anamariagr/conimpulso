<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class OrderNegotiation extends Model
{
    protected $fillable = [
        'custom_order_id',
        'user_id',
        'content',
        'proposed_budget',
        'proposed_deadline',
        'is_accepted',
    ];

    protected function casts(): array
    {
        return [
            'proposed_budget' => 'decimal:2',
            'proposed_deadline' => 'date',
            'is_accepted' => 'boolean',
        ];
    }

    public function customOrder()
    {
        return $this->belongsTo(CustomOrder::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }
}