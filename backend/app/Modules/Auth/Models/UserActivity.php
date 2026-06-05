<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type',
        'description',
        'ip_address',
        'user_agent',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public const TYPE_LOGIN = 'login';
    public const TYPE_LOGOUT = 'logout';
    public const TYPE_PROFILE_UPDATE = 'profile_update';
    public const TYPE_PASSWORD_CHANGE = 'password_change';
    public const TYPE_SHOP_CREATE = 'shop_create';
    public const TYPE_PRODUCT_CREATE = 'product_create';
    public const TYPE_ORDER_PLACED = 'order_placed';
    public const TYPE_MESSAGE_SENT = 'message_sent';
    public const TYPE_LEAD_CREATED = 'lead_created';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}