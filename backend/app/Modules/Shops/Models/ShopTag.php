<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'tag',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}