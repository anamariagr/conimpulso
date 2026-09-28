<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Model;

class ProductTimeEntry extends Model
{
    protected $fillable = [
        'product_id',
        'description',
        'minutes',
        'hourly_rate',
        'total_cost',
    ];

    protected function casts(): array
    {
        return [
            'minutes' => 'integer',
            'hourly_rate' => 'decimal:2',
            'total_cost' => 'decimal:2',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($entry) {
            $entry->total_cost = round($entry->minutes / 60 * (float) $entry->hourly_rate, 2);
        });
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function supplies()
    {
        return $this->hasMany(ProductSupply::class, 'time_entry_id');
    }
}
