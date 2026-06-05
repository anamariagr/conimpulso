<?php

namespace App\Modules\B2B\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_id',
        'category_id',
        'title',
        'description',
        'quantity',
        'unit',
        'budget',
        'delivery_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'delivery_date' => 'date',
        ];
    }

    public function requester()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'requester_id');
    }

    public function quotes()
    {
        return $this->hasMany(SupplierQuote::class, 'request_id');
    }
}
