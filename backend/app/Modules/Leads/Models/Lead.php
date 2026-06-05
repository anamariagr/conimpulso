<?php

namespace App\Modules\Leads\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shop_id',
        'product_id',
        'service_id',
        'name',
        'email',
        'phone',
        'company',
        'message',
        'source',
        'status',
        'assigned_to',
        'notes',
        'follow_up_date',
    ];

    protected function casts(): array
    {
        return [
            'follow_up_date' => 'date',
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

    public function product()
    {
        return $this->belongsTo(\App\Modules\Products\Models\Product::class);
    }

    public function service()
    {
        return $this->belongsTo(\App\Modules\Services\Models\Service::class);
    }

    public function assignee()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class, 'assigned_to');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }

    public function scopeQualified($query)
    {
        return $query->where('status', 'qualified');
    }

    public function scopeConverted($query)
    {
        return $query->where('status', 'converted');
    }
}