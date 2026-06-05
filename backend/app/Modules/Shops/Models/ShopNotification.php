<?php

namespace App\Modules\Shops\Models;

use Illuminate\Database\Eloquent\Model;

class ShopNotification extends Model
{
    protected $fillable = [
        'shop_id',
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public const TYPE_ORDER = 'order';
    public const TYPE_LEAD = 'lead';
    public const TYPE_REVIEW = 'review';
    public const TYPE_MESSAGE = 'message';
    public const TYPE_PAYMENT = 'payment';
    public const TYPE_PROMOTION = 'promotion';
    public const TYPE_SYSTEM = 'system';

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Modules\Auth\Models\User::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }
}