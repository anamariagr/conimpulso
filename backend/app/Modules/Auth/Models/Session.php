<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'device_type',
        'device_name',
        'last_activity_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'last_activity_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('expires_at', '>', now());
    }

    public function scopeRecent($query, $minutes = 30)
    {
        return $query->where('last_activity_at', '>=', now()->subMinutes($minutes));
    }

    public function isCurrentSession(): bool
    {
        return $this->id === session()->getId();
    }

    public function terminate(): void
    {
        $this->update(['is_active' => false]);
    }

    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', now())->update(['is_active' => false]);
    }
}