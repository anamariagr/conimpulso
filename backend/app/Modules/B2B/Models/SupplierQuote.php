<?php

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierQuote extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'supplier_id',
        'price',
        'unit',
        'valid_until',
        'notes',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'valid_until' => 'datetime',
        ];
    }

    public function request()
    {
        return $this->belongsTo(SupplierRequest::class, 'request_id');
    }

    public function supplier()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'supplier_id');
    }
}
