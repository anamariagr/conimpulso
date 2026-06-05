<?php

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Negotiation extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'supplier_id',
        'current_price',
        'target_price',
        'status',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'current_price' => 'decimal:2',
            'target_price' => 'decimal:2',
            'finalized_at' => 'datetime',
        ];
    }

    public function request()
    {
        return $this->belongsTo(SupplierRequest::class, 'request_id');
    }

    public function messages()
    {
        return $this->hasMany(NegotiationMessage::class, 'negotiation_id');
    }
}
