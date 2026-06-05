<?php

namespace App\Modules\Advisors\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdvisorApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'advisor_id',
        'shop_id',
        'status',
        'notes',
        'reviewed_at',
        'reviewed_by',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
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

    public function reviewer()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'reviewed_by');
    }
}
