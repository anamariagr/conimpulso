<?php

namespace App\Modules\Advertising\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_id',
        'name',
        'type',
        'status',
        'budget',
        'daily_budget',
        'spent',
        'start_date',
        'end_date',
        'targeting',
        'impressions',
        'clicks',
        'conversions',
    ];

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'daily_budget' => 'decimal:2',
            'spent' => 'decimal:2',
            'targeting' => 'array',
            'impressions' => 'integer',
            'clicks' => 'integer',
            'conversions' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function shop()
    {
        return $this->belongsTo(\App\Modules\Shops\Models\Shop::class);
    }

    public function ads()
    {
        return $this->hasMany(Ad::class, 'campaign_id');
    }
}
