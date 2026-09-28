<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSupply extends Model
{
    protected $fillable = [
        'product_id',
        'time_entry_id',
        'name',
        'quantity',
        'unit',
        'unit_cost',
        'total_cost',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($supply) {
            $supply->total_cost = round((float) $supply->quantity * (float) $supply->unit_cost, 2);
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function timeEntry()
    {
        return $this->belongsTo(ProductTimeEntry::class, 'time_entry_id');
    }
}
