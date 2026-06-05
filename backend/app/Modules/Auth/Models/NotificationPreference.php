<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'channel',
        'type',
        'enabled',
        'quiet_hours_start',
        'quiet_hours_end',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'quiet_hours_start' => 'datetime',
            'quiet_hours_end' => 'datetime',
        ];
    }

    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_PUSH = 'push';
    public const CHANNEL_SMS = 'sms';
    public const CHANNEL_IN_APP = 'in_app';

    public const TYPE_LEADS = 'leads';
    public const TYPE_MESSAGES = 'messages';
    public const TYPE_ORDERS = 'orders';
    public const TYPE_PAYMENTS = 'payments';
    public const TYPE_MARKETING = 'marketing';
    public const TYPE_SECURITY = 'security';
    public const TYPE_PRODUCTS = 'products';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    public function scopeForChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function isInQuietHours(): bool
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }

        $now = now();
        $start = $this->quiet_hours_start;
        $end = $this->quiet_hours_end;

        if ($start <= $end) {
            return $now->between($start, $end);
        }

        return $now->gte($start) || $now->lte($end);
    }
}